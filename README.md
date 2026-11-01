# Brevet Pajak UNPAM Serang

Website publik dan konsep portal pembelajaran Kelas Privat Brevet Pajak A dan B — Program Studi Akuntansi S1 Universitas Pamulang Kampus Kota Serang.

## Frontend
- Landing page responsif dengan visual navy, putih, dan emas.
- Informasi Brevet A, Brevet B, dan paket A & B.
- Informasi biaya sesuai formulir program.
- Alur pendaftaran, FAQ, modal daftar/login, dan navigasi mobile.
- Ilustrasi dashboard LMS.

## File
- `index.html` — halaman utama dan konten.
- `styles.css` — gaya visual responsif.
- `script.js` — interaksi menu, modal, dan demo formulir.

## Deploy GitHub Pages
1. Buka repository **Settings → Pages**.
2. Pada **Build and deployment**, pilih **Deploy from a branch**.
3. Pilih branch `main` dan folder `/ (root)`.
4. Klik **Save**, lalu tunggu workflow Pages selesai.
5. Buka URL Pages yang ditampilkan GitHub.

## Catatan penting
Saat ini repository berisi frontend statis. Formulir pendaftaran dan login masih berupa simulasi antarmuka; tidak ada data yang dikirim atau disimpan. Untuk mengoperasikan LMS sungguhan, integrasikan backend, autentikasi aman, database, penyimpanan dokumen privat, akses berbasis peran (peserta/admin/instruktur), jadwal kelas, materi, pembayaran, kehadiran, dan audit log.

Jangan menyimpan password, NIK, KTM, bukti pembayaran, atau dokumen pribadi di JavaScript publik atau repository. Rekening/QRIS, logo resmi, pengajar, kurikulum, detail sertifikasi, dan jadwal angkatan perlu dikonfirmasi dan disetujui pihak kampus/panitia sebelum dipublikasikan.

Konten program awal mengacu pada formulir pendaftaran Kelas Privat Brevet Pajak A dan B Tahun 2026.

## Google Sheets backend
Setup guide: [GOOGLE-SHEETS-SETUP.md](GOOGLE-SHEETS-SETUP.md). Apps Script source: [apps-script/Code.gs](apps-script/Code.gs). Before the form can save registrations, deploy the Apps Script web app and paste its public /exec URL into config.js. Admin dashboard and records live in a Google Sheet shared only with authorized staff.