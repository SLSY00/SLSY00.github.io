(function () {
  if (window.__persistentNavLoaded) return;
  window.__persistentNavLoaded = true;

  var navigating = false;

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

  function refreshTheme() {
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
  }

  function navigate(url, push) {
    if (navigating) return;
    navigating = true;
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
        refreshTheme();

        if (push !== false) {
          window.history.pushState({ pjax: true }, "", url);
        }
        window.scrollTo(0, 0);
      })
      .catch(function () {
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
})();
