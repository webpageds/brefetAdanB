# Setup autentikasi peserta Brevet Pajak UNPAM Serang

Implementasi login menggunakan Firebase Authentication (email/password) dan Cloud Firestore. Password tidak disimpan di Google Sheets maupun dokumen profil.

## 1. Buat dan konfigurasi Firebase

1. Buka https://console.firebase.google.com/ dan buat project.
2. Pada **Authentication → Sign-in method**, aktifkan **Email/Password**.
3. Pada **Authentication → Settings → Authorized domains**, tambahkan domain GitHub Pages website ini (contoh: `webpageds.github.io`). Tambahkan domain custom jika digunakan.
4. Pada **Project settings → General → Your apps**, daftarkan aplikasi Web dan salin konfigurasi Firebase.
5. Masukkan nilai `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, dan `appId` ke objek `firebase` di `config.js`. Firebase web config bukan service-account secret; jangan pernah memasukkan private key Admin SDK ke repo.
6. Buat database Cloud Firestore.
7. Salin isi file `firestore.rules` ke **Firestore Database → Rules**, lalu **Publish**.

## 2. Alur pendaftaran

- Peserta mengisi data dan membuat password minimal 8 karakter.
- Firebase Authentication membuat akun.
- Profil peserta dibuat di `participantProfiles/{uid}` dengan status `pending`.
- Email verifikasi dikirim oleh Firebase.
- Data pendaftaran non-password tetap dikirim ke Google Sheets melalui Apps Script lama.
- Kolom password dan konfirmasi password dinonaktifkan sebelum form dikirim ke Apps Script.

Jika Firestore Rules belum dipasang, pembuatan profil akan ditolak. Jangan menghapus aturan keamanan untuk mengatasi error.

## 3. Verifikasi peserta

Login diblokir sampai email peserta diverifikasi dan status profil disetujui panitia.

Untuk persetujuan manual tahap awal:
1. Buka Firebase Console → Firestore Database → `participantProfiles`.
2. Temukan dokumen dengan ID UID peserta.
3. Pastikan data peserta cocok dengan pendaftaran yang masuk.
4. Ubah field `status` dari `pending` menjadi `approved` melalui Firebase Console.

Jangan pernah menyetujui akun hanya berdasarkan email atau permintaan yang belum diverifikasi. Firestore Rules menolak perubahan status dari browser peserta.

## 4. Batasan saat ini

- Autentikasi baru aktif setelah konfigurasi Firebase diisi dan Firestore Rules dipublikasikan.
- Dashboard peserta, konten LMS, proses persetujuan admin khusus, dan audit log belum dibangun.
- Persetujuan manual lewat Firebase Console hanya untuk tahap awal. Untuk operasional, buat dashboard admin dengan backend tepercaya / Firebase Admin SDK dan role admin yang diverifikasi server-side.
- Pastikan Firebase Authentication dan Firestore quotas/security settings sesuai kebutuhan sebelum peluncuran publik.
