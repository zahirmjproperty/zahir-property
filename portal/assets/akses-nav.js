/* akses-nav.js — TAB "Log Masuk / Dashboard saya" + LOG KELUAR pada laman awam.
 *
 * Arahan Zahir (15 Sep 2026):
 *   1) Satu tab berlink supaya pengguna boleh log masuk ke akaun & buka dashboard —
 *      pengguna tidak perlu simpan atau ingat URL.
 *   2) Bila SUDAH log masuk, mesti ada pilihan LOG KELUAR (keselamatan peranti kongsi).
 *
 * Reka bentuk: ringan sengaja —
 *   • TIDAK memuatkan SDK Supabase pada halaman awam (jimat ~50KB setiap halaman).
 *   • Kehadiran sesi dikesan daripada kunci localStorage yang ditulis oleh login portal
 *     (`sb-<ref>-auth-token`) — tiada panggilan rangkaian.
 *   • Log keluar: panggil REST `/auth/v1/logout` dengan token sesi, kemudian buang
 *     token tempatan. Fungsi sama seperti signOut() tetapi tanpa SDK.
 *
 * Guna (letak sebelum </body> pada setiap halaman awam):
 *   <script src="portal/assets/auth-config.js" defer></script>
 *   <script src="portal/assets/akses-nav.js" defer></script>
 * (Path sentiasa MUTLAK: /portal/assets/... supaya berfungsi dari mana-mana subfolder.)
 */
(function () {
  "use strict";
  var CFG = window.AUTH || {};
  var RUJUKAN = (String(CFG.url || "").replace(/^https?:\/\//, "").split(".")[0]) || "";
  var KUNCI = RUJUKAN ? ("sb-" + RUJUKAN + "-auth-token") : "";
  /* Halaman akses: satu tempat sahaja (mrtanah.com). Domain lain paut ke sana —
     localStorage sesi tidak dikongsi antara domain, jadi log masuk mesti berlaku
     di domain yang sama dengan dashboard. */
  var DOMAIN_AKSES = "https://mrtanah.com";
  var HALAMAN_AKSES = (/(^|\.)mrtanah\.com$/.test(location.hostname) || location.protocol === "file:")
    ? "/portal/masuk.html"
    : DOMAIN_AKSES + "/portal/masuk.html";

  function bacaToken() {
    if (!KUNCI) return "";
    try {
      var mentah = localStorage.getItem(KUNCI) || localStorage.getItem(KUNCI + "-code-verifier");
      if (!mentah) return "";
      var d = JSON.parse(mentah);
      return (d && (d.access_token || (d.currentSession && d.currentSession.access_token))) || "";
    } catch (e) { return ""; }
  }

  function buangToken() {
    try { localStorage.removeItem(KUNCI); } catch (e) {}
    try { sessionStorage.removeItem("mt_sesi_token"); } catch (e) {}
    /* bersihkan kunci Supabase lain yang berkaitan sesi ini */
    try {
      var buang = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && KUNCI && k.indexOf(KUNCI) === 0) buang.push(k);
      }
      buang.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
  }

  function keluar() {
    if (!window.confirm("Log keluar dari akaun anda pada peranti ini?")) return;
    var tok = bacaToken();
    var kerja = Promise.resolve();
    if (tok && CFG.url) {
      kerja = fetch(CFG.url + "/auth/v1/logout", {
        method: "POST",
        headers: { "apikey": CFG.key || "", "Authorization": "Bearer " + tok }
      }).catch(function () { /* token mungkin sudah luput — tetap bersihkan tempatan */ });
    }
    kerja.then(function () {
      buangToken();
      location.href = HALAMAN_AKSES;
    });
  }

  function css() {
    if (document.getElementById("akses-nav-css")) return;
    var s = document.createElement("style");
    s.id = "akses-nav-css";
    s.textContent =
      ".akses-tab{display:inline-flex;align-items:center;gap:6px;text-decoration:none;font-weight:700;" +
      "padding:8px 13px;border-radius:999px;background:#0F172A;color:#fff;font-size:14px;white-space:nowrap}" +
      ".akses-tab:hover{opacity:.92}" +
      ".akses-tab.keluar-tab{background:#fff;color:#a11;border:1.6px solid #e7b4b4}" +
      ".akses-tab.keluar-tab:hover{background:#fdeaea}" +
      "@media (max-width:820px){.akses-tab{font-size:13px;padding:7px 11px}}";
    document.head.appendChild(s);
  }

  function bina() {
    var nav = document.querySelector("nav.nav, nav#nav, header .nav");
    if (!nav || nav.querySelector(".akses-tab")) return;   /* tiada nav (halaman portal) atau sudah ada */
    var tok = bacaToken();
    css();

    var a = document.createElement("a");
    a.className = "akses-tab";
    a.href = HALAMAN_AKSES;
    a.textContent = tok ? "👤 Dashboard saya" : "🔐 Log Masuk";
    a.title = tok ? "Buka halaman akses & dashboard anda" : "Log masuk ke akaun anda";
    nav.appendChild(a);

    if (tok) {
      var b = document.createElement("a");
      b.className = "akses-tab keluar-tab";
      b.href = "#keluar";
      b.textContent = "🚪 Log Keluar";
      b.title = "Log keluar dari akaun pada peranti ini (keselamatan peranti kongsi)";
      b.addEventListener("click", function (e) { e.preventDefault(); keluar(); });
      nav.appendChild(b);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bina);
  else bina();
})();
