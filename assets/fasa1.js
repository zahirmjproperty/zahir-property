/* ============================================================
   Fasa 1 (12/9/2026) — skrip kecil laman produksi:
   1. Bar aksi melekat (mudah alih)  2. Kad segmen (index)  3. Baiki galeri
   ============================================================ */
(function () {
  var WA = (window.SITE && window.SITE.whatsapp) ? window.SITE.whatsapp : "";

  /* ---------- 1. Bar melekat mudah alih ---------- */
  if (!document.querySelector('.f1-bar')) {
    var alamat = document.querySelector('#listingGrid, #listing, main') ? '#listing' : 'index.html';
    if (location.pathname.indexOf('listing/') > -1 || /listing\.html$/.test(location.pathname)) {
      alamat = 'index.html#listing';
    }
    var bar = document.createElement('div');
    bar.className = 'f1-bar';
    bar.innerHTML =
      '<a class="f1-b1" href="' + alamat + '">🔎 Cari Hartanah</a>' +
      (WA ? '<a class="f1-b2" href="https://wa.me/' + WA + '" target="_blank" rel="noopener">📲 WhatsApp</a>' : '');
    document.body.appendChild(bar);
  }

  /* ---------- 2. Kad segmen di laman utama ---------- */
  document.querySelectorAll('[data-seg]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var jenis = a.getAttribute('data-seg');
      var sel = document.getElementById('typeFilter');
      if (sel && jenis) {
        var jumpa = false;
        Array.prototype.forEach.call(sel.options, function (o) {
          if (o.value && o.value.toLowerCase().indexOf(jenis.toLowerCase()) > -1) { sel.value = o.value; jumpa = true; }
        });
        if (jumpa) {
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      var t = document.getElementById('listing') || document.getElementById('listingGrid');
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ---------- 3. Galeri: imej kecil jangan dibesarkan sampai pecah ---------- */
  var main = document.getElementById('galMain') || document.querySelector('.gal-main img, .detail-media img');
  if (main) {
    var tanda = function () {
      var box = (main.parentElement && main.parentElement.clientWidth) || 0;
      main.classList.toggle('kecil', !!(main.naturalWidth && box && main.naturalWidth < box));
    };
    main.complete ? tanda() : main.addEventListener('load', tanda);
    window.addEventListener('resize', tanda);
  }
})();
