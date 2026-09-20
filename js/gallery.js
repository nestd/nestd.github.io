// Shared by every page. Reads window.PHOTOS (set by a js/photos-*.js file).
// Optional hero carousel (#stage) shows photos with hero:true; grid (#gallery) shows all.
(function () {
  var PHOTOS = window.PHOTOS || [];
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- hero carousel ----
  var stage = document.getElementById("stage");
  if (stage) {
    var heroes = PHOTOS.filter(function (p) { return p.hero; }), hi = 0, timer;
    heroes.forEach(function (p, i) {
      var im = document.createElement("img");
      im.src = p.src; im.alt = p.alt || ""; if (i) im.loading = "lazy";
      stage.appendChild(im);
    });
    var slides = stage.children;
    var go = function (n) {
      if (!slides.length) return;
      slides[hi].classList.remove("on");
      hi = (n + slides.length) % slides.length;
      slides[hi].classList.add("on");
    };
    var play = function () {
      clearInterval(timer);
      if (!reduce && slides.length > 1) timer = setInterval(function () { go(hi + 1); }, 6000);
    };
    document.getElementById("hero-prev").onclick = function () { go(hi - 1); play(); };
    document.getElementById("hero-next").onclick = function () { go(hi + 1); play(); };
    go(0); play();
    var hero = stage.parentNode, sx = null;
    hero.addEventListener("mouseenter", function () { clearInterval(timer); });
    hero.addEventListener("mouseleave", play);
    hero.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { go(hi + (dx < 0 ? 1 : -1)); play(); }
    });
  }

  // ---- grid + lightbox ----
  var grid = document.getElementById("gallery"), lb = document.getElementById("lightbox");
  if (!grid || !lb) return;
  var limg = document.getElementById("lb-img"), cap = document.getElementById("lb-cap"), cur = 0;
  PHOTOS.forEach(function (p, i) {
    var b = document.createElement("button"), t = document.createElement("img");
    t.src = p.thumb || p.src; t.alt = p.alt || "";
    if (p.w && p.h) { t.width = p.w; t.height = p.h; }
    b.appendChild(t); b.onclick = function () { show(i); }; grid.appendChild(b);
  });
  function show(i) {
    cur = (i + PHOTOS.length) % PHOTOS.length;
    limg.src = PHOTOS[cur].src; limg.alt = PHOTOS[cur].alt || ""; cap.textContent = PHOTOS[cur].caption || "";
    lb.hidden = false;
  }
  function close() { lb.hidden = true; }
  lb.querySelector(".lb-close").onclick = close;
  lb.querySelector(".lb-prev").onclick = function () { show(cur - 1); };
  lb.querySelector(".lb-next").onclick = function () { show(cur + 1); };
  lb.onclick = function (e) { if (e.target === lb) close(); };
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });
})();
