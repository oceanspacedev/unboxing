# Unboxing Web (React)

Redesign [unboxing.id](https://unboxing.id/) dengan React + Vite + React Router.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output ke dist/
npm run scrape         # perbarui katalog dari unboxing.id → public/data/products.json
npm run scrape:prices  # ambil harga & status dari halaman detail (±45 menit, bisa dilanjut)
npm run map            # bangun ulang peta titik footer + daftar toko (src/assets/stores.json)
```

## Halaman

| Route | Isi |
| --- | --- |
| `/` | Beranda: banner promo, kategori, baris produk (Terbaru, Di bawah Rp3 juta, Laptop), brand. Peta toko ada di footer (semua halaman). |
| `/produk` | Katalog lengkap: cari, filter kategori/harga/brand/RAM/penyimpanan, urutkan (termasuk harga termurah/termahal), paginasi. Semua filter tersimpan di URL, jadi bisa dibagikan. |
| `/produk/:slug` | Detail produk, spesifikasi, produk serupa, tombol tanya harga via WhatsApp |
| `/lokasi-toko` | Daftar 69 toko per kota (cari + filter grup), peta Google interaktif yang zoom ke toko terpilih, tombol rute |
| `/bandingkan` | Perbandingan hingga 4 produk, highlight harga termurah & RAM/penyimpanan terbesar, mode "hanya perbedaan", link bersama `?ids=` |

Pilihan perbandingan disimpan di `localStorage` browser pengunjung.

## Struktur

- `src/data.js`: konten (menu, banner, produk unggulan, kategori, toko grup, alamat head office, sosial media).
- `public/data/products.json`: snapshot katalog (±1.250 produk), dimuat sekali saat halaman katalog dibuka.
- `scripts/scrape-catalog.mjs`: pengambil katalog (REST API WordPress + halaman `/semua-produk/`). Brand dikoreksi dari nama produk karena tag brand di situs asli ada yang salah; TWS, smartwatch, dan band dipindah ke kategori Aksesoris. Harga yang sudah diambil tetap dipertahankan.
- `scripts/scrape-prices.mjs`: pengambil harga per produk (2 request paralel + jeda 0,7 detik). Progres disimpan di `scripts/.cache/prices.json`; kalau terhenti, jalankan lagi dan ia melanjutkan. `-- --refresh` untuk mengambil ulang semua.
- `scripts/build-map.mjs` → `src/assets/store-map.json`: peta titik Indonesia (Natural Earth via `world-atlas`) + pin toko dari KML Google My Maps "Member Unboxing". Toko duplikat di KML (nama & titik sama) dibuang, lalu dikelompokkan per kota terdekat. Hasilnya juga dipakai halaman `/lokasi-toko` (`src/assets/stores.json`).
- `src/lib/`: helper katalog (`catalog.js`), state perbandingan (`compare.js`, `CompareProvider.jsx`), judul tab (`useTitle.js`).
- `src/pages/`: satu file per route. `src/components/`: komponen bersama.
- `src/styles.css`: seluruh styling (token warna di `:root`).

## Deploy

Ini SPA: server harus mengarahkan semua route ke `index.html`. Untuk Apache/Laragon sudah disediakan `public/.htaccess` (ikut tersalin ke `dist/`).

## Catatan

- Harga adalah snapshot saat `scrape:prices` dijalankan (tanggalnya tampil di halaman detail). Produk tanpa harga tampil "Tanya harga ke CS" dan selalu di urutan terakhir saat diurutkan berdasarkan harga.
- Di beberapa produk, unboxing.id sendiri menampilkan harga salah (mis. "Rp3" untuk Rp2.999.000) karena harga diinput sebagai teks. Scraper mengambil angka dari baris spesifikasi "Price" / `itemprop=price`, bukan dari tampilan itu.
- Gambar masih diambil langsung dari `unboxing.id/wp-content/uploads`.
