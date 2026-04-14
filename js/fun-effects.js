/* Fun effects: cursor trail, click hearts, and lightweight background particles */
(function () {
  if (window.__funEffectsLoaded) return;
  window.__funEffectsLoaded = true;

  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  if (prefersReducedMotion) return;

  function injectStyle(css) {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  injectStyle(
    ".fx-dot,.fx-ring{position:fixed;left:0;top:0;pointer-events:none;z-index:9999;transform:translate(-50%,-50%)}" +
      ".fx-dot{width:6px;height:6px;border-radius:50%;background:#39d2ff;box-shadow:0 0 10px rgba(57,210,255,.9)}" +
      ".fx-ring{width:24px;height:24px;border-radius:50%;border:1px solid rgba(57,210,255,.65);box-shadow:0 0 16px rgba(57,210,255,.35)}" +
      ".fx-heart{position:fixed;left:0;top:0;pointer-events:none;z-index:9999;font-size:16px;font-weight:700;animation:fx-heart-up .85s ease-out forwards}" +
      "@keyframes fx-heart-up{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-150%) scale(1.35)}}"
  );

  if (!isTouch) {
    var dot = document.createElement("div");
    var ring = document.createElement("div");
    dot.className = "fx-dot";
    ring.className = "fx-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX = mouseX;
    var ringY = mouseY;

    window.addEventListener(
      "mousemove",
      function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = "translate(" + mouseX + "px," + mouseY + "px)";
      },
      { passive: true }
    );

    (function animate() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = "translate(" + ringX + "px," + ringY + "px)";
      requestAnimationFrame(animate);
    })();
  }

  document.addEventListener(
    "click",
    function (e) {
      var heart = document.createElement("div");
      heart.className = "fx-heart";
      heart.textContent = Math.random() > 0.5 ? "❤" : "✦";
      heart.style.left = e.clientX + "px";
      heart.style.top = e.clientY + "px";
      heart.style.color = "hsl(" + Math.floor(Math.random() * 360) + " 85% 62%)";
      document.body.appendChild(heart);
      setTimeout(function () {
        heart.remove();
      }, 900);
    },
    { passive: true }
  );

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.zIndex = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.opacity = isTouch ? "0.2" : "0.35";
  document.body.appendChild(canvas);

  var ctx = canvas.getContext("2d");
  var points = [];
  var maxPoints = isTouch ? 24 : 42;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initPoints() {
    points = [];
    for (var i = 0; i < maxPoints; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(70, 170, 255, 0.75)";
      ctx.fill();
    }

    for (var a = 0; a < points.length; a++) {
      for (var b = a + 1; b < points.length; b++) {
        var pa = points[a];
        var pb = points[b];
        var dx = pa.x - pb.x;
        var dy = pa.y - pb.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 105) {
          var alpha = (1 - dist / 105) * 0.26;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.strokeStyle = "rgba(80, 180, 255, " + alpha.toFixed(3) + ")";
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(tick);
  }

  resize();
  initPoints();
  window.addEventListener("resize", function () {
    resize();
    initPoints();
  });
  requestAnimationFrame(tick);
})();
