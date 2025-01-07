# SIMPA - Sistem Informasi Manajemen Pemeliharaan AC

<div align="center">

![SIMPA Logo](logo.png)

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

## 📖 Deskripsi

**SIMPA** (Sistem Informasi Manajemen Pemeliharaan AC) adalah aplikasi komprehensif yang dikembangkan untuk CV Suralaya, dirancang khusus untuk mengoptimalkan proses manajemen dan pemeliharaan unit AC. Sistem ini menyediakan solusi end-to-end untuk pencatatan, pemantauan, dan pelaporan kegiatan pemeliharaan AC.

### 🎯 Tujuan Utama
- Meningkatkan efisiensi pencatatan dan pemantauan pemeliharaan AC
- Menyediakan dokumentasi digital yang terstruktur
- Memudahkan pelacakan riwayat pemeliharaan setiap unit AC
- Mengoptimalkan pengelolaan jadwal pemeliharaan
- Meningkatkan kualitas layanan melalui dokumentasi yang lebih baik

## 🚀 Fitur Utama

### 1. Manajemen Proyek
- Pembuatan dan pengelolaan proyek pemeliharaan
- Penjadwalan otomatis
- Tracking progress proyek real-time
- Notifikasi status proyek

### 2. Manajemen Unit AC
- Pencatatan detail spesifikasi unit AC
- Pelacakan lokasi unit
- Riwayat pemeliharaan komprehensif
- Pengelolaan inventaris komponen

### 3. Dokumentasi Pemeliharaan
- Form digital pemeriksaan AC
- Checklist pemeliharaan terstandar
- Upload foto sebelum dan sesudah pemeliharaan
- Catatan teknis dan rekomendasi

### 4. Sistem Pelaporan
- Dashboard analitik real-time
- Laporan pemeliharaan berkala
- Export data dalam berbagai format
- Visualisasi data performa unit AC

### 5. Manajemen Pengguna
- Sistem role-based access control
- Autentikasi JWT
- Manajemen tim teknisi
- Tracking aktivitas pengguna

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS
- **Database:** MySQL
- **ORM:** TypeORM
- **Authentication:** JWT + Bcrypt
- **API Documentation:** Swagger/OpenAPI
- **Testing:** Jest

### Frontend
- **Framework:** React (Vite)
- **State Management:** Redux Toolkit
- **UI Components:** Material-UI
- **Forms:** React Hook Form + Yup
- **HTTP Client:** Axios
- **Charts:** Recharts

### DevOps & Tools
- **Version Control:** Git
- **CI/CD:** GitHub Actions
- **Containerization:** Docker
- **Cloud Storage:** AWS S3
- **Monitoring:** Sentry

## 📦 Struktur Proyek

```
simpa/
├── backend/
│   ├── src/
│   │   ├── auth/           # Autentikasi dan otorisasi
│   │   ├── projects/       # Manajemen proyek
│   │   ├── units/          # Manajemen unit AC
│   │   ├── maintenance/    # Pencatatan pemeliharaan
│   │   ├── users/          # Manajemen pengguna
│   │   └── common/         # Shared utilities dan helpers
│   ├── test/               # Unit dan integration tests
│   └── docs/               # Dokumentasi API
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Halaman aplikasi
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── utils/          # Helper functions
│   ├── public/             # Asset statis
│   └── tests/              # Unit tests
│
└── docs/                   # Dokumentasi proyek
```

## 🚀 Panduan Instalasi

### Prasyarat
- Node.js (v14 atau lebih baru)
- MySQL (v8.0 atau lebih baru)
- Git
- npm atau yarn

### Langkah Instalasi

1. **Clone Repository**
   ```bash
   git clone https://github.com/Habiboys/SIMPA.git
   cd SIMPA
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Konfigurasi environment
   cp .env.example .env
   # Edit .env sesuai konfigurasi lokal
   
   # Jalankan migrations
   npm run migration:run
   
   # Start development server
   npm run start:dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Konfigurasi environment
   cp .env.example .env
   # Edit .env sesuai kebutuhan
   
   # Start development server
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=simpa_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# AWS S3
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key
AWS_BUCKET=your_bucket_name
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_AWS_S3_URL=https://your-bucket.s3.region.amazonaws.com
```

## 📱 Fitur per Role Pengguna

### Admin
- Manajemen pengguna dan role
- Pembuatan dan pengelolaan proyek
- Akses ke semua laporan dan analytics
- Konfigurasi sistem

### Admin Lapangan
- Manajemen tim teknisi
- Pencatatan hasil pemeliharaan
- Upload dokumentasi foto
- Akses ke laporan spesifik proyek

## 🤝 Kontribusi

Kami sangat menghargai kontribusi dari komunitas. Untuk berkontribusi:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Format Commit

Format commit mengikuti [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Contoh:
- feat: menambahkan fitur upload foto
- fix: memperbaiki bug di form login
- docs: memperbarui dokumentasi API

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

## 📞 Kontak

- **Developer:** [Nama Anda]
- **Email:** [Email Anda]
- **Website:** [Website Anda]

---

<div align="center">
Dibuat dengan ❤️ oleh Tim SIMPA
</div>
