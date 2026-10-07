/* ============================================================
   Zahir MJ Property — senarai.js
   Laman SENARAI LISTING penuh (/senarai.html): carian, tapisan,
   susunan dan grid semua listing aktif.

   Dahulu pautan "Lihat Semua Listing" / tab "Listing" menuju ke
   listing.html — halaman itu sebenarnya TEMPLAT BUTIRAN (memerlukan
   ?id=<TRACKING>), jadi pelawat nampak "Listing tidak dijumpai".
   Fail ini memberi laman senarai yang sebenar.
   ============================================================ */
(function () {
  "use strict";

  var L = (window.LISTINGS || []).filter(function (l) { return l.active !== false; });
  var SITE = window.SITE || { phone: "012-2310119", whatsapp: "60122310119" };
  var el = function (id) { return document.getElementById(id); };

  var GAMBAR_GANTI = {
    rumah: "assets/seg-rumah.jpg", apartmen: "assets/seg-apartmen.jpg",
    komersial: "assets/seg-komersial.jpg", tanah: "assets/seg-rumah.jpg",
    lain: "assets/hero.jpg"
  };

  /* ---------- jenis hartanah ---------- */
  function kategori(l) {
    var t = String(l.type || "").toLowerCase();
    if (/tanah|ladang|kebun/.test(t)) return "tanah";
    if (/komersial|pejabat|kedai|shoplot|kilang|industrial/.test(t)) return "komersial";
    if (/apartmen|kondo|kondominium|pangsapuri|flat|studio|servis/.test(t)) return "apartmen";
    if (/rumah|teres|semi|bungalow|banglo|townhouse|villa/.test(t)) return "rumah";
    return "lain";
  }

  /* ---------- urus niaga (jenis boleh string ATAU array) ---------- */
  function dealsOf(l) {
    var j = l.jenis;
    return Array.isArray(j) ? j : String(j || "").split(/[/,|]/);
  }
  function isSewa(l) {
    if (dealsOf(l).some(function (d) { return /SEWA|PAJAK/i.test(String(d).trim()); })) return true;
    return /bulan|sebulan/i.test(String(l.price_label || ""));
  }
  function isJual(l) {
    return dealsOf(l).some(function (d) { return /JUAL/i.test(String(d).trim()); });
  }
  function isJV(l) {
    return dealsOf(l).some(function (d) { return /JV|JOINT/i.test(String(d).trim()); });
  }
  function isDual(l) { return isJual(l) && isSewa(l); }

  function fmt(n) { return "RM" + Number(n).toLocaleString("en-MY"); }
  function harga(l) {
    if (isDual(l)) {
      return (l.price_label || fmt(l.price)) + ' <small>/ jual</small>' +
        (l.sewa_label ? ' <span class="p-sewa">· ' + l.sewa_label + "</span>" : "");
    }
    if (isSewa(l) && !isJual(l)) {
      var lbl = l.price_label || fmt(l.price);
      return lbl + (/bulan|sebulan/i.test(lbl) ? "" : ' <small>/ bulan</small>');
    }
    return l.price_label || fmt(l.price);
  }
  function saiz(l) {
    if (l.built_up && l.built_up !== "-") return l.built_up;
    if (l.land_area && l.land_area !== "-") return l.land_area;
    return null;
  }
  function lokasi(l) {
    return String(l.location || "").split(",").slice(-2).join(",").trim() || l.state || "";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  var ICO = {
    bilik: '<svg viewBox="0 0 24 24"><path d="M3 18v-5h18v5"/><path d="M3 13V8a2 2 0 0 1 2-2h6v7"/><circle cx="7" cy="9" r="1.3"/></svg>',
    air: '<svg viewBox="0 0 24 24"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M7 12V6a2 2 0 0 1 4 0"/></svg>',
    luas: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 15v5h-5"/><path d="M4 4l6 6M20 20l-6-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3Z"/></svg>'
  };

  /* ---------- kad (kelas sama seperti laman utama) ---------- */
  function kad(l) {
    var k = kategori(l);
    var ganti = GAMBAR_GANTI[k] || GAMBAR_GANTI.lain;
    var img = (l.images && l.images[0]) || ganti;
    var url = "listing/" + encodeURIComponent(l.tracking) + ".html";

    var badges = [];
    if (isDual(l)) {
      badges.push('<span class="badge badge-jual">Jual</span>', '<span class="badge badge-sewa">Sewa</span>');
    } else if (isSewa(l)) {
      badges.push('<span class="badge badge-sewa">Untuk Disewa</span>');
    } else if (isJV(l)) {
      badges.push('<span class="badge badge-jv">JV</span>');
    } else {
      badges.push('<span class="badge badge-jual">Untuk Dijual</span>');
    }

    var specs = [];
    if (l.bedrooms) specs.push(ICO.bilik + Number(l.bedrooms) + " Bilik");
    if (l.bathrooms) specs.push(ICO.air + Number(l.bathrooms) + " Bilik Air");
    if (saiz(l)) specs.push(ICO.luas + saiz(l));
    if (l.tenure && l.tenure !== "-") specs.push(ICO.shield + esc(l.tenure));

    var ref = String(l.tracking || "").trim();

    return '<article class="p-card reveal">' +
      '<a class="p-media" href="' + url + '" aria-label="' + esc(l.title) + '">' +
        '<img src="' + esc(img) + '" alt="' + esc(l.title) + '" loading="lazy" width="640" height="400" ' +
        'onerror="this.onerror=null;this.src=\'' + ganti + '\'">' +
        badges.join("") +
        (ref ? '<span class="p-ref" title="Rujukan listing">' + esc(ref) + "</span>" : "") +
      "</a>" +
      '<div class="p-body">' +
        '<a class="p-hit" href="' + url + '" aria-label="Lihat butiran: ' + esc(l.title) + '">' +
          '<div class="p-top">' +
            '<div style="min-width:0">' +
              '<h3 class="p-title">' + esc(l.title) + "</h3>" +
              '<div class="p-price">' + harga(l) + "</div>" +
            "</div>" +
            '<div class="p-loc">' + ICO.pin + "<span>" + esc(lokasi(l)) + "</span></div>" +
          "</div>" +
        "</a>" +
        '<div class="p-specs">' +
          specs.map(function (s) { return "<span>" + s + "</span>"; }).join("") +
        "</div>" +
      "</div>" +
    "</article>";
  }

  /* ---------- tapisan ---------- */
  var JENIS = ["JUAL", "SEWA", "JV"];

  var HARGA = {
    JUAL: [["", "Julat Harga"], ["0-300000", "Bawah RM300k"], ["300000-500000", "RM300k – RM500k"],
           ["500000-800000", "RM500k – RM800k"], ["800000-1500000", "RM800k – RM1.5j"],
           ["1500000-0", "Atas RM1.5j"]],
    SEWA: [["", "Julat Harga"], ["0-1500", "Bawah RM1,500"], ["1500-2500", "RM1,500 – RM2,500"],
           ["2500-0", "Atas RM2,500"]],
    JV: [["", "Julat Harga"]]
  };

  var JENIS_HARTANAH = [["", "Jenis Hartanah"], ["rumah", "Rumah / Teres / Semi-D"],
                        ["apartmen", "Apartmen & Kondo"], ["komersial", "Komersial"], ["tanah", "Tanah"]];

  var SUSUNAN = [["terbaru", "Terbaru"], ["harga-asc", "Harga: Rendah → Tinggi"],
                 ["harga-desc", "Harga: Tinggi → Rendah"], ["luas-desc", "Keluasan: Besar → Kecil"]];

  function opsyen(list, dipilih) {
    return list.map(function (o) {
      return '<option value="' + o[0] + '"' + (o[0] === dipilih ? " selected" : "") + ">" + o[1] + "</option>";
    }).join("");
  }

  /* ---------- baca / tulis keadaan pada URL ---------- */
  var KUNCI = ["jenis", "q", "type", "harga", "bilik", "sort"];

  function bacaURL() {
    var p = new URLSearchParams(location.search);
    var s = { jenis: (p.get("jenis") || "JUAL").toUpperCase(), q: p.get("q") || "",
              type: p.get("type") || "", harga: p.get("harga") || "",
              bilik: p.get("bilik") || "", sort: p.get("sort") || "terbaru" };
    if (JENIS.indexOf(s.jenis) === -1) s.jenis = "JUAL";
    return s;
  }

  function tulisURL(s) {
    var p = new URLSearchParams();
    if (s.jenis && s.jenis !== "JUAL") p.set("jenis", s.jenis);
    ["q", "type", "harga", "bilik"].forEach(function (k) { if (s[k]) p.set(k, s[k]); });
    if (s.sort && s.sort !== "terbaru") p.set("sort", s.sort);
    var qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
  }

  var S = bacaURL();

  /* ---------- padan ---------- */
  function padan(l) {
    if (S.jenis === "JV") { if (!isJV(l)) return false; }
    else if (S.jenis === "SEWA") { if (!isSewa(l)) return false; }
    else { if (!isJual(l) && !isDual(l)) return false; }

    if (S.type && kategori(l) !== S.type) return false;

    if (S.q) {
      var hay = [l.title, l.location, l.state, l.type, l.project_name, l.unit, l.tracking]
        .join(" ").toLowerCase();
      if (hay.indexOf(S.q.toLowerCase()) === -1) return false;
    }

    if (S.bilik && Number(l.bedrooms || 0) < Number(S.bilik)) return false;

    if (S.harga) {
      var p = S.harga.split("-"), min = Number(p[0]), max = Number(p[1] || 0);
      if (min && Number(l.price) < min) return false;
      if (max && Number(l.price) > max) return false;
    }
    return true;
  }

  function susun(out) {
    out.sort(function (a, b) {
      if (S.sort === "harga-asc") return Number(a.price || 0) - Number(b.price || 0);
      if (S.sort === "harga-desc") return Number(b.price || 0) - Number(a.price || 0);
      if (S.sort === "luas-desc") {
        var ka = parseFloat(String(a.built_up || a.land_area || "0").replace(/[^\d.]/g, "")) || 0;
        var kb = parseFloat(String(b.built_up || b.land_area || "0").replace(/[^\d.]/g, "")) || 0;
        return kb - ka;
      }
      var da = String(a.date || ""), db = String(b.date || "");
      if (da !== db) return db.localeCompare(da);
      return Number(b.price || 0) - Number(a.price || 0);
    });
    return out;
  }

  /* ---------- papar ---------- */
  function papar() {
    var grid = el("gridProp"); if (!grid) return;
    var out = susun(L.filter(padan));

    if (!out.length) {
      grid.innerHTML = '<div class="empty"><h3>Tiada hartanah sepadan</h3>' +
        "<p>Cuba longgarkan penapis, atau hubungi kami — kami boleh carikan untuk anda.</p>" +
        '<p style="margin-top:14px"><a class="btn btn-gold" href="senarai.html">Lihat semua listing</a></p></div>';
    } else {
      grid.innerHTML = out.map(kad).join("");
    }

    var kira = el("hasilKira");
    if (kira) kira.textContent = out.length + " hartanah dipaparkan";
    var tajuk = el("tajukKira");
    if (tajuk) tajuk.textContent = out.length + (out.length === 1 ? " listing" : " listing");

    // pautan "kosongkan penapis" hanya bila ada penapis aktif
    var kosong = el("kosongkan");
    if (kosong) {
      var ada = S.q || S.type || S.harga || S.bilik || S.jenis !== "JUAL" || S.sort !== "terbaru";
      kosong.hidden = !ada;
    }
    observeReveal();
  }

  /* ---------- reveal ---------- */
  var io = null;
  function observeReveal() {
    var sasaran = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
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

  /* ---------- UI ---------- */
  function binaTapis() {
    var tabs = el("tabsJenis");
    if (tabs) {
      tabs.innerHTML = JENIS.map(function (j) {
        var label = j === "JUAL" ? "Beli" : (j === "SEWA" ? "Sewa" : "JV");
        return '<button class="tab" type="button" role="tab" data-jenis="' + j + '" aria-selected="' +
          (S.jenis === j) + '">' + label + "</button>";
      }).join("");
      tabs.addEventListener("click", function (e) {
        var t = e.target.closest(".tab"); if (!t) return;
        S.jenis = t.getAttribute("data-jenis");
        S.harga = "";
        isiHarga();
        Array.prototype.forEach.call(tabs.querySelectorAll(".tab"), function (x) {
          x.setAttribute("aria-selected", String(x === t));
        });
        tulisURL(S); papar();
      });
    }

    var q = el("q"); if (q) q.value = S.q;
    var b = el("fBilik"); if (b) b.value = S.bilik;
    var s = el("fSusun");
    if (s) { s.innerHTML = opsyen(SUSUNAN, S.sort); }
    var fj = el("fJenis");
    if (fj) { fj.innerHTML = opsyen(JENIS_HARTANAH, S.type); }
    isiHarga();
  }

  function isiHarga() {
    var sel = el("fHarga"); if (!sel) return;
    sel.innerHTML = opsyen(HARGA[S.jenis] || HARGA.JUAL, S.harga);
  }

  function ikat() {
    var frm = el("searchForm");
    if (frm) frm.addEventListener("submit", function (e) { e.preventDefault(); hantar(); });
    ["q", "fJenis", "fHarga", "fBilik", "fSusun"].forEach(function (id) {
      var n = el(id); if (!n) return;
      n.addEventListener("change", function () { hantar(); });
    });
    var k = el("kosongkan");
    if (k) k.addEventListener("click", function (e) {
      e.preventDefault();
      S = { jenis: "JUAL", q: "", type: "", harga: "", bilik: "", sort: "terbaru" };
      tulisURL(S); binaTapis(); papar();
    });
  }

  function hantar() {
    S.q = (el("q") && el("q").value.trim()) || "";
    S.type = (el("fJenis") && el("fJenis").value) || "";
    S.harga = (el("fHarga") && el("fHarga").value) || "";
    S.bilik = (el("fBilik") && el("fBilik").value) || "";
    S.sort = (el("fSusun") && el("fSusun").value) || "terbaru";
    tulisURL(S); papar();
  }

  /* ---------- header + drawer (sama seperti laman utama) ---------- */
  function chrome() {
    var hdr = el("hdr");
    var onScroll = function () {
      if (!hdr) return;
      if (window.scrollY > 40) hdr.classList.add("is-scrolled");
      else hdr.classList.remove("is-scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var drawer = el("drawer"), burger = el("burger"), dclose = el("drawerClose");
    function buka() {
      if (!drawer) return;
      drawer.classList.add("is-open");
      document.body.style.overflow = "hidden";
      if (burger) burger.setAttribute("aria-expanded", "true");
      var f = drawer.querySelector("a, button"); if (f) f.focus();
    }
    function tutup() {
      if (!drawer) return;
      drawer.classList.remove("is-open");
      document.body.style.overflow = "";
      if (burger) burger.setAttribute("aria-expanded", "false");
    }
    if (burger) burger.addEventListener("click", function () {
      drawer && drawer.classList.contains("is-open") ? tutup() : buka();
    });
    if (dclose) dclose.addEventListener("click", tutup);
    if (drawer) drawer.addEventListener("click", function (e) { if (e.target === drawer) tutup(); });

    var drop = el("drop"), dropBtn = el("dropBtn"), dropMenu = el("dropMenu");
    function tutupDrop() {
      if (!drop) return;
      drop.setAttribute("data-open", "false");
      if (dropBtn) dropBtn.setAttribute("aria-expanded", "false");
    }
    if (drop && dropBtn) {
      dropBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var t = drop.getAttribute("data-open") === "true";
        drop.setAttribute("data-open", t ? "false" : "true");
        dropBtn.setAttribute("aria-expanded", t ? "false" : "true");
      });
      if (dropMenu) dropMenu.addEventListener("click", function (e) { e.stopPropagation(); });
      document.addEventListener("click", tutupDrop);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { tutupDrop(); tutup(); }
    });
  }

  /* ---------- mula ---------- */
  var th = el("tahun"); if (th) th.textContent = new Date().getFullYear();
  chrome();
  binaTapis();
  ikat();
  papar();
})();
