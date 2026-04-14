<link rel="stylesheet" class="aplayer-secondary-style-marker" href="\assets\css\APlayer.min.css"><script src="\assets\js\APlayer.min.js" class="aplayer-secondary-script-marker"></script><script class="meting-secondary-script-marker" src="\assets\js\Meting.min.js"></script>/* Fun effects: cursor trail, click symbols/confetti, and lightweight background particles */
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

  var confettiCanvas = document.createElement("canvas");
  confettiCanvas.setAttribute("aria-hidden", "true");
  confettiCanvas.style.position = "fixed";
  confettiCanvas.style.inset = "0";
  confettiCanvas.style.pointerEvents = "none";
  confettiCanvas.style.zIndex = "9998";
  document.body.appendChild(confettiCanvas);
  var cctx = confettiCanvas.getContext("2d");
  var confettiPool = [];

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function burstConfetti(x, y) {
    for (var i = 0; i < 22; i++) {
      var angle = (Math.PI * 2 * i) / 22 + (Math.random() - 0.5) * 0.35;
      var speed = 2.2 + Math.random() * 3.5;
      confettiPool.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        life: 48 + Math.floor(Math.random() * 28),
        size: 3 + Math.random() * 4,
        color: "hsl(" + Math.floor(Math.random() * 360) + " 90% 60%)"
      });
    }
  }

  function drawConfetti() {
    if (confettiPool.length === 0) return;
    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (var i = confettiPool.length - 1; i >= 0; i--) {
      var p = confettiPool[i];
      p.vy += 0.08;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;

      cctx.fillStyle = p.color;
      cctx.globalAlpha = Math.max(0, p.life / 70);
      cctx.fillRect(p.x, p.y, p.size, p.size * 0.7);

      if (p.life <= 0 || p.y > confettiCanvas.height + 20) {
        confettiPool.splice(i, 1);
      }
    }
    cctx.globalAlpha = 1;
  }

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

    (function animateCursor() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = "translate(" + ringX + "px," + ringY + "px)";
      requestAnimationFrame(animateCursor);
    })();
  }

  document.addEventListener(
    "click",
    function (e) {
      var heart = document.createElement("div");
      heart.className = "fx-heart";
      heart.textContent = Math.random() > 0.5 ? "*" : "+";
      heart.style.left = e.clientX + "px";
      heart.style.top = e.clientY + "px";
      heart.style.color = "hsl(" + Math.floor(Math.random() * 360) + " 85% 62%)";
      document.body.appendChild(heart);
      setTimeout(function () {
        heart.remove();
      }, 900);

      burstConfetti(e.clientX, e.clientY);
    },
    { passive: true }
  );

  var bgCanvas = document.createElement("canvas");
  bgCanvas.setAttribute("aria-hidden", "true");
  bgCanvas.style.position = "fixed";
  bgCanvas.style.inset = "0";
  bgCanvas.style.zIndex = "0";
  bgCanvas.style.pointerEvents = "none";
  bgCanvas.style.opacity = isTouch ? "0.2" : "0.35";
  document.body.appendChild(bgCanvas);

  var bctx = bgCanvas.getContext("2d");
  var points = [];
  var maxPoints = isTouch ? 24 : 42;

  function resizeBg() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }

  function initPoints() {
    points = [];
    for (var i = 0; i < maxPoints; i++) {
      points.push({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55
      });
    }
  }

  function tick() {
    bctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > bgCanvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;

      bctx.beginPath();
      bctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      bctx.fillStyle = "rgba(70, 170, 255, 0.75)";
      bctx.fill();
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
          bctx.beginPath();
          bctx.moveTo(pa.x, pa.y);
          bctx.lineTo(pb.x, pb.y);
          bctx.strokeStyle = "rgba(80, 180, 255, " + alpha.toFixed(3) + ")";
          bctx.stroke();
        }
      }
    }

    drawConfetti();
    requestAnimationFrame(tick);
  }

  resizeBg();
  resizeConfettiCanvas();
  initPoints();
  window.addEventListener("resize", function () {
    resizeBg();
    resizeConfettiCanvas();
    initPoints();
  });
  requestAnimationFrame(tick);
})();
