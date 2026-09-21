/* ============================================================
   Zahir MJ Property — Halaman Butiran Hartanah (interaksi)
   Galeri + lightbox, tab berpaut, akordion mobil, header/drawer,
   bar hubungi mobil. Tiada kebergantungan luar.
   ============================================================ */
(function () {
  "use strict";

  var el = function (id) { return document.getElementById(id); };
  var DATA = {};
  try { DATA = JSON.parse((el("pdData") || {}).textContent || "{}"); } catch (e) { DATA = {}; }
  var IMGS = Array.isArray(DATA.images) ? DATA.images : [];
  var TRK = DATA.tracking || "";
  var TAJUK = DATA.title || "Hartanah";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function imej(url, w) { return String(url).replace(/=w\d+$/, "=w" + w); }

  /* ---------------- 1. HEADER + DRAWER + LUNGSUR ---------------- */
  var hdr = el("hdr");
  function onScroll() {
    if (!hdr) return;
    if (window.scrollY > 40) hdr.classList.add("is-scrolled");
    else hdr.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var drawer = el("drawer"), burger = el("burger"), dclose = el("drawerClose");
  var fokusSimpan = null;
  function bukaDrawer() {
    if (!drawer) return;
    fokusSimpan = document.activeElement;
    drawer.classList.add("is-open");
    document.body.style.overflow = "hidden";
    document.body.classList.add("pd-lock");
    if (burger) burger.setAttribute("aria-expanded", "true");
    var f = drawer.querySelector("a, button");
    if (f) f.focus();
  }
  function tutupDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    document.body.style.overflow = "";
    document.body.classList.remove("pd-lock");
    if (burger) burger.setAttribute("aria-expanded", "false");
    if (fokusSimpan && fokusSimpan.focus) fokusSimpan.focus();
  }
  if (burger) burger.addEventListener("click", function () {
    drawer && drawer.classList.contains("is-open") ? tutupDrawer() : bukaDrawer();
  });
  if (dclose) dclose.addEventListener("click", tutupDrawer);
  if (drawer) drawer.addEventListener("click", function (e) { if (e.target === drawer) tutupDrawer(); });

  var drop = el("drop"), dropBtn = el("dropBtn");
  function tutupDrop() {
    if (!drop) return;
    drop.setAttribute("data-open", "false");
    if (dropBtn) dropBtn.setAttribute("aria-expanded", "false");
  }
  if (dropBtn) dropBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var buka = drop.getAttribute("data-open") !== "true";
    drop.setAttribute("data-open", buka ? "true" : "false");
    dropBtn.setAttribute("aria-expanded", buka ? "true" : "false");
  });
  document.addEventListener("click", function (e) { if (drop && !drop.contains(e.target)) tutupDrop(); });

  /* ---------------- 2. REVEAL ---------------- */
  var io = null;
  function observeReveal() {
    var sasaran = document.querySelectorAll(".pd-rise:not(.in)");
    if (!sasaran.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(sasaran, function (s) { s.classList.add("in"); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    Array.prototype.forEach.call(sasaran, function (s) { io.observe(s); });
  }

  /* ---------------- 3. GALERI ---------------- */
  var img = el("pdImg"), counter = el("pdCounter"), thumbs = document.querySelectorAll(".pd-thumb");
  var dots = document.querySelectorAll(".pd-dot"), prev = el("pdPrev"), next = el("pdNext");
  var idx = 0;

  function papar(i, skrol) {
    if (!IMGS.length) return;
    idx = (i + IMGS.length) % IMGS.length;
    if (img) {
      img.src = imej(IMGS[idx], 1200);
      img.alt = TAJUK + " — gambar " + (idx + 1);
    }
    if (counter) counter.textContent = (idx + 1) + " / " + IMGS.length;
    Array.prototype.forEach.call(thumbs, function (t, k) {
      t.classList.toggle("is-active", k === idx);
      t.setAttribute("aria-current", k === idx ? "true" : "false");
    });
    Array.prototype.forEach.call(dots, function (d, k) { d.classList.toggle("is-active", k === idx); });
    if (skrol && thumbs[idx] && thumbs[idx].scrollIntoView) {
      thumbs[idx].scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    // pramuat jiran
    if (IMGS.length > 1) {
      [1, -1].forEach(function (d) {
        var p = new Image(); p.src = imej(IMGS[(idx + d + IMGS.length) % IMGS.length], 1200);
      });
    }
  }
  if (prev) prev.addEventListener("click", function () { papar(idx - 1); });
  if (next) next.addEventListener("click", function () { papar(idx + 1); });
  Array.prototype.forEach.call(thumbs, function (t) {
    t.addEventListener("click", function () { papar(parseInt(t.getAttribute("data-i"), 10) || 0); });
  });
  Array.prototype.forEach.call(dots, function (d) {
    d.addEventListener("click", function () { papar(parseInt(d.getAttribute("data-i"), 10) || 0); });
  });

  // leret (swipe) pada skrin sentuh
  var media = document.querySelector(".pd-media"), x0 = null, y0 = null;
  if (media) {
    media.addEventListener("touchstart", function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    media.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) papar(idx + (dx < 0 ? 1 : -1));
      x0 = y0 = null;
    }, { passive: true });
  }

  /* ---------------- 4. LIGHTBOX (skrin penuh) ---------------- */
  var lb = el("pdLb"), lbImg = el("pdLbImg"), lbCap = el("pdLbCap");
  var lbPrev = el("pdLbPrev"), lbNext = el("pdLbNext"), lbClose = el("pdLbClose");
  var lbFokus = null;

  function lbPapar() {
    if (!lbImg) return;
    lbImg.src = imej(IMGS[idx], 1600);
    if (lbCap) lbCap.textContent = TAJUK + " — " + (idx + 1) + " / " + IMGS.length;
  }
  function lbBuka() {
    if (!lb || !IMGS.length) return;
    lbFokus = document.activeElement;
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
    document.body.classList.add("pd-lock");
    lbPapar();
    if (lbClose) lbClose.focus();
  }
  function lbTutup() {
    if (!lb) return;
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    document.body.classList.remove("pd-lock");
    if (lbFokus && lbFokus.focus) lbFokus.focus();
  }
  var fsBtn = el("pdFs");
  if (fsBtn) fsBtn.addEventListener("click", lbBuka);
  if (media && img) media.addEventListener("dblclick", lbBuka);
  if (lbClose) lbClose.addEventListener("click", lbTutup);
  if (lbPrev) lbPrev.addEventListener("click", function (e) { e.stopPropagation(); papar(idx - 1); lbPapar(); });
  if (lbNext) lbNext.addEventListener("click", function (e) { e.stopPropagation(); papar(idx + 1); lbPapar(); });
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) lbTutup(); });

  document.addEventListener("keydown", function (e) {
    var buka = lb && lb.classList.contains("is-open");
    if (e.key === "Escape") {
      if (buka) lbTutup();
      if (drawer && drawer.classList.contains("is-open")) tutupDrawer();
      tutupDrop();
      return;
    }
    if (buka && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      papar(idx + (e.key === "ArrowRight" ? 1 : -1));
      lbPapar();
      return;
    }
    // navigasi papan kekunci untuk galeri apabila ia difokus
    if (!buka && media && document.activeElement === media &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      papar(idx + (e.key === "ArrowRight" ? 1 : -1));
    }
    // skrol mendatar dalam lightbox
    if (buka && e.key === "ArrowDown") { e.preventDefault(); papar(idx + 1); lbPapar(); }
    if (buka && e.key === "ArrowUp") { e.preventDefault(); papar(idx - 1); lbPapar(); }
  });

  // perangkap fokus ringkas di dalam lightbox
  if (lb) lb.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var f = [lbClose, lbPrev, lbNext].filter(Boolean);
    if (!f.length) return;
    var pertama = f[0], akhir = f[f.length - 1];
    if (e.shiftKey && document.activeElement === pertama) { e.preventDefault(); akhir.focus(); }
    else if (!e.shiftKey && document.activeElement === akhir) { e.preventDefault(); pertama.focus(); }
  });

  /* ---------------- 5. BUTANG SIMPAN + KONGSI ---------------- */
  var fav = el("pdFav");
  if (fav && TRK) {
    try {
      var simpan = JSON.parse(localStorage.getItem("zmp_simpan") || "[]");
      if (simpan.indexOf(TRK) >= 0) fav.setAttribute("aria-pressed", "true");
    } catch (e) {}
    fav.addEventListener("click", function () {
      var tekan = fav.getAttribute("aria-pressed") === "true";
      var senarai = [];
      try { senarai = JSON.parse(localStorage.getItem("zmp_simpan") || "[]"); } catch (e) {}
      if (tekan) senarai = senarai.filter(function (x) { return x !== TRK; });
      else if (senarai.indexOf(TRK) < 0) senarai.push(TRK);
      try { localStorage.setItem("zmp_simpan", JSON.stringify(senarai)); } catch (e) {}
      fav.setAttribute("aria-pressed", tekan ? "false" : "true");
    });
  }
  var kongsi = el("pdShare");
  if (kongsi) kongsi.addEventListener("click", function () {
    var url = location.href, data = { title: TAJUK, text: TAJUK + " — Zahir MJ Property", url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    window.open("https://wa.me/?text=" + encodeURIComponent(TAJUK + " — " + url), "_blank", "noopener");
  });

  /* ---------------- 6. TAB BERPATUT ---------------- */
  var tabs = document.querySelectorAll(".pd-tab[data-target]");
  var seksyen = ["ringkasan", "deskripsi", "ciri-utama", "lokasi"]
    .map(function (id) { return el(id); }).filter(Boolean);

  function offsetAtas() {
    var h = hdr ? hdr.getBoundingClientRect().height : 72;
    var bar = document.querySelector(".pd-tabs");
    var barH = (bar && window.innerWidth <= 767.98) ? bar.getBoundingClientRect().height : 0;
    return h + barH + 14;
  }
  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener("click", function (e) {
      var id = t.getAttribute("data-target");
      var sasaran = el(id);
      if (!sasaran) return;
      e.preventDefault();
      var y = sasaran.getBoundingClientRect().top + window.scrollY - offsetAtas();
      window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
      sejarahGanti(id);
      aktifkan(id);
    });
  });
  function sejarahGanti(id) {
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  }
  function aktifkan(id) {
    Array.prototype.forEach.call(tabs, function (t) {
      var ya = t.getAttribute("data-target") === id;
      t.classList.toggle("is-active", ya);
      t.setAttribute("aria-current", ya ? "true" : "false");
    });
  }
  if (seksyen.length && "IntersectionObserver" in window) {
    var ioSec = new IntersectionObserver(function (entries) {
      var nampak = entries.filter(function (x) { return x.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      if (nampak[0]) aktifkan(nampak[0].target.id);
    }, { rootMargin: "-" + Math.round(offsetAtas() + 8) + "px 0px -55% 0px", threshold: [0.05, 0.25, 0.5] });
    seksyen.forEach(function (s) { ioSec.observe(s); });
  }
  aktifkan("ringkasan");

  /* ---------------- 7. AKORDION (mobil) ---------------- */
  Array.prototype.forEach.call(document.querySelectorAll(".pd-sec"), function (sec) {
    var btn = sec.querySelector(".pd-sec-toggle");
    if (!btn) return;
    var bukaAsal = sec.getAttribute("data-buka") === "1";
    if (bukaAsal) sec.classList.add("is-open");
    btn.setAttribute("aria-expanded", bukaAsal ? "true" : "false");
    btn.addEventListener("click", function () {
      var buka = !sec.classList.contains("is-open");
      sec.classList.toggle("is-open", buka);
      btn.setAttribute("aria-expanded", buka ? "true" : "false");
    });
  });

  /* ---------------- 8. PELANCARAN ---------------- */
  papar(0, false);
  observeReveal();
  // bantuan skrin pembaca untuk perubahan galeri
  if (counter) counter.setAttribute("aria-live", "polite");
})();
