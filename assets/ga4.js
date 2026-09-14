// assets/ga4.js — Google Analytics 4 + jejak konversi (dijana oleh pasang_ga4.py)
(function () {
  var ID = "G-XL9GDR0ZXS";
  var s = document.createElement("script");
  s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", ID, { anonymize_ip: true });

  // --- Konversi: klik WhatsApp / telefon ---
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a || !a.href) return;
    if (a.href.indexOf("wa.me") > -1 || a.href.indexOf("whatsapp") > -1) {
      gtag("event", "klik_whatsapp", { halaman: location.pathname,
        listing: (location.pathname.match(/listing\/([^/]+)\.html/) || [])[1] || "" });
    } else if (a.href.indexOf("tel:") === 0) {
      gtag("event", "klik_telefon", { halaman: location.pathname });
    }
  }, true);

  // --- Konversi: hantar borang (Serah Listing / Semak Kelayakan / dsb.) ---
  document.addEventListener("submit", function (e) {
    var f = e.target;
    gtag("event", "hantar_borang", { borang: (f.id || f.name || "tanpa-nama"),
      halaman: location.pathname });
  }, true);

  // --- Minat: buka listing (halaman butiran) ---
  if (/\/listing\//.test(location.pathname)) {
    gtag("event", "buka_listing", { listing: (location.pathname.match(/listing\/([^/]+)\.html/) || [])[1] || "" });
  }
})();
