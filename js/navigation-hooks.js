(function () {
  if (window.__navigationHooksLoaded) return;
  window.__navigationHooksLoaded = true;

  window.SiteNavHooks = window.SiteNavHooks || {};

  window.SiteNavHooks.emit = function (name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  };

  window.SiteNavHooks.onDone = function (fn) {
    window.addEventListener("site:navigate:done", fn);
  };

  // Unified place for page refresh logic after partial navigation.
  window.SiteNavHooks.onDone(function () {
    try {
      if (window.Fluid && Fluid.boot) {
        if (typeof Fluid.boot.registerEvents === "function") {
          Fluid.boot.registerEvents();
        }
        if (typeof Fluid.boot.refresh === "function") {
          Fluid.boot.refresh();
        }
      }
    } catch (e) {}
  });
})();
