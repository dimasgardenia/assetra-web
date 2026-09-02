# assetra-web
assetra front end

## Menjalankan & testing di HP (Google Chrome)

Frontend dan API berjalan di laptop/PC Anda; HP hanya membuka satu URL.
Vite dev server sudah dikonfigurasi `host: true` dan mem-proxy `/api` serta
`/files` ke backend, jadi tidak perlu ubah CORS atau `VITE_API_BASE`.

```bash
# Terminal 1 — API
cd assetra-api && npm install && npm run seed && npm run dev

# Terminal 2 — Web
cd assetra-web && npm install && npm run dev
```

Vite akan mencetak alamat `Network: http://192.168.x.x:5173/`.

**Cara A — Wi-Fi yang sama (paling mudah)**
1. Pastikan HP dan laptop terhubung ke Wi-Fi yang sama.
2. Buka Chrome di HP, ketik alamat `Network` di atas, mis. `http://192.168.1.10:5173`.
3. Jika tidak bisa diakses, izinkan port 5173 di firewall laptop (Windows Defender / macOS Firewall).

**Cara B — Kabel USB (tanpa Wi-Fi, Android)**
1. Aktifkan *USB debugging* di HP, sambungkan ke laptop.
2. Di Chrome laptop buka `chrome://inspect/#devices` → *Port forwarding* → tambah `5173` → `localhost:5173`.
3. Di Chrome HP buka `http://localhost:5173`.

Akun demo: `admin@assetra.co.id` / `admin123` dan `bidder@assetra.co.id` / `bidder123`.

Jika backend berjalan di host/port lain, set `API_PROXY_TARGET=http://host:port` sebelum `npm run dev`.

## Testing dari HP saja (tanpa laptop)

**GitHub Codespaces** — server berjalan di cloud GitHub, gratis 60 jam/bulan untuk akun personal.
1. Di Chrome HP buka `https://github.com/dimasgardenia/assetra-web`, pilih branch yang ingin diuji.
2. Tombol **Code → Codespaces → Create codespace on <branch>** (atau buka `https://github.com/codespaces/new?repo=dimasgardenia/assetra-web&ref=<branch>`).
3. Tunggu ±2 menit. `.devcontainer/` otomatis meng-clone `assetra-api`, install, seed, dan menjalankan API + Vite.
4. Buka tab **Ports** → baris **Assetra Web (5173)** → ikon globe. Itu URL aplikasinya di HP Anda.

Detail ada di `.devcontainer/README.md`. Alternatif dengan URL publik permanen: lihat `render.yaml` di repo `assetra-api`.
