
# SIMPA - Sistem Informasi Manajemen Pemeliharaan AC

**SIMPA** adalah aplikasi yang dirancang untuk membantu CV Suralaya dalam mengelola dan mencatat hasil pemeliharaan unit AC. Sistem ini memungkinkan pengguna untuk mencatat informasi tentang proyek pemeliharaan, kondisi unit AC, serta hasil pembersihan baik pada bagian indoor maupun outdoor. Pengguna juga dapat mengunggah foto kondisi AC sebelum dan sesudah perawatan dilakukan.

## Teknologi yang Digunakan

- **Backend:** NestJS (Framework Node.js)
- **Frontend:** React (Vite)
- **Database:** MySQL
- **Authentication:** JWT & OAuth 2.0
- **Storage:** Cloud Storage (untuk foto sebelum dan sesudah maintenance)

## Fitur Utama

1. **Manajemen Proyek:** Memungkinkan pembuatan dan pengelolaan proyek pemeliharaan AC.
2. **Pencatatan Unit AC:** Menyimpan data unit AC yang diperiksa dan dipelihara.
3. **Pencatatan Hasil Pemeliharaan:** Mencatat kondisi unit AC, baik untuk bagian indoor maupun outdoor, beserta hasil pembersihan dan pemeriksaan.
4. **Unggah Foto:** Mengunggah foto kondisi unit AC sebelum dan sesudah pemeliharaan.
5. **Akses Pengguna:** Sistem akses berbasis role untuk pengguna (misalnya, admin, teknisi).
6. **Dashboard:** Visualisasi status dan laporan pemeliharaan AC.

## Instalasi

### Backend (NestJS)

1. Clone repository:
   ```bash
   git clone https://github.com/yourusername/simpa-backend.git
   ```
2. Install dependencies:
   ```bash
   cd simpa-backend
   npm install
   ```
3. Konfigurasi `.env` untuk koneksi ke database MySQL:
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=simpa
   ```
4. Jalankan aplikasi:
   ```bash
   npm run start
   ```

### Frontend (React + Vite)

1. Clone repository:
   ```bash
   git clone https://github.com/yourusername/simpa-frontend.git
   ```
2. Install dependencies:
   ```bash
   cd simpa-frontend
   npm install
   ```
3. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

## Struktur Direktori

### Backend

- `src/` - Kode sumber aplikasi NestJS.
  - `modules/` - Setiap fitur dipecah dalam modul.
  - `controllers/` - Pengendali untuk menerima request dan mengembalikan response.
  - `services/` - Layanan yang menangani logika aplikasi.
  - `entities/` - Struktur tabel untuk MySQL.
  
### Frontend

- `src/` - Kode sumber aplikasi React.
  - `components/` - Komponen-komponen yang digunakan di aplikasi.
  - `pages/` - Halaman utama untuk UI.
  - `services/` - Fungsi-fungsi untuk berkomunikasi dengan backend.

## Cara Penggunaan

1. Login sebagai pengguna dengan role tertentu (admin/teknisi).
2. Tambahkan proyek dan unit AC.
3. Lakukan pemeliharaan AC dan unggah foto kondisi sebelum dan sesudah perawatan.
4. Periksa hasil pemeliharaan dan status unit AC.
5. Pantau laporan melalui dashboard yang disediakan.

## Kontribusi

Jika Anda tertarik untuk berkontribusi pada proyek ini, silakan fork repository dan buat pull request.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
