/* carian-praktikal.js — enjin carian laman utama ZMP (praktikal, tiada kebergantungan luar)
 *
 * Membaiki kelemahan carian lama:
 *   1. Padanan berbilang perkataan (AND) — "seksyen 16 bangi" dahulu 0 hasil, kini 3.
 *   2. Toleransi salah eja (jarak suntingan 1-2) — "bangii" tetap jumpa Bangi.
 *   3. Cadangan autolengkap dari data (lokasi, bandar, projek, jenis) + kiraan.
 *   4. Jalur harga ikut tab Beli/Sewa (dari taburan data, bukan angka tetap).
 *   5. Negeri + harga kini ada di laman utama (dahulu hanya di senarai.html).
 *   6. Cip penapis aktif — pengguna nampak apa yang menapis dan boleh buang satu-satu.
 *
 * Guna: CarianPraktikal.init({...}) selepas DOM + window.LISTINGS sedia.
 */
(function () {
  'use strict';

  var MEDAN = ['title', 'location', 'state', 'type', 'project_name', 'unit', 'tracking',
               'description', 'highlights', 'amenities', 'nearby'];

  function norm(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function hay(l) {
    if (l.__hay == null) {
      var a = [];
      for (var i = 0; i < MEDAN.length; i++) {
        var v = l[MEDAN[i]];
        if (Array.isArray(v)) v = v.join(' ');
        if (v) a.push(v);
      }
      l.__hay = norm(a.join(' '));
    }
    return l.__hay;
  }

  function kataUnik(l) {
    if (!l.__kata) {
      var set = Object.create(null), out = [], w = hay(l).split(' ');
      for (var i = 0; i < w.length; i++) if (w[i] && !set[w[i]]) { set[w[i]] = 1; out.push(w[i]); }
      l.__kata = out;
    }
    return l.__kata;
  }

  /* jarak suntingan berhad: true bila <= max (berhenti awal, murah) */
  function dekat(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return false;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur[0] = i;
      var baris = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
        if (cur[j] < baris) baris = cur[j];
      }
      if (baris > max) return false;
      var t = prev; prev = cur; cur = t;
    }
    return prev[b.length] <= max;
  }

  function tokenPadan(l, t) {
    if (hay(l).indexOf(t) > -1) return true;
    if (t.length < 4) return false;          // jangan teka untuk kata pendek
    // Token berangka / kod listing (cth '0001', 'coa0001') mesti TEPAT.
    // Tanpa ini, '0001' dianggap salah eja '0003' (jarak suntingan 1) dan SEMUA
    // kod listing padan — carian kod pulang seluruh katalog. Kod = pengecam, bukan perkataan.
    if (/^\d+$/.test(t)) return false;
    var max = t.length >= 8 ? 2 : 1, k = kataUnik(l);
    for (var i = 0; i < k.length; i++) {
      if (Math.abs(k[i].length - t.length) > max) continue;
      if (dekat(t, k[i], max)) return true;
    }
    return false;
  }

  /* ---------- padanan utama ---------- */
  function padan(l, f) {
    if (f.jenis && f.jenis !== 'JV' && l.jenis !== f.jenis) return false;
    if (f.jenis === 'JV') return false;
    if (f.kategori && kategori(l) !== f.kategori) return false;
    if (f.negeri && negeri(l) !== f.negeri) return false;
    if (f.bilik && Number(l.bedrooms || 0) < Number(f.bilik)) return false;
    if (f.harga) {
      var p = String(f.harga).split('-'), min = Number(p[0]) || 0, max = Number(p[1]) || 0;
      var h = Number(l.price) || 0;
      if (min && h < min) return false;
      if (max && h > max) return false;
    }
    if (f.q) {
      var toks = norm(f.q).split(' ').filter(Boolean);
      for (var i = 0; i < toks.length; i++) if (!tokenPadan(l, toks[i])) return false;
    }
    return true;
  }

  function kategori(l) {
    var t = norm(l.type);
    if (/tanah|ladang|kebun/.test(t)) return 'tanah';
    if (/komersial|pejabat|kedai|shoplot|kilang|industrial/.test(t)) return 'komersial';
    if (/apartmen|kondo|kondominium|pangsapuri|flat|studio|servis/.test(t)) return 'apartmen';
    if (/rumah|teres|semi|bungalow|banglo|townhouse|villa/.test(t)) return 'rumah';
    return 'lain';
  }

  function negeri(l) {
    var s = norm(l.state).replace(/^wp /, '');
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  /* ---------- jalur harga ----------
     Jalur tetap dari taburan sebenar data (JUAL p10 275k / p90 1.95j; SEWA 1.1k-8.7k).
     Satu jalur = satu rentetan "min-max" supaya mudah dibaca dari <select>.
     ponytail: jalur tetap cukup untuk 252 listing; tukar ke pengiraan persentil
     hanya bila katalog melepasi ~2,000 listing atau harga melompat liga. */
  var JALUR_JUAL = [['', 'Harga (jual)'], ['0-300000', 'Bawah RM300k'], ['300000-500000', 'RM300k – RM500k'],
    ['500000-700000', 'RM500k – RM700k'], ['700000-1000000', 'RM700k – RM1j'],
    ['1000000-2000000', 'RM1j – RM2j'], ['2000000-', 'RM2j ke atas']];
  var JALUR_SEWA = [['', 'Harga (sewa)'], ['0-1200', 'Bawah RM1,200'], ['1200-1800', 'RM1,200 – RM1,800'],
    ['1800-2500', 'RM1,800 – RM2,500'], ['2500-4000', 'RM2,500 – RM4,000'], ['4000-', 'RM4,000 ke atas']];

  function jalurHarga(jenis) { return jenis === 'SEWA' ? JALUR_SEWA : JALUR_JUAL; }

  /* ---------- indeks autolengkap ---------- */
  function binaIndeks(L) {
    var m = Object.create(null);
    function tambah(teks, j) {
      var t = String(teks == null ? '' : teks).trim();
      if (!t || t.length < 3 || t === '-') return;
      var k = norm(t);
      if (!k) return;
      if (!m[k]) m[k] = { teks: t, jenis: j, n: 0 };
      m[k].n++;
    }
    for (var i = 0; i < L.length; i++) {
      var l = L[i], loc = String(l.location || '');
      tambah(loc, 'Lokasi');
      var bahagian = loc.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      if (bahagian.length > 1) tambah(bahagian[1], 'Bandar');
      if (l.project_name) tambah(l.project_name, 'Projek');
      tambah(l.type, 'Jenis');
    }
    var senarai = [];
    for (var k in m) senarai.push(m[k]);
    senarai.sort(function (a, b) { return b.n - a.n; });
    return senarai;
  }

  function cadangan(indeks, q, had) {
    var toks = norm(q).split(' ').filter(Boolean);
    if (!toks.length) return [];
    var out = [];
    for (var i = 0; i < indeks.length && out.length < had; i++) {
      var k = norm(indeks[i].teks), ok = true;
      for (var j = 0; j < toks.length; j++) if (k.indexOf(toks[j]) === -1) { ok = false; break; }
      if (ok) out.push(indeks[i]);
    }
    return out;
  }

  window.CarianPraktikal = {
    norm: norm, padan: padan, kategori: kategori, negeri: negeri,
    jalurHarga: jalurHarga, binaIndeks: binaIndeks, cadangan: cadangan
  };
})();
