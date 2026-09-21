// Konfigurasi Auth (Supabase) — kunci AWAM sahaja (publishable/anon).
// JANGAN letak kunci rahsia (sb_secret / service_role) di sini.
window.AUTH = {
  url: "https://ntvlqfsisanztdeqhpxh.supabase.co",
  key: "sb_publishable_rPZ8734eOqaX3Mx-yyhN4w_Ta44wsCS",
  api: "https://script.google.com/macros/s/AKfycbwafaViIuCpc-Q0XnUpSHgkKVTFcyfPProf0GvSi9C-L22hUsZ_NA-03wXjd2F-GRIS/exec",
  // Pendaftaran akaun (portal/daftar.html). captcha.siteKey = Cloudflare Turnstile SITE key (awam).
  // Kosong = widget CAPTCHA tidak dipaparkan. Isi selepas Turnstile dihidupkan di Supabase.
  captcha: { siteKey: "0x4AAAAAAE7xoFfuqgi1uPkt" },
  daftarRedirect: "https://mrtanah.com/portal/login.html"
};
