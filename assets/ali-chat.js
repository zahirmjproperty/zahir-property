/* ==========================================================================
   POC "Tanya Ali" — widget chat AI (preview/POC)
   Backend: Cloudflare quick tunnel → poc-ai/server.py (kunci API di pelayan)
   ==========================================================================
   Konfigurasi: ALI_API diisi oleh skrip start_poc.sh (URL tunnel).
   ========================================================================== */
(function () {
  var BASE = window.ALI_API_BASE || "";
  var ALI_API = (window.ALI_API || (BASE ? BASE + "/chat" : ""));
  var MAKS_MSJ = 20;                       // had sesi (lindungi kos)
  var WA_DEFAULT = { zmp: "60122310119", mt: "60163119076" };

  var laman = (window.ALI_LAMAN || (document.body.classList.contains("brand-mt") ? "mt" : "zmp"));
  var LISTING_BASE = window.ALI_LISTING_BASE || "listing/";
  var namaLaman = laman === "mt" ? "Mr Tanah" : "Zahir MJ Property";
  var waNum = WA_DEFAULT[laman];
  var konteksListing = document.body.getAttribute("data-listing") || null;   // cth "MT-0023 | Bungalow Land ..."
  var sejarah = [], kira = 0, sibuk = false;

  /* ---------- UI ---------- */
  var css = document.createElement("style");
  css.textContent = `
  .ali-btn{position:fixed;right:16px;bottom:20px;z-index:70;border:0;cursor:pointer;
    background:#0F172A;color:#fff;border-radius:999px;padding:12px 18px;font:600 14.5px/1 'Inter',sans-serif;
    box-shadow:0 10px 30px rgba(15,23,42,.28);display:flex;align-items:center;gap:9px}
  .ali-btn .dot{width:9px;height:9px;border-radius:50%;background:#34D399;box-shadow:0 0 0 4px rgba(52,211,153,.25)}
  .ali-btn:hover{background:#1E293B}
  .ali-panel{position:fixed;right:16px;bottom:20px;z-index:71;width:376px;max-width:calc(100vw - 24px);
    height:min(560px,calc(100vh - 120px));background:#fff;border:1px solid #E2E8F0;border-radius:18px;
    box-shadow:0 24px 60px rgba(15,23,42,.28);display:none;flex-direction:column;overflow:hidden;
    font:400 14.5px/1.55 'Inter',system-ui,sans-serif}
  .ali-panel.on{display:flex}
  .ali-hd{background:#0F172A;color:#fff;padding:12px 14px;display:flex;align-items:center;gap:10px}
  body.brand-mt .ali-hd{background:#065F46}
  .ali-hd .av{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.16);display:grid;place-items:center;
    font-weight:700;font-family:'Plus Jakarta Sans',sans-serif}
  .ali-hd b{font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;display:block}
  .ali-hd small{font-size:11.5px;color:#BFD3E6}
  .ali-hd .x{margin-left:auto;background:none;border:0;color:#fff;font-size:19px;cursor:pointer;line-height:1}
  .ali-body{flex:1;overflow-y:auto;padding:14px;background:#F8FAFC;display:flex;flex-direction:column;gap:10px}
  .ali-m{max-width:86%;padding:10px 13px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}
  .ali-m.ai{background:#fff;border:1px solid #E2E8F0;border-bottom-left-radius:5px}
  .ali-m.me{background:#0F172A;color:#fff;align-self:flex-end;border-bottom-right-radius:5px}
  body.brand-mt .ali-m.me{background:#059669}
  .ali-m small.disc{display:block;margin-top:7px;font-size:11px;color:#64748B}
  .ali-cards{display:flex;flex-direction:column;gap:8px}
  .ali-card{display:flex;gap:9px;background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:8px;align-items:center}
  .ali-card img{width:58px;height:44px;border-radius:8px;object-fit:cover;flex:0 0 auto;background:#E9EEF3}
  .ali-card .t{font-size:13.5px;font-weight:600;line-height:1.25}
  .ali-card .p{font-size:12.5px;color:#0C7A4B;font-weight:700}
  body.brand-mt .ali-card .p{color:#059669}
  .ali-card .l{font-size:11.5px;color:#64748B}
  .ali-cta{display:flex;flex-direction:column;gap:7px;margin-top:2px}
  .ali-form-btn{display:block;text-align:center;background:#fff;border:1.5px solid #0C7A4B;color:#0C7A4B;
    padding:11px 13px;border-radius:11px;font-weight:700;font-size:13.5px}
  body.brand-mt .ali-form-btn{border-color:#059669;color:#059669}
  .ali-form-btn:hover{background:#E8F5EF}
  .ali-wa{margin-top:2px;display:inline-flex;align-items:center;gap:7px;background:#0C7A4B;color:#fff;
    padding:10px 13px;border-radius:11px;font-weight:600;font-size:13.5px;align-self:flex-start}
  body.brand-mt .ali-wa{background:#059669}
  .ali-chips{display:flex;gap:6px;flex-wrap:wrap;padding:9px 12px 0;background:#fff;border-top:1px solid #E2E8F0}
  .ali-chips button{font:600 12.5px 'Inter',sans-serif;background:#F1F5F9;border:1px solid #E2E8F0;color:#0F172A;
    padding:7px 11px;border-radius:999px;cursor:pointer}
  .ali-chips button:hover{background:#E2E8F0}
  .ali-in{display:flex;gap:8px;padding:10px 12px;background:#fff;align-items:center}
  .ali-in input{flex:1;font:400 14.5px 'Inter',sans-serif;border:1.5px solid #E2E8F0;border-radius:11px;
    padding:11px 12px;min-height:44px}
  .ali-in input:focus{outline:3px solid #E8F5EF;border-color:#0C7A4B}
  .ali-in button{background:#0C7A4B;color:#fff;border:0;border-radius:11px;width:46px;height:44px;cursor:pointer;font-size:17px}
  body.brand-mt .ali-in button{background:#059669}
  .ali-src{font-size:10.5px;color:#94A3B8;text-align:center;padding:0 10px 8px}
  .ali-typing span{display:inline-block;width:6px;height:6px;background:#94A3B8;border-radius:50%;margin-right:3px;
    animation:ali-b 1.2s infinite}
  .ali-typing span:nth-child(2){animation-delay:.15s}.ali-typing span:nth-child(3){animation-delay:.3s}
  @keyframes ali-b{0%,60%,100%{opacity:.3}30%{opacity:1}}
  @media(max-width:640px){ .ali-btn{bottom:84px} .ali-panel{bottom:78px;height:min(70vh,540px)} }
  `;
  document.head.appendChild(css);

  var btn = document.createElement("button");
  btn.className = "ali-btn";
  btn.setAttribute("aria-label", "Tanya Ali — pembantu AI");
  btn.innerHTML = '<span class="dot"></span> Tanya Ali';
  document.body.appendChild(btn);

  var panel = document.createElement("div");
  panel.className = "ali-panel";
  panel.innerHTML = `
    <div class="ali-hd"><span class="av">A</span>
      <span><b>Tanya Ali</b><small>Pembantu AI ${namaLaman} · jawab serta-merta 24/7</small></span>
      <button class="x" aria-label="Tutup">✕</button></div>
    <div class="ali-body" id="aliBody"></div>
    <div class="ali-chips" id="aliChips"></div>
    <div class="ali-in"><input id="aliQ" type="text" placeholder="Tulis soalan… cth: ada tanah freehold di Pahang?"
      autocomplete="off"><button id="aliSend" aria-label="Hantar">➤</button></div>
    <div class="ali-src">Dijawab oleh pembantu AI berdasarkan senarai terkini kami. Sahkan sebelum membuat tawaran. <b>Jangan kongsi maklumat sensitif</b> (IC, nombor akaun).</div>`;
  document.body.appendChild(panel);
  var body = panel.querySelector("#aliBody");
  var chips = panel.querySelector("#aliChips");
  var input = panel.querySelector("#aliQ");

  function esc(s) { return String(s).replace(/[<>&]/g, function (c) { return ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]; }); }

  /* elak teks bertukar HTML, tetapi pautan http(s) jadi boleh klik */
  function rich(s) {
    return esc(s).replace(/(https?:\/\/[^\s<]+)/g,
      function (u) { return '<a href="' + u + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">' + u + "</a>"; });
  }

  function bubble(text, cls, disc) {
    var d = document.createElement("div");
    d.className = "ali-m " + cls;
    d.innerHTML = rich(text) + (disc ? '<small class="disc">' + esc(disc) + "</small>" : "");
    body.appendChild(d); body.scrollTop = body.scrollHeight;
    return d;
  }

  function kad(listing) {
    if (!listing || !listing.length) return;
    var wrap = document.createElement("div");
    wrap.className = "ali-cards";
    listing.forEach(function (l) {
      var c = document.createElement("a");
      c.className = "ali-card";
      c.href = LISTING_BASE + l.kod + ".html";
      c.innerHTML = (l.imej ? '<img src="' + l.imej + '" alt="' + esc(l.tajuk) + '" loading="lazy">' : '') +
        '<span><span class="t">' + esc(l.tajuk) + '</span><br><span class="p">' + esc(l.harga) +
        '</span> <span class="l">· ' + esc(l.lokasi) + " · " + esc(l.kod) + "</span></span>";
      wrap.appendChild(c);
    });
    body.appendChild(wrap); body.scrollTop = body.scrollHeight;
  }

  function butangBorang(cta) {
    if (!cta || !cta.length) return;
    var wrap = document.createElement("div");
    wrap.className = "ali-cta";
    cta.forEach(function (c) {
      var a = document.createElement("a");
      a.className = "ali-form-btn";
      a.href = c.url; a.target = "_blank"; a.rel = "noopener";
      a.textContent = c.label;
      a.onclick = function () { if (window.gtag) gtag("event", "ali_borang", { borang: c.label }); };
      wrap.appendChild(a);
    });
    body.appendChild(wrap); body.scrollTop = body.scrollHeight;
  }

  function hosWa(url, teks) {
    var a = document.createElement("a");
    a.className = "ali-wa"; a.href = url; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "💬 " + teks;
    body.appendChild(a); body.scrollTop = body.scrollHeight;
  }

  function setChips(arr) {
    chips.innerHTML = "";
    arr.forEach(function (t) {
      var b = document.createElement("button");
      b.textContent = t; b.onclick = function () { hantar(t); };
      chips.appendChild(b);
    });
  }

  function buka() {
    panel.classList.add("on"); btn.style.display = "none";
    if (!body.children.length) {
      bubble("Salam! Saya Ali, pembantu AI " + namaLaman + ". Saya boleh bantu cari hartanah, terangkan " +
        (laman === "mt" ? "data tanah (keluasan, hakmilik, sekatan, akses)" : "butiran rumah (harga, saiz, hakmilik)") +
        " dan atur lawatan tapak.", "ai");
      setChips(laman === "mt"
        ? ["Ada tanah freehold di Pahang?", "Tanah bawah RM1 juta", "Nak lawatan tapak", "Tanya pasukan"]
        : ["Rumah teres bawah RM600k", "Rumah di Bangi", "Kira ansuran bulanan", "Nak lawatan tapak"]);
    }
    input.focus();
  }
  btn.onclick = buka;
  panel.querySelector(".x").onclick = function () { panel.classList.remove("on"); btn.style.display = "flex"; };

  function hantar(teks) {
    teks = (teks || input.value || "").trim();
    if (!teks || sibuk) return;
    if (kira >= MAKS_MSJ) { bubble("Had sesi dicapai. Sila teruskan di WhatsApp — kami sedia membantu.", "ai"); return; }
    kira++; input.value = "";
    bubble(teks, "me");
    setChips([]);
    sibuk = true;
    var tunggu = bubble("", "ai");
    tunggu.classList.add("ali-typing");
    tunggu.innerHTML = "<span></span><span></span><span></span>";
    fetch(ALI_API, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soalan: teks, sejarah: sejarah.slice(-6), laman: laman, listing: konteksListing })
    }).then(function (r) { return r.json(); }).then(function (d) {
      tunggu.remove();
      if (!d.ok) { bubble(d.ralat || "Maaf, ada masalah teknikal.", "ai"); return; }
      bubble(d.jawapan, "ai");
      kad(d.listing);
      butangBorang(d.cta);
      hosWa(d.wa, "Bercakap dengan " + (laman === "mt" ? "Mr Tanah" : "Zahir MJ Property"));
      setChips(["Ada lagi pilihan?", "Berapa ansuran bulanan?", "Nak lawatan tapak"]);
      sejarah.push({ role: "user", content: teks }, { role: "assistant", content: d.jawapan });
      if (window.gtag) gtag("event", "ali_chat", { soalan: teks.slice(0, 60) });
    }).catch(function () {
      tunggu.remove();
      bubble("Maaf, talian AI terganggu. Boleh WhatsApp kami terus.", "ai");
      hosWa("https://wa.me/" + waNum, "WhatsApp sekarang");
    }).then(function () { sibuk = false; });
  }
  panel.querySelector("#aliSend").onclick = function () { hantar(); };
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") hantar(); });

  /* teguran kontekstual di halaman butiran */
  if (konteksListing) {
    setTimeout(function () {
      if (!panel.classList.contains("on")) {
        btn.innerHTML = '<span class="dot"></span> Tanya tentang lot ini';
      }
    }, 1200);
  }
})();
