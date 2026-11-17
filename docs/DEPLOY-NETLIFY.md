# Panduan Deployment ke Netlify
## BANGUN DATAR ADVENTURE — KOMPOSISI BANGUN DATAR KELAS IV SD

Proyek ini telah dikonfigurasi secara penuh untuk publikasi di **Netlify** lengkap dengan routing SPA (`/guru` dan `/*`) serta **Netlify Serverless Functions** (`netlify/functions/submit-reflection.ts` dan `netlify/functions/retry-sheet-sync.ts`).

---

## 1. Struktur Konfigurasi `netlify.toml`

Berkas `netlify.toml` di root proyek sudah mengatur:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`
- **Redirects**: Mengarahkan `/guru` dan seluruh rute SPA `/*` ke `/index.html` dengan status `200` sehingga halaman tidak mengalami `404 Not Found` saat di-*refresh*.

---

## 2. Langkah Deploy melalui GitHub / Git Repository (Direkomendasikan)

1. Unggah (*push*) seluruh kode proyek ini ke repositori GitHub Anda.
2. Masuk ke [Netlify Dashboard](https://app.netlify.com/) lalu klik **Add new site → Import an existing project**.
3. Pilih **GitHub** dan pilih repositori `bangun-datar-adventure`.
4. Netlify akan mendeteksi pengaturan dari `netlify.toml` secara otomatis:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. Sebelum atau sesudah klik **Deploy site**, buka **Site configuration → Environment variables** dan tambahkan variabel dari `.env.example`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIRESTORE_DATABASE_ID`
   - `GOOGLE_SHEETS_WEBHOOK_URL`
   - `VITE_GOOGLE_SHEETS_SPREADSHEET_URL`
6. Tambahkan domain Netlify Anda (contoh: `bangun-datar-adventure.netlify.app`) ke daftar **Authorized domains** di **Firebase Console → Authentication → Settings**.

---

## 3. Langkah Pengujian Setelah Deploy

1. **Uji Navigasi Sidebar**:
   - Buka URL utama situs Netlify Anda, klik **MULAI BELAJAR**, lalu tekan tombol **Menu** di kiri atas.
   - Pastikan sidebar kiri muncul dengan mulus dan dapat ditutup melalui tombol `X`, klik area gelap, atau tombol `Escape`.
2. **Uji Cetak & Simpan PDF Sertifikat**:
   - Buka menu **6. Sertifikat**, isi **Nama Lengkap Siswa**, lalu klik **Cetak Sertifikat** atau **Simpan sebagai PDF**.
   - Pastikan pratinjau cetak menampilkan 1 halaman **A4 Landscape** utuh tanpa sidebar/header.
3. **Uji Refleksi Siswa Online**:
   - Buka menu **7. Refleksi**, isi **Nama Lengkap Siswa** dan **Kelas** (misal `IV-A`), pilih ekspresi **Seru Banget!**, tulis pesan, lalu klik **Kirim Refleksi Hari Ini**.
4. **Uji Dashboard Guru (`/guru`)**:
   - Akses `https://nama-situs-anda.netlify.app/guru` dari perangkat atau peramban lain.
   - Masuk menggunakan akun Guru Firebase Authentication.
   - Pastikan kiriman refleksi siswa muncul di tabel secara *real-time*, filter kelas/ekspresi berfungsi, dan tombol **Export CSV** mengunduh berkas CSV dengan benar.
