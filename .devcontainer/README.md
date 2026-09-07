# Assetra di Codespaces

Codespace ini otomatis:
1. meng-clone `assetra-api` di sebelah repo ini (branch yang sama, fallback `main`),
2. `npm ci` untuk keduanya dan seed data demo,
3. menjalankan API di port 3001 dan Vite di port 5173 setiap kali Codespace start.

**Buka aplikasinya:** tab **Ports** (atau notifikasi "port 5173 forwarded") → klik ikon globe
di baris **Assetra Web**. URL-nya bisa dibuka di Chrome HP selama Anda login GitHub.

Akun demo: `admin@assetra.co.id` / `admin123` · `bidder@assetra.co.id` / `bidder123`

Restart server: `bash .devcontainer/start.sh` · Log: `/tmp/assetra-api.log`, `/tmp/assetra-web.log`

## Email verifikasi sungguhan (opsional)

Tanpa konfigurasi, server berjalan **mode demo**: email tidak dikirim, dan halaman "Cek email Anda"
menampilkan tombol **Verifikasi sekarang (mode demo)**.

Agar email benar-benar terkirim:
1. Buat API key di https://resend.com (gratis).
2. Buka https://github.com/settings/codespaces → **New secret** → nama `RESEND_API_KEY`, isi key-nya,
   centang repo `assetra-web`. Opsional: `RESEND_FROM` (mis. `Assetra <no-reply@domain-anda.com>`,
   domain harus terverifikasi di Resend; pengirim default `onboarding@resend.dev` hanya bisa mengirim
   ke email pemilik akun Resend).
3. Restart Codespace (atau jalankan `bash .devcontainer/start.sh` setelah secret dibuat).
