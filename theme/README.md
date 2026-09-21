# Tema Zahir MJ Property (ZMP)

Aset tema boleh-guna-semula untuk laman **zahirmjproperty.com**.
Dua sistem warna disimpan — kedua-duanya dipratonton sebelum diluluskan.

---

## 1. `theme-luxury.css` — Tema LUXURY (v2, semasa)

Arah semasa: **Midnight Navy + Champagne Gold + Electric Cyan**.
Dijana daripada `mockup-luxury.html` (2026-09-21).

| Token | Nilai | Guna |
|---|---|---|
| `--navy` | `#071525` | Latar utama |
| `--navy-deep` | `#040E1B` | Footer / lapisan gelap |
| `--blue` | `#102A46` | Permukaan, panel |
| `--gold` | `#E8C57A` | Aksen utama, harga, ikon |
| `--gold-pale` | `#F6DEA3` | Sorotan emas, butang |
| `--cyan` | `#63E5FF` | Aksen futuristik, bingkai bercahaya |
| `--silver` | `#C8CED8` | Teks sokongan |
| `--warm-white` | `#F7F5EF` | Teks utama |
| `--muted` | `#AAB4C3` | Teks lemah |
| `--whatsapp` | `#25D366` | Butang WhatsApp (kekal) |

Tipografi: **Manrope** (tajuk) · **Inter** (teks) · **Cormorant Garamond** (editorial, italik).

Kelas sedia guna:
- `.luxury-border` — bingkai bercahaya berjalan (emas→cyan), guna pada panel carian, kad trust, panel CTA penting. **Jangan** guna pada setiap kad.
- `.t-gold` / `.t-silver` — tajuk metalik.
- Pada `max-width:768px` kesan glow dimatikan sendiri; `prefers-reduced-motion` menggantikan animasi dengan bingkai statik.

## 2. `theme.css` — Tema NAVY/GOLD (v1, asal)

Obsidian navy `#06121D` + champagne gold `#D8B56A` (daripada `mockup-redesign.html`).
Masih sah untuk halaman lain jika mahu nada yang lebih tenang (tanpa cyan).

---

## Peraturan penting

1. **Teks atas butang emas mesti gelap** — `#16233A` di atas `#E8C57A`. Teks ivory/warm-white di atas emas gagal kontras WCAG (nisbah 1.74:1). Jangan guna.
2. **Glow berlebihan** — hadkan `.luxury-border` kepada 4–6 elemen penting sahaja setiap halaman.
3. **Imej**: guna `loading="lazy"` + `onerror` fallback tempatan (imej Google Drive kadangkala gagal).
4. **Jangan letak teks penting dalam imej** (kekalkan teks HTML hidup).
5. **Focus visible** mesti ada pada semua elemen interaktif (`:focus-visible`).
6. Semua kad diuji tanpa overflow mendatar pada lebar 415px.

## Fail

| Fail | Isi |
|---|---|
| `theme-luxury.css` | Token v2 + `.luxury-border` + tajuk metalik + media queries |
| `tokens-luxury.json` | Token v2 dalam format DTCG |
| `theme.css` | Token v1 (navy/gold) |
| `tokens.json` | Token v1 dalam format DTCG |
| `tailwind.theme.json` | Token v1 untuk Tailwind |

## Aset berkaitan

- `assets/logo-zmj-monogram.png` — monogram ZMJ (perisai), latar lutsinar → header, favicon
- `assets/logo-zmp-full.png` — logo penuh "ZAHIR MJ PROPERTY" (latar lutsinar; teks "PROPERTY" berwarna navy — guna atas permukaan cerah sahaja)
- `images/zahir-hero.webp` / `.jpg` — hero 1920px
- `images/zahir-hero-mobile.webp` — hero 960px untuk peranti mudah alih
