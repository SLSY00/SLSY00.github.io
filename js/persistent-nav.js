(function () {
  if (window.__persistentNavLoaded) return;
  window.__persistentNavLoaded = true;

  var navigating = false;

  function emit(name, detail) {
    if (window.SiteNavHooks && typeof window.SiteNavHooks.emit === "function") {
      window.SiteNavHooks.emit(name, detail);
      return;
    }
    window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  function isSameOrigin(url) {
    try {
      var u = new URL(url, window.location.href);
      return u.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  function shouldHandleLink(a) {
    if (!a || !a.href) return false;
    if (!isSameOrigin(a.href)) return false;
    if (a.hasAttribute("download")) return false;
    if ((a.getAttribute("target") || "").toLowerCase() === "_blank") return false;
    var href = a.getAttribute("href") || "";
    if (!href || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;

    var next = new URL(a.href, window.location.href);
    var curr = new URL(window.location.href);
    // Pure hash jump should stay native.
    if (next.pathname === curr.pathname && next.search === curr.search && next.hash) return false;
    return true;
  }

  function executeScriptsIn(root) {
    if (!root) return;
    var scripts = root.querySelectorAll("script");
    scripts.forEach(function (oldScript) {
      var newScript = document.createElement("script");
      for (var i = 0; i < oldScript.attributes.length; i++) {
        var attr = oldScript.attributes[i];
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  function navigate(url, push) {
    if (navigating) return;
    navigating = true;
    emit("site:navigate:start", { url: url, push: push !== false });
    if (window.NProgress) window.NProgress.start();

    fetch(url, { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("Fetch failed");
        return res.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var nextDoc = parser.parseFromString(html, "text/html");
        var nextHeader = nextDoc.querySelector("header");
        var nextMain = nextDoc.querySelector("main");
        var currHeader = document.querySelector("header");
        var currMain = document.querySelector("main");

        if (!nextHeader || !nextMain || !currHeader || !currMain) {
          window.location.href = url;
          return;
        }

        document.title = nextDoc.title || document.title;
        currHeader.replaceWith(nextHeader);
        currMain.replaceWith(nextMain);

        executeScriptsIn(nextHeader);
        executeScriptsIn(nextMain);

        if (push !== false) {
          window.history.pushState({ pjax: true }, "", url);
        }
        window.scrollTo(0, 0);
        emit("site:navigate:done", { url: url, push: push !== false, pjax: true });
      })
      .catch(function () {
        emit("site:navigate:error", { url: url });
        window.location.href = url;
      })
      .finally(function () {
        navigating = false;
        if (window.NProgress) window.NProgress.done();
      });
  }

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!shouldHandleLink(a)) return;
    e.preventDefault();
    navigate(a.href, true);
  });

  window.addEventListener("popstate", function () {
    navigate(window.location.href, false);
  });

  // Fire once on first load so all modules can use the same hook entry.
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        emit("site:navigate:done", { url: window.location.href, initial: true, pjax: false });
      },
      { once: true }
    );
  } else {
    emit("site:navigate:done", { url: window.location.href, initial: true, pjax: false });
  }
})();
