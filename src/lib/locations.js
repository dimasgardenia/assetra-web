/* Daftar lokasi Indonesia untuk autocomplete pencarian (sementara, lokal).
   Fokus: kota besar + kawasan properti populer. Nanti bisa diganti dengan
   Google Places Autocomplete tanpa mengubah komponen pemakainya. */

export const ID_LOCATIONS = [
  // — Jakarta & kawasan —
  'Jakarta', 'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara',
  'Menteng, Jakarta Pusat', 'Gondangdia, Jakarta Pusat', 'Tanah Abang, Jakarta Pusat',
  'Kebayoran Baru, Jakarta Selatan', 'SCBD, Jakarta Selatan', 'Senayan, Jakarta Selatan',
  'Kuningan, Jakarta Selatan', 'Kemang, Jakarta Selatan', 'Pondok Indah, Jakarta Selatan',
  'Cilandak, Jakarta Selatan', 'Fatmawati, Jakarta Selatan', 'TB Simatupang, Jakarta Selatan',
  'Sudirman, Jakarta Pusat', 'Thamrin, Jakarta Pusat', 'Kelapa Gading, Jakarta Utara',
  'PIK, Jakarta Utara', 'PIK 2, Jakarta Utara', 'Pluit, Jakarta Utara', 'Kembangan, Jakarta Barat',
  'Puri Indah, Jakarta Barat', 'Kelapa Gading Timur, Jakarta Utara',

  // — Jabodetabek —
  'Depok, Jawa Barat', 'Bekasi, Jawa Barat', 'Bogor, Jawa Barat', 'Sentul, Bogor', 'Sentul City, Bogor',
  'Tangerang, Banten', 'Tangerang Selatan, Banten', 'BSD City, Tangerang Selatan',
  'Alam Sutera, Tangerang Selatan', 'Gading Serpong, Tangerang Selatan', 'Bintaro, Tangerang Selatan',
  'Serpong, Tangerang Selatan', 'Cibubur, Jakarta Timur', 'Karawang, Jawa Barat',

  // — Bali —
  'Bali', 'Denpasar, Bali', 'Canggu, Bali', 'Seminyak, Bali', 'Kuta, Bali', 'Legian, Bali',
  'Ubud, Bali', 'Sanur, Bali', 'Nusa Dua, Bali', 'Jimbaran, Bali', 'Uluwatu, Bali',
  'Pererenan, Bali', 'Berawa, Bali', 'Tabanan, Bali', 'Gianyar, Bali',

  // — Jawa Barat —
  'Bandung, Jawa Barat', 'Dago, Bandung', 'Dago Atas, Bandung', 'Setiabudi, Bandung',
  'Cimahi, Jawa Barat', 'Lembang, Bandung Barat', 'Cirebon, Jawa Barat', 'Sukabumi, Jawa Barat',

  // — Jawa Tengah & DIY —
  'Semarang, Jawa Tengah', 'Solo, Jawa Tengah', 'Yogyakarta', 'Sleman, Yogyakarta',
  'Bantul, Yogyakarta', 'Magelang, Jawa Tengah', 'Salatiga, Jawa Tengah',

  // — Jawa Timur —
  'Surabaya, Jawa Timur', 'Malang, Jawa Timur', 'Batu, Jawa Timur', 'Sidoarjo, Jawa Timur',
  'Gresik, Jawa Timur', 'Kediri, Jawa Timur',

  // — Sumatera —
  'Medan, Sumatera Utara', 'Palembang, Sumatera Selatan', 'Pekanbaru, Riau', 'Batam, Kepulauan Riau',
  'Padang, Sumatera Barat', 'Bandar Lampung, Lampung', 'Jambi', 'Bengkulu',

  // — Kalimantan —
  'Balikpapan, Kalimantan Timur', 'Samarinda, Kalimantan Timur', 'Pontianak, Kalimantan Barat',
  'Banjarmasin, Kalimantan Selatan', 'IKN Nusantara, Kalimantan Timur',

  // — Sulawesi & timur —
  'Makassar, Sulawesi Selatan', 'Manado, Sulawesi Utara', 'Kendari, Sulawesi Tenggara',
  'Palu, Sulawesi Tengah', 'Ambon, Maluku', 'Jayapura, Papua', 'Mataram, NTB', 'Lombok, NTB',
  'Kupang, NTT', 'Labuan Bajo, NTT',
];

/** Cari saran lokasi dari input pengguna. Mengutamakan yang diawali query,
   lalu yang mengandung query. `extra` = lokasi tambahan (mis. dari listing DB). */
export function suggestLocations(query, extra = [], limit = 7) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const pool = [...new Set([...extra, ...ID_LOCATIONS])];
  const starts = [];
  const contains = [];
  for (const loc of pool) {
    const l = loc.toLowerCase();
    if (l.startsWith(q)) starts.push(loc);
    else if (l.includes(q)) contains.push(loc);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}
