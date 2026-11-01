# Integrasi Google Sheets — Brevet Pajak UNPAM Serang

## Apa yang dibuat
- apps-script/Code.gs: Apps Script endpoint untuk menerima pendaftaran dan menyimpan data ke Google Sheets.
- config.js di repository: URL web app publik. Ini bukan password, tetapi jangan masukkan token admin atau rahasia ke sini.
- index.html dan script.js: form mengirim data ke Apps Script melalui iframe tersembunyi sehingga tidak perlu membuka izin CORS.
- Sheet Dashboard berisi rekap otomatis; sheet Pendaftar berisi detail yang perlu dijaga kerahasiaannya.

## A. Buat Google Apps Script
1. Login ke akun Google milik panitia yang akan menjadi pemilik data.
2. Buka https://script.google.com/ lalu klik New project.
3. Ubah nama proyek menjadi Brevet Pajak UNPAM Serang — Registrasi.
4. Ganti isi Code.gs dengan seluruh isi file apps-script/Code.gs di repository ini. Simpan.
5. Di daftar fungsi pilih setupBrevetSheet lalu klik Run. Berikan izin Google yang diminta.
6. Buka Execution log (atau View → Logs) dan salin URL spreadsheet dari log SPREADSHEET_URL. Simpan URL tersebut untuk admin. ID spreadsheet disimpan otomatis di Script Properties, bukan di website.

## B. Deploy endpoint pendaftaran
1. Klik Deploy → New deployment.
2. Klik Select type → Web app.
3. Execute as: Me (akun pemilik script).
4. Who has access: Anyone, karena peserta umum harus dapat mengirim formulir tanpa login Google. Jika pilihan ini tidak tersedia pada akun/domain kampus, admin harus menyesuaikan kebijakan Google Workspace.
5. Klik Deploy, selesaikan otorisasi, lalu salin URL yang berakhiran /exec.
6. Jangan membagikan akses editor Apps Script ke peserta. Hanya admin tepercaya yang boleh mengedit script dan sheet.

## C. Hubungkan URL ke website
1. Buka config.js di GitHub.
2. Ganti string kosong appsScriptUrl: '' dengan URL /exec yang didapat saat deploy, contoh format: https://script.google.com/macros/s/DEPLOYMENT_ID/exec. Jangan pakai URL /dev.
3. Commit perubahan config.js dan tunggu GitHub Pages selesai deploy.

## D. Dashboard admin dan akses
- Buka Google Sheet yang dibuat pada langkah A.
- Bagikan spreadsheet hanya kepada email panitia/admin yang perlu memproses pendaftaran, sebagai Viewer atau Editor sesuai tugas. Jangan aktifkan Anyone with the link.
- Tab Dashboard merangkum total pendaftar, status, pembayaran, dan pilihan program.
- Tab Pendaftar berisi rincian. Admin dapat memperbarui Status Pendaftaran (kolom H) dan Status Pembayaran (kolom I) melalui dropdown.
- Notifikasi yang diminta adalah indikator/rekap pada dashboard sheet; tidak ada email otomatis.

## Data yang disimpan
ID pendaftar, waktu, nama lengkap, email, WhatsApp, program, format kelas, status pendaftaran, status pembayaran. Form awal tidak meminta password, NIK, foto KTP/KTM, atau bukti transfer. Jangan meminta dokumen sensitif melalui field biasa.

## Uji sebelum dipublikasikan
1. Kirim satu pendaftaran uji dengan data yang bukan data pribadi sungguhan.
2. Pastikan baris muncul di Pendaftar dan angka Dashboard berubah.
3. Pastikan browser menampilkan konfirmasi berhasil. Jika gagal, periksa URL /exec, izin Apps Script, dan Execution log.
4. Setelah tes, hapus baris uji.
5. Bila mengubah kode Apps Script setelah deploy, buka Deploy → Manage deployments → Edit → New version → Deploy.

## Batasan dan keamanan
- Endpoint publik dapat disalahgunakan; kode memiliki honeypot dan pembatasan kiriman berulang per email, tetapi ini bukan perlindungan anti-spam sempurna. Pantau sheet dan tambahkan CAPTCHA/validasi tambahan bila trafik publik meningkat.
- URL Apps Script adalah endpoint publik, bukan rahasia. Tidak ada kunci admin di frontend.
- Jangan menaruh password, token rahasia, atau isi Script Properties di GitHub.
- Admin sheet harus memakai akun Google dengan verifikasi dua langkah dan berbagi akses sesedikit mungkin.
- Login di website masih berupa placeholder; jangan gunakan untuk mengumpulkan password. Login peserta/LMS sesungguhnya memerlukan autentikasi terpisah.
- Persetujuan privasi dan periode retensi data perlu ditetapkan penyelenggara sebelum menerima pendaftaran publik.

Dokumentasi resmi Apps Script Web Apps: https://developers.google.com/apps-script/guides/web