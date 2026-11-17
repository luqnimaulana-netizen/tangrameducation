# Panduan Konfigurasi Firebase (Cloud Firestore & Authentication)
## BANGUN DATAR ADVENTURE — KOMPOSISI BANGUN DATAR KELAS IV SD

Aplikasi ini sudah dilengkapi konfigurasi Firebase terintegrasi pada berkas `firebase-applet-config.json`, aturan keamanan pada `firestore.rules` (dan `firebase/firestore.rules`), serta indeks kueri pada `firebase/firestore.indexes.json`.

Panduan ini menjelaskan cara mengelola proyek Firebase yang sudah ada atau menghubungkan aplikasi ke proyek Firebase baru milik sekolah/pengajar.

---

## 1. Membuat atau Membuka Proyek Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih proyek yang sudah diprovisikan (`fluted-acronym-tlvvl`) atau klik **Add project / Buat proyek** jika ingin menggunakan proyek baru.
3. Pada halaman utama proyek, klik ikon **Web (`</>`)** untuk mendaftarkan aplikasi web dengan nama `Bangun Datar Adventure`.
4. Salin nilai konfigurasi `firebaseConfig` ke dalam variabel lingkungan Netlify (`VITE_FIREBASE_*`) sesuai contoh pada `.env.example`.

---

## 2. Mengaktifkan Cloud Firestore Database

1. Di menu sebelah kiri Firebase Console, buka **Build → Firestore Database**.
2. Klik **Create database** (pilih lokasi region terdekat, misalnya `asia-southeast2 (Jakarta)` atau `nam5`).
3. Koleksi utama yang digunakan aplikasi secara otomatis adalah:
   - `/reflections/{reflectionId}` — Menyimpan seluruh kiriman refleksi siswa lintas perangkat.
   - `/admins/{adminUid}` — Opsional: daftar UID pengajar tambahan selain akun email utama.

### Struktur Dokumen `/reflections/{reflectionId}`
Setiap dokumen refleksi memiliki skema tervalidasi:
- `id` (`string`): ID unik idempoten.
- `studentName` (`string`): Nama lengkap siswa (2–100 karakter).
- `studentClass` (`string`): Kelas siswa (misal `IV-A`, `IV-B`).
- `feeling` (`'seru' | 'bosan'`): Pilihan ekspresi perasaan siswa.
- `message` (`string`): Pesan dan kesan siswa (0–1000 karakter).
- `createdAt` (`string`): Waktu kirim format ISO 8601.
- `createdAtTimestamp` (`number`): Waktu kirim dalam milidetik epoch (untuk pengurutan).
- `serverCreatedAt` (`timestamp`): Timestamp resmi dari server Firestore (`request.time`).
- `source` (`string`): `'bangun-datar-adventure-v2'`.
- `syncStatus` (`'synced' | 'pending' | 'failed'`): Status sinkronisasi ke Google Sheets.

---

## 3. Memasang Firestore Security Rules

1. Di halaman **Firestore Database**, buka tab **Rules**.
2. Salin seluruh isi berkas `firebase/firestore.rules` (atau `/firestore.rules` di root proyek) lalu tempelkan ke editor Rules.
3. Klik **Publish**.

### Prinsip Keamanan yang Diterapkan:
- **Siswa tanpa akun**: Dapat melakukan `create` pada `/reflections/{reflectionId}` **hanya jika** seluruh field wajib valid, tipe datanya tepat, ukuran string sesuai batas, `source == 'bangun-datar-adventure-v2'`, dan `serverCreatedAt == request.time`.
- **Proteksi Privasi**: Pengguna publik/siswa **tidak dapat** melakukan `get`, `list`, atau `delete` pada dokumen refleksi.
- **Akses Guru**: Hanya akun Guru yang terautentikasi melalui Firebase Authentication yang dapat membaca daftar refleksi (`list` & `get`) di `/guru`.

---

## 4. Mengaktifkan Firebase Authentication untuk Guru

1. Di Firebase Console, buka **Build → Authentication → Get started**.
2. Pada tab **Sign-in method**, aktifkan metode berikut:
   - **Email/Password**: Klik Enable → Save.
   - **Google**: Klik Enable → Pilih email dukungan proyek → Save.
3. Buka tab **Users** lalu klik **Add user**:
   - Masukkan email guru (misal: `guru@sdn4.sch.id`) dan kata sandi yang kuat.
   - Akun Email/Password yang terdaftar di sini dapat langsung masuk melalui halaman `/guru`.
4. Untuk login menggunakan tombol **Masuk dengan Akun Google Guru**, pastikan domain Netlify Anda (misal `nama-aplikasi.netlify.app`) sudah ditambahkan ke **Authentication → Settings → Authorized domains**.
