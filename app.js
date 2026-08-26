// Zahir Property — app.js
// Data dimuat dari data/listings.json (fail JSON tulen yang Ali kemas kini setiap kali ada listing baru)

const SITE = window.SITE || {};
const DATA = window.LISTINGS || [];
const PHONE = (SITE.phone || "012-2310119").replace(/-/g, "").replace(/\s/g, "");
const WA = SITE.whatsapp || "60" + PHONE;

function fmt(n) {
  return "RM" + Number(n).toLocaleString("en-MY");
}

function card(l) {
  const waMsg = encodeURIComponent(`Assalamualaikum, saya berminat dengan listing ${l.tracking} - ${l.title} (${l.price_label}). Adakah masih tersedia?`);
  const badges = [];
  if (l.status === "BARU") badges.push('<span class="badge">BARU</span>');
  if (l.status === "PROMOSI") badges.push('<span class="badge promo">⚡ PROMOSI</span>');
  const specs = [];
  if (l.bedrooms) specs.push(`🛏️ ${l.bedrooms} bilik`);
  if (l.bathrooms) specs.push(`🚿 ${l.bathrooms} bilik air`);
  if (l.land_area && l.land_area !== "-") specs.push(`📐 Tanah ${l.land_area}`);
  if (l.built_up && l.built_up !== "-") specs.push(`🏗️ ${l.built_up}`);
  if (l.tenure && l.tenure !== "-") specs.push(`📜 ${l.tenure}`);

  const hls = (l.highlights || []).map(h => `<li>${h}</li>`).join("");

  return `
  <article class="card">
    <div class="card-media">
      🏠
      ${badges.join("")}
    </div>
    <div class="card-body">
      <h3 class="card-title">${l.title}</h3>
      <p class="card-loc">📍 ${l.location}</p>
      <div class="price">${l.price_label}${l.price ? "" : ""}</div>
      ${specs.length ? `<div class="specs">${specs.join("")}</div>` : ""}
      ${hls ? `<ul class="highlights">${hls}</ul>` : ""}
      <p class="card-desc">${l.description || ""}</p>
      <div class="card-actions">
        <a class="btn btn-wa-card" href="https://wa.me/${WA}?text=${waMsg}" target="_blank">WhatsApp</a>
        <a class="btn btn-call" href="tel:+${WA}">Panggil</a>
      </div>
      <div class="card-foot">${l.tracking} · ${l.source || ""} · ${l.date || ""}</div>
    </div>
  </article>`;
}

function render(filterType = "", query = "") {
  const grid = document.getElementById("listingGrid");
  const empty = document.getElementById("emptyMsg");
  q = query.toLowerCase().trim();
  const items = DATA.filter(l => {
    const okType = !filterType || l.type === filterType;
    const hay = (l.title + " " + l.location + " " + (l.description || "")).toLowerCase();
    const okQ = !q || hay.includes(q);
    return okType && okQ;
  });
  grid.innerHTML = items.map(card).join("");
  empty.style.display = items.length ? "none" : "block";
}

document.getElementById("searchInput").addEventListener("input", e => {
  render(document.getElementById("typeFilter").value, e.target.value);
});
document.getElementById("typeFilter").addEventListener("change", e => {
  render(e.target.value, document.getElementById("searchInput").value);
});

render();
