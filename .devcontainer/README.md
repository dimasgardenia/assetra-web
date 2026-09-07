# Assetra di Codespaces

Codespace ini otomatis:
1. meng-clone `assetra-api` di sebelah repo ini (branch yang sama, fallback `main`),
2. `npm ci` untuk keduanya dan seed data demo,
3. menjalankan API di port 3001 dan Vite di port 5173 setiap kali Codespace start.

**Buka aplikasinya:** tab **Ports** (atau notifikasi "port 5173 forwarded") → klik ikon globe
di baris **Assetra Web**. URL-nya bisa dibuka di Chrome HP selama Anda login GitHub.

Akun demo: `admin@assetra.co.id` / `admin123` · `bidder@assetra.co.id` / `bidder123`

Restart server: `bash .devcontainer/start.sh` · Log: `/tmp/assetra-api.log`, `/tmp/assetra-web.log`

## Email verifikasi (wajib untuk pendaftaran manual)

Tanpa `RESEND_API_KEY`, akun tetap dibuat tetapi email verifikasi/reset sandi tidak bisa dikirim
dan UI menampilkan pesan error konfigurasi (tidak ada lagi mode demo).

1. Buat API key di https://resend.com (gratis).
2. Buka https://github.com/settings/codespaces → **New secret** → nama `RESEND_API_KEY`, isi key-nya,
   centang repo `assetra-web`. Opsional: `RESEND_FROM` (mis. `Assetra <no-reply@domain-anda.com>`,
   domain harus terverifikasi di Resend; pengirim default `onboarding@resend.dev` hanya bisa mengirim
   ke email pemilik akun Resend).
3. Restart Codespace (atau jalankan `bash .devcontainer/start.sh` setelah secret dibuat).

## Google Sign-In (OAuth)

Buat OAuth Client ID (tipe *Web application*) di https://console.cloud.google.com/apis/credentials,
tambahkan URL Codespace port 5173 (`https://<nama>-5173.app.github.dev`) ke **Authorized JavaScript
origins**, lalu simpan sebagai Codespaces secret `GOOGLE_CLIENT_ID` **dan** `VITE_GOOGLE_CLIENT_ID`
(nilai sama). Tanpa ini tombol Google menampilkan pesan belum dikonfigurasi.

## Verifikasi WhatsApp

OTP WhatsApp baru terkirim setelah penyedia diintegrasikan di `sendWhatsAppOtp()`
(`assetra-api/src/controllers/authController.js`). Sebelum itu endpoint menjawab 503 dan pengguna bisa
memilih **Lewati untuk sekarang**.
