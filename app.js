// Zahir MJ Property — app.js (laman utama: cari, filter, susun, render)
const SITE = window.SITE || {};
const DATA = (window.LISTINGS || []).filter(l => l.active !== false);
const PHONE = (SITE.phone || "012-2310119").replace(/[-\s]/g, "");
const WA = SITE.whatsapp || "60" + PHONE;

function fmt(n) {
  return "RM" + Number(n).toLocaleString("en-MY");
}

// --- Pengumpulan projek (berbilang unit dalam hartanah sama, cth Intana Ria) ---
function projSlug(l) {
  if (l.project) return String(l.project).trim().toLowerCase();
  return (l.title || "").toLowerCase()
    .replace(/\blevel\s*\d+/g, " ").replace(/\bblok\s*\d+/g, " ")
    .replace(/\bunit\s*[\w-]+/g, " ").replace(/\b\d{3,4}\s*sqft\b/g, " ")
    .replace(/\s+/g, " ").trim();
}
function sameSpec(a, b) {
  return a.price === b.price && a.land_area === b.land_area
    && a.bedrooms === b.bedrooms && a.bathrooms === b.bathrooms;
}
function buildProjects(list) {
  const groups = {};
  for (const l of list) {
    const k = projSlug(l);
    (groups[k] = groups[k] || []).push(l);
  }
  const out = [];
  for (const k in groups) {
    const g = groups[k];
    // Gabung hanya jika ≥2 unit DAN spec TIDAK serupa sepenuhnya (elak pendua palsu)
    if (g.length >= 2 && !g.slice(1).every(x => sameSpec(g[0], x))) out.push(g);
  }
  return out;
}
const PROJECTS = buildProjects(DATA);
function projectOf(l) {
  return PROJECTS.find(p => p.some(u => u.tracking === l.tracking));
}

// Placeholder bila tiada gambar (ganti automatik bila images[] diisi)
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
function typeIcon(l) { return TYPE_ICON[l.type] || "🏠"; }
function typeGrad(l) { return TYPE_GRAD[l.type] || "g-teres"; }

function mediaHTML(l, link, extra = []) {
  const img = l.images && l.images.length ? l.images[0] : "";
  const badges = [];
  if (l.jenis) badges.push(`<span class="badge badge-${(l.jenis || "jual").toLowerCase()}">${l.jenis}</span>`);
  if (l.status === "BARU") badges.push('<span class="badge badge-baru">BARU</span>');
  if (l.status === "PROMOSI") badges.push('<span class="badge badge-promo">⚡ PROMOSI</span>');
  badges.push(...extra);
  const inner = img
    ? `<img src="${img}" alt="${l.title}" loading="lazy">`
    : `<div class="placeholder ${typeGrad(l)}"><span class="ph-icon">${typeIcon(l)}</span><span class="ph-text">${l.type || "Hartanah"}</span></div>`;
  return `<a class="card-media" href="${link}" aria-label="${l.title}">
    ${inner}
    <div class="badges">${badges.join("")}</div>
  </a>`;
}

function card(l) {
  const url = "listing/" + encodeURIComponent(l.tracking) + ".html";
  const waMsg = encodeURIComponent(`Assalamualaikum dan salam sejahtera, saya berminat dengan listing ${l.tracking} - ${l.title} (${l.price_label}). Adakah masih tersedia?`);
  const specs = [];
  if (l.bedrooms > 0) specs.push(`🛏️ ${l.bedrooms} bilik`);
  if (l.bathrooms > 0) specs.push(`🚿 ${l.bathrooms} bilik air`);
  if (l.land_area && l.land_area !== "-") specs.push(`📐 ${l.land_area}`);
  if (l.built_up && l.built_up !== "-") specs.push(`🏗️ ${l.built_up}`);
  if (l.tenure && l.tenure !== "-") specs.push(`📜 ${l.tenure}`);

  const oldPrice = l.price_old ? `<span class="price-old">${fmt(l.price_old)}</span>` : "";

  return `
  <article class="card">
    ${mediaHTML(l, url)}
    <div class="card-body">
      <h3 class="card-title"><a href="${url}">${l.title}</a></h3>
      <p class="card-loc">📍 ${l.location}</p>
      ${l.description ? `<p class="card-desc">${l.description}</p>` : ""}
      <div class="price-row"><span class="price">${l.price_label}</span>${oldPrice}</div>
      ${specs.length ? `<div class="specs">${specs.join("")}</div>` : ""}
      <div class="card-actions">
        <a class="btn btn-wa-card" href="https://wa.me/${WA}?text=${waMsg}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="btn btn-call" href="tel:+${WA}">Panggil</a>
        <a class="btn btn-detail" href="${url}">Butiran →</a>
      </div>
      <div class="card-foot">${l.tracking} · ${l.date || ""}</div>
    </div>
  </article>`;
}

// Kad projek — gabungan N unit dalam hartanah sama → 1 kad, harga "Dari"
function projectCard(units) {
  const sorted = [...units].sort((a, b) => (a.price || 0) - (b.price || 0));
  const best = sorted[0];
  const slug = best.project || projSlug(best);
  const url = "projek/" + encodeURIComponent(slug) + ".html";
  const name = best.project_name || best.title;
  const count = units.length;
  const minP = best.price_label || fmt(best.price);
  const maxP = sorted[sorted.length - 1].price_label || fmt(sorted[sorted.length - 1].price);
  const waMsg = encodeURIComponent(`Assalamualaikum dan salam sejahtera, saya berminat dengan projek ${name} (Dari ${minP}). Unit mana yang masih tersedia?`);
  const specs = [];
  if (best.bedrooms > 0) specs.push(`🛏️ ${best.bedrooms} bilik`);
  if (best.bathrooms > 0) specs.push(`🚿 ${best.bathrooms} bilik air`);
  if (best.tenure && best.tenure !== "-") specs.push(`📜 ${best.tenure}`);
  specs.push(`🏠 ${count} unit tersedia`);
  const unitLabels = sorted.map(u => u.unit || u.tracking).filter(Boolean).join(" · ");

  return `
  <article class="card card-proj">
    ${mediaHTML(best, url, [`<span class="badge badge-proj">${count} UNIT</span>`])}
    <div class="card-body">
      <h3 class="card-title"><a href="${url}">${name}</a></h3>
      <p class="card-loc">📍 ${best.location}</p>
      <p class="card-desc">${count} unit tersedia: ${unitLabels}. Bandingkan harga, tingkat & ciri setiap unit.</p>
      <div class="price-row"><span class="price">Dari ${minP}</span>${maxP !== minP ? `<span class="price-range">hingga ${maxP}</span>` : ""}</div>
      ${specs.length ? `<div class="specs">${specs.join("")}</div>` : ""}
      <div class="card-actions">
        <a class="btn btn-wa-card" href="https://wa.me/${WA}?text=${waMsg}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="btn btn-call" href="tel:+${WA}">Panggil</a>
        <a class="btn btn-detail" href="${url}">Lihat Unit →</a>
      </div>
      <div class="card-foot">${count} unit · ${best.type} · pelbagai pilihan</div>
    </div>
  </article>`;
}

// --- Filter & sort ---
const params = new URLSearchParams(location.search);
let state = params.get("state") || "";
let type = params.get("type") || "";
let q = params.get("q") || "";
let min = params.get("min") || "";
let max = params.get("max") || "";
let sort = params.get("sort") || "newest";

function apply() {
  const items = DATA.filter(l => {
    if (state && l.state !== state) return false;
    if (type && l.type !== type) return false;
    const hay = (l.title + " " + l.location + " " + (l.description || "") + " " + l.tracking).toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (min !== "" && !(l.price >= Number(min))) return false;
    if (max !== "" && !(l.price <= Number(max))) return false;
    return true;
  });
  if (sort === "priceAsc") items.sort((a, b) => (a.price || 0) - (b.price || 0));
  else if (sort === "priceDesc") items.sort((a, b) => (b.price || 0) - (a.price || 0));
  else items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // Gabungkan unit projek jadi satu kad projek (dedupe ikut projek)
  const seenProj = new Set();
  const merged = [];
  for (const l of items) {
    const p = projectOf(l);
    if (!p) { merged.push(l); continue; }
    const key = p[0].project || projSlug(p[0]);
    if (seenProj.has(key)) continue;
    seenProj.add(key);
    merged.push({ __proj: p });
  }

  const grid = document.getElementById("listingGrid");
  const empty = document.getElementById("emptyMsg");
  grid.innerHTML = merged.map(x => x.__proj ? projectCard(x.__proj) : card(x)).join("");
  const count = document.getElementById("resultCount");
  count.textContent = merged.length
    ? `${merged.length} listing dijumpai` + (state ? ` · ${state}` : "") + (type ? ` · ${type}` : "")
    : "Tiada hasil";
  empty.style.display = merged.length ? "none" : "block";

  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (state) p.set("state", state);
  if (type) p.set("type", type);
  if (min) p.set("min", min);
  if (max) p.set("max", max);
  if (sort && sort !== "newest") p.set("sort", sort);
  const qs = p.toString();
  history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
}

// --- Init (hanya jika elemen grid wujud) ---
const gridEl = document.getElementById("listingGrid");
if (gridEl) {
  const stSel = document.getElementById("stateFilter");
  const tySel = document.getElementById("typeFilter");
  const states = [...new Set(DATA.map(l => l.state).filter(Boolean))].sort();
  states.forEach(s => { const o = document.createElement("option"); o.value = s; o.textContent = s; stSel.appendChild(o); });
  const types = [...new Set(DATA.map(l => l.type).filter(Boolean))].sort();
  types.forEach(t => { const o = document.createElement("option"); o.value = t; o.textContent = t; tySel.appendChild(o); });

  const setVal = (sel, v) => { if (v) sel.value = v; };
  setVal(stSel, state); setVal(tySel, type);
  document.getElementById("searchInput").value = q;
  document.getElementById("minPrice").value = min;
  document.getElementById("maxPrice").value = max;
  document.getElementById("sortSelect").value = sort;

  const sync = () => {
    q = document.getElementById("searchInput").value.trim();
    state = stSel.value; type = tySel.value;
    min = document.getElementById("minPrice").value;
    max = document.getElementById("maxPrice").value;
    sort = document.getElementById("sortSelect").value;
    apply();
  };
  ["searchInput", "stateFilter", "typeFilter", "minPrice", "maxPrice", "sortSelect"].forEach(id =>
    document.getElementById(id).addEventListener(id === "searchInput" ? "input" : "change", sync)
  );
  document.getElementById("clearBtn").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    stSel.value = ""; tySel.value = "";
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";
    document.getElementById("sortSelect").value = "newest";
    state = type = q = min = max = ""; sort = "newest";
    apply();
  });
  apply();
}

// Mobile nav toggle (dikongsi semua halaman)
const toggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");
if (toggle) toggle.addEventListener("click", () => nav.classList.toggle("open"));
