(function () {
  if (window.__globalPlayerLoaded) return;
  window.__globalPlayerLoaded = true;

  var initialized = false;
  var cfg = window.GLOBAL_PLAYER_CONFIG || {};
  if (!cfg.enabled) return;

  var STORAGE_KEY = 'global_aplayer_state_v1';

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var state = JSON.parse(raw);
      if (!state || typeof state !== 'object') return null;
      return state;
    } catch (e) {
      return null;
    }
  }

  function saveState(player) {
    if (!player || !player.audio) return;
    try {
      var idx = player.list && typeof player.list.index === 'number' ? player.list.index : 0;
      var state = {
        index: idx,
        time: Number(player.audio.currentTime || 0),
        paused: !!player.paused,
        updatedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function boot(tries) {
    if (initialized) return;

    if (typeof window.APlayer !== 'function') {
      if ((tries || 0) < 12) {
        setTimeout(function () {
          boot((tries || 0) + 1);
        }, 250);
      }
      return;
    }

    if (!Array.isArray(cfg.audio) || cfg.audio.length === 0) return;
    if (document.getElementById('global-aplayer')) return;
    initialized = true;

    var root = document.createElement('div');
    root.id = 'global-aplayer-wrap';
    root.innerHTML = '<div id="global-aplayer"></div>';
    document.body.appendChild(root);

    var saved = loadState();

    var player = new APlayer({
      container: document.getElementById('global-aplayer'),
      fixed: !!cfg.fixed,
      mini: !!cfg.mini,
      autoplay: !!cfg.autoplay,
      theme: cfg.theme || '#4f9cff',
      loop: cfg.loop || 'all',
      order: cfg.order || 'list',
      preload: cfg.preload || 'metadata',
      volume: typeof cfg.volume === 'number' ? cfg.volume : 0.6,
      mutex: cfg.mutex !== false,
      lrcType: typeof cfg.lrcType === 'number' ? cfg.lrcType : 0,
      listFolded: cfg.listFolded !== false,
      listMaxHeight: cfg.listMaxHeight || '220px',
      audio: cfg.audio
    });

    // Restore previous track and progress on each new page load.
    if (saved) {
      var restoreIndex = Number(saved.index || 0);
      var restoreTime = Number(saved.time || 0);

      if (restoreIndex >= 0 && restoreIndex < cfg.audio.length && player.list && typeof player.list.switch === 'function') {
        try {
          player.list.switch(restoreIndex);
        } catch (e) {}
      }

      if (restoreTime > 0) {
        setTimeout(function () {
          try {
            if (typeof player.seek === 'function') {
              player.seek(restoreTime);
            } else if (player.audio) {
              player.audio.currentTime = restoreTime;
            }
          } catch (e) {}
        }, 250);
      }
    }

    var lastSaveAt = 0;
    function saveStateThrottled() {
      var now = Date.now();
      if (now - lastSaveAt < 1000) return;
      lastSaveAt = now;
      saveState(player);
    }

    if (typeof player.on === 'function') {
      player.on('timeupdate', saveStateThrottled);
      player.on('play', saveStateThrottled);
      player.on('pause', saveStateThrottled);
      player.on('listswitch', saveStateThrottled);
      player.on('ended', saveStateThrottled);
    }

    window.addEventListener('beforeunload', function () {
      saveState(player);
    });

    // Browsers may block autoplay. Fallback: play once on first user interaction.
    function tryPlayOnce() {
      if (!player || typeof player.play !== 'function') return;
      try {
        player.play();
      } catch (e) {}
      document.removeEventListener('click', tryPlayOnce, true);
      document.removeEventListener('keydown', tryPlayOnce, true);
      document.removeEventListener('touchstart', tryPlayOnce, true);
    }

    var shouldAutoResume = !!cfg.autoplay || (saved && saved.paused === false);
    if (shouldAutoResume) {
      document.addEventListener('click', tryPlayOnce, true);
      document.addEventListener('keydown', tryPlayOnce, true);
      document.addEventListener('touchstart', tryPlayOnce, true);
    }
  }

  // Preferred init entry: unified navigation done hook (initial load).
  window.addEventListener('site:navigate:done', function (e) {
    if (initialized) return;
    if (e && e.detail && e.detail.initial) {
      boot(0);
    }
  });

  // Fallback for cases where hook script is unavailable.
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        setTimeout(function () {
          if (!initialized) boot(0);
        }, 0);
      },
      { once: true }
    );
  } else {
    setTimeout(function () {
      if (!initialized) boot(0);
    }, 0);
  }
})();
