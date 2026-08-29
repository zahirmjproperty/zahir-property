// Zahir MJ Property — listing.js (halaman butiran: galeri, specs, peta, unit serupa)
const SITE = window.SITE || {};
const DATA = (window.LISTINGS || []).filter(l => l.active !== false);
const PHONE = (SITE.phone || "012-2310119").replace(/[-\s]/g, "");
const WA = SITE.whatsapp || "60" + PHONE;

function fmt(n) { return "RM" + Number(n).toLocaleString("en-MY"); }

const TYPE_ICON = {
  "Rumah Teres": "🏠", "Rumah Semi-D": "🏡", "Rumah": "🏠",
  "Tanah": "🌳", "Komersial": "🏢", "Bangunan Komersial": "🏢",
  "Apartment": "🏢", "Kondo": "🏢"
};
const TYPE_GRAD = {
  "Rumah Teres": "g-teres", "Rumah Semi-D": "g-semid", "Rumah": "g-teres",
  "Tanah": "g-tanah", "Komersial": "g-komersial", "Bangunan Komersial": "g-komersial",
  "Apartment": "g-komersial", "Kondo": "g-komersial"
};
const typeIcon = l => TYPE_ICON[l.type] || "🏠";
const typeGrad = l => TYPE_GRAD[l.type] || "g-teres";

// --- Galeri / Lightbox ---
let lbIndex = 0, lbImgs = [];

function openLightbox(i) {
  if (!lbImgs.length) return;
  lbIndex = i;
  const lb = document.getElementById("lightbox");
  lb.hidden = false;
  updateLightbox();
  document.body.style.overflow = "hidden";
}
function updateLightbox() {
  const img = document.getElementById("lbImg");
  const cap = document.getElementById("lbCaption");
  img.src = lbImgs[lbIndex];
  cap.textContent = `Gambar ${lbIndex + 1} / ${lbImgs.length}`;
}
function closeLightbox() {
  document.getElementById("lightbox").hidden = true;
  document.body.style.overflow = "";
}

function galleryHTML(l) {
  const imgs = (l.images || []).filter(Boolean);
  if (!imgs.length) {
    return `<div class="gallery gallery-empty">
      <div class="placeholder ph-large ${typeGrad(l)}">
        <span class="ph-icon">${typeIcon(l)}</span>
        <span class="ph-text">${l.type || "Hartanah"} — gambar akan dikemaskini</span>
      </div>
      <p class="ph-note">Foto sebenar unit akan dimuatkan sebaik sahaja tersedia.</p>
    </div>`;
  }
  lbImgs = imgs;
  const thumbs = imgs.map((src, i) =>
    `<button class="thumb" data-i="${i}" aria-label="Gambar ${i + 1}"><img src="${src}" alt="Gambar ${i + 1}" loading="lazy"></button>`
  ).join("");
  return `<div class="gallery">
    <div class="gallery-main">
      <img src="${imgs[0]}" alt="${l.title}" id="mainImg">
      <span class="g-counter">1 / ${imgs.length}</span>
    </div>
    <div class="gallery-thumbs">${thumbs}</div>
  </div>`;
}

function specsTable(l) {
  const rows = [
    ["Jenis", l.type || "-"],
    ["Bilik Tidur", l.bedrooms > 0 ? l.bedrooms + " bilik" : "Tidak dinyatakan"],
    ["Bilik Air", l.bathrooms > 0 ? l.bathrooms + " bilik" : "Tidak dinyatakan"],
    ["Keluasan Tanah", l.land_area && l.land_area !== "-" ? l.land_area : "Tidak dinyatakan"],
    ["Keluasan Binaan", l.built_up && l.built_up !== "-" ? l.built_up : "Tidak dinyatakan"],
    ["Hakmilik", l.tenure && l.tenure !== "-" ? l.tenure : "Tidak dinyatakan"]
  ];
  return `<table class="spec-table">${rows.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join("")}</table>`;
}

function chipList(items) {
  return items && items.length ? `<div class="chips">${items.map(i => `<span class="chip">${i}</span>`).join("")}</div>` : "";
}

function renderDetail(l) {
  document.title = l.title + " — " + (SITE.name || "Zahir MJ Property");
  const waMsg = encodeURIComponent(`Assalamualaikum dan salam sejahtera, saya berminat dengan listing ${l.tracking} - ${l.title} (${l.price_label}). Boleh kongsi maklumat lanjut?`);
  const shareMsg = encodeURIComponent(`${l.title} - ${l.price_label} — ${SITE.domain || ""}listing.html?id=${encodeURIComponent(l.tracking)}`);
  const badges = [];
  if (l.jenis) badges.push(`<span class="badge badge-${(l.jenis || "jual").toLowerCase()}">${l.jenis}</span>`);
  if (l.status === "BARU") badges.push('<span class="badge badge-baru">BARU</span>');
  if (l.status === "PROMOSI") badges.push('<span class="badge badge-promo">⚡ PROMOSI</span>');
  const oldPrice = l.price_old ? `<p class="price-old-line">Harga asal: ${fmt(l.price_old)}</p>` : "";
  const mapSrc = "https://www.google.com/maps?q=" + encodeURIComponent(l.location) + "&output=embed";

  // Unit serupa: sama jenis dulu, kemudian sama negeri
  const related = DATA.filter(x => x.tracking !== l.tracking && (x.type === l.type || x.state === l.state)).slice(0, 3);
  const relatedHTML = related.length ? `
    <section class="detail-section">
      <h2>Unit Serupa</h2>
      <div class="grid grid-3">${related.map(x => `
        <article class="card card-mini">
          ${x.images && x.images.length
            ? `<a class="card-media" href="listing.html?id=${encodeURIComponent(x.tracking)}"><img src="${x.images[0]}" alt="${x.title}" loading="lazy"></a>`
            : `<a class="card-media" href="listing.html?id=${encodeURIComponent(x.tracking)}"><div class="placeholder ${typeGrad(x)}"><span class="ph-icon">${typeIcon(x)}</span></div></a>`}
          <div class="card-body">
            <h3 class="card-title"><a href="listing.html?id=${encodeURIComponent(x.tracking)}">${x.title}</a></h3>
            <p class="card-loc">📍 ${x.location}</p>
            <div class="price">${x.price_label}</div>
          </div>
        </article>`).join("")}
      </div>
    </section>` : "";

  document.getElementById("detailRoot").innerHTML = `
  <article class="detail">
    <div class="detail-top">
      <div class="detail-gallery">${galleryHTML(l)}</div>
      <div class="detail-info">
        <div class="badges">${badges.join("")}</div>
        <h1>${l.title}</h1>
        <p class="card-loc">📍 ${l.location}</p>
        <div class="detail-price">
          <span class="price price-lg">${l.price_label}</span>
          ${oldPrice}
        </div>
        <div class="detail-specs">${specsTable(l)}</div>
        <div class="detail-actions">
          <a class="btn btn-wa btn-block" href="https://wa.me/${WA}?text=${waMsg}" target="_blank" rel="noopener">📲 WhatsApp Saya — ${SITE.phone}</a>
          <a class="btn btn-call btn-block" href="tel:+${WA}">📞 Panggil ${SITE.phone}</a>
          <a class="btn btn-share" href="https://wa.me/?text=${shareMsg}" target="_blank" rel="noopener">↗️ Kongsi Listing Ini</a>
        </div>
        <p class="detail-id">Rujukan: ${l.tracking}${l.date ? " · Dikemaskini " + l.date : ""}</p>
      </div>
    </div>

    ${l.description ? `<section class="detail-section">
      <h2>Deskripsi</h2>
      <p class="detail-desc">${l.description}</p>
    </section>` : ""}

    ${l.highlights && l.highlights.length ? `<section class="detail-section">
      <h2>Ciri Utama</h2>
      <ul class="detail-list">${l.highlights.map(h => `<li>${h}</li>`).join("")}</ul>
    </section>` : ""}

    ${l.amenities && l.amenities.length ? `<section class="detail-section">
      <h2>Kemudahan Sekitar</h2>
      ${chipList(l.amenities)}
    </section>` : ""}

    ${l.nearby && l.nearby.length ? `<section class="detail-section">
      <h2>Berdekatan</h2>
      ${chipList(l.nearby)}
    </section>` : ""}

    <section class="detail-section">
      <h2>Lokasi</h2>
      <div class="map-wrap">
        <iframe src="${mapSrc}" title="Peta lokasi ${l.title}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>
    </section>

    <section class="cta-card">
      <h2>Berminat Dengan Listing Ini?</h2>
      <p>Hubungi saya untuk maklumat lanjut, jadual tinjauan (viewing), atau semak kelayakan pembiayaan anda.</p>
      <div class="cta-actions">
        <a class="btn btn-wa" href="https://wa.me/${WA}?text=${waMsg}" target="_blank" rel="noopener">📲 WhatsApp Sekarang</a>
        <a class="btn btn-outline" href="tel:+${WA}">📞 Panggil</a>
      </div>
    </section>

    ${relatedHTML}
  </article>`;

  // Galeri events
  const mainImg = document.getElementById("mainImg");
  if (mainImg) mainImg.addEventListener("click", () => openLightbox(0));
  document.querySelectorAll(".gallery-thumbs .thumb").forEach(t => {
    t.addEventListener("click", () => {
      const i = Number(t.dataset.i);
      document.getElementById("mainImg").src = lbImgs[i];
      document.querySelector(".g-counter").textContent = (i + 1) + " / " + lbImgs.length;
      openLightbox(i);
    });
  });
}

// --- Init ---
const root = document.getElementById("detailRoot");
if (root) {
  const id = new URLSearchParams(location.search).get("id") || "";
  const l = DATA.find(x => x.tracking === id);
  if (!l) {
    root.innerHTML = `<div class="empty">
      <p>Listing tidak dijumpai atau telah dikemaskini.</p>
      <a class="btn btn-wa" href="index.html">← Lihat Semua Listing</a>
    </div>`;
  } else {
    renderDetail(l);
  }

  // Lightbox events
  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lbPrev").addEventListener("click", e => { e.stopPropagation(); if (lbImgs.length) { lbIndex = (lbIndex - 1 + lbImgs.length) % lbImgs.length; updateLightbox(); } });
  document.getElementById("lbNext").addEventListener("click", e => { e.stopPropagation(); if (lbImgs.length) { lbIndex = (lbIndex + 1) % lbImgs.length; updateLightbox(); } });
  document.getElementById("lightbox").addEventListener("click", e => { if (e.target.id === "lightbox") closeLightbox(); });
  document.addEventListener("keydown", e => {
    if (document.getElementById("lightbox").hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") document.getElementById("lbPrev").click();
    if (e.key === "ArrowRight") document.getElementById("lbNext").click();
  });
}

// Mobile nav toggle (dikongsi semua halaman)
const toggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");
if (toggle) toggle.addEventListener("click", () => nav.classList.toggle("open"));
