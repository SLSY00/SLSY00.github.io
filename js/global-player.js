(function () {
  if (window.__globalPlayerLoaded) return;
  window.__globalPlayerLoaded = true;

  var cfg = window.GLOBAL_PLAYER_CONFIG || {};
  if (!cfg.enabled) return;

  function boot(tries) {
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

    var root = document.createElement('div');
    root.id = 'global-aplayer-wrap';
    root.innerHTML = '<div id="global-aplayer"></div>';
    document.body.appendChild(root);

    new APlayer({
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(0); }, { once: true });
  } else {
    boot(0);
  }
})();
