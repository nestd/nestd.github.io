// To add a photo: put a full-size (max ~1800px) and thumb (~640px) in images/hero/ and add a line here.
// Photos with hero:true rotate at the top of the page. All photos appear in the grid.
var PHOTOS = [
  { src: "images/hero/01.jpg", thumb: "images/hero/01-thumb.jpg", alt: "Photo of Karen (1 of 8)", caption: "", hero: true },
  { src: "images/hero/02.jpg", thumb: "images/hero/02-thumb.jpg", alt: "Photo of Karen (2 of 8)", caption: "", hero: true },
  { src: "images/hero/03.jpg", thumb: "images/hero/03-thumb.jpg", alt: "Photo of Karen (3 of 8)", caption: "", hero: true },
  { src: "images/hero/04.jpg", thumb: "images/hero/04-thumb.jpg", alt: "Photo of Karen (4 of 8)", caption: "", hero: true },
  { src: "images/hero/05.jpg", thumb: "images/hero/05-thumb.jpg", alt: "Photo of Karen (5 of 8)", caption: "", hero: true },
  { src: "images/hero/06.jpg", thumb: "images/hero/06-thumb.jpg", alt: "Photo of Karen (6 of 8)", caption: "", hero: true },
  { src: "images/hero/07.jpg", thumb: "images/hero/07-thumb.jpg", alt: "Photo of Karen (7 of 8)", caption: "", hero: true },
  { src: "images/hero/08.jpg", thumb: "images/hero/08-thumb.jpg", alt: "Photo of Karen (8 of 8)", caption: "", hero: true }
];

(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- hero carousel ----
  var heroes = PHOTOS.filter(function (p) { return p.hero; });
  var stage = document.getElementById("stage"), hi = 0, timer;
  heroes.forEach(function (p, i) {
    var im = document.createElement("img");
    im.src = p.src; im.alt = p.alt || ""; if (i) im.loading = "lazy";
    stage.appendChild(im);
  });
  var slides = stage.children;
  function go(n) {
    if (!slides.length) return;
    slides[hi].classList.remove("on");
    hi = (n + slides.length) % slides.length;
    slides[hi].classList.add("on");
  }
  function play() { if (!reduce && slides.length > 1) { clearInterval(timer); timer = setInterval(function () { go(hi + 1); }, 6000); } }
  document.getElementById("hero-prev").onclick = function () { go(hi - 1); play(); };
  document.getElementById("hero-next").onclick = function () { go(hi + 1); play(); };
  go(0); play();
  var hero = stage.parentNode;
  hero.addEventListener("mouseenter", function () { clearInterval(timer); });
  hero.addEventListener("mouseleave", play);
  var sx = null;
  hero.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener("touchend", function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) { go(hi + (dx < 0 ? 1 : -1)); play(); }
  });

  // ---- grid + lightbox ----
  var grid = document.getElementById("gallery"), lb = document.getElementById("lightbox"),
      limg = document.getElementById("lb-img"), cap = document.getElementById("lb-cap"), cur = 0;
  PHOTOS.forEach(function (p, i) {
    var b = document.createElement("button"), t = document.createElement("img");
    t.src = p.thumb || p.src; t.alt = p.alt || ""; t.loading = "lazy";
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
