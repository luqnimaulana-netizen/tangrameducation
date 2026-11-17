# Panduan Integrasi Google Sheets (Otomatis via Apps Script & Netlify Functions)
## BANGUN DATAR ADVENTURE — KOMPOSISI BANGUN DATAR KELAS IV SD

Selain tersimpan secara *real-time* di **Cloud Firestore** (dan dapat diunduh kapan saja melalui tombol **Export CSV** di Dashboard Guru `/guru`), setiap refleksi siswa juga dapat diteruskan secara otomatis ke **Google Sheets** menggunakan Google Apps Script Web App.

---

## 1. Membuat Google Spreadsheet Baru

1. Buka [Google Sheets](https://sheets.new) dan buat spreadsheet baru dengan nama:
   **`Rekap Refleksi Siswa — Bangun Datar Adventure`**
2. Ubah nama sheet pertama (di bagian bawah) menjadi **`Refleksi`** (atau biarkan default, script akan otomatis membuat/menggunakan sheet aktif).
3. Pada baris pertama (`Baris 1`), buat judul kolom berikut secara berurutan dari kolom **A sampai H**:
   - **A1**: `Timestamp Server`
   - **B1**: `ID Refleksi`
   - **C1**: `Waktu Kirim (ISO)`
   - **D1**: `Nama Lengkap Siswa`
   - **E1**: `Kelas`
   - **F1**: `Ekspresi Perasaan`
   - **G1**: `Pesan dan Kesan Siswa`
   - **H1**: `Sumber Aplikasi`

---

## 2. Memasang Kode Google Apps Script

1. Di dalam Google Spreadsheet tersebut, klik menu **Extensions (Ekstensi) → Apps Script**.
2. Hapus kode bawaan di `Code.gs`, lalu tempelkan kode lengkap berikut:

```javascript
/**
 * Google Apps Script Web App — Bangun Datar Adventure
 * Menerima kiriman refleksi siswa dari Netlify Function (submit-reflection)
 */

// Opsional: Isi jika Anda mengatur GOOGLE_SHEETS_WEBHOOK_SECRET di Netlify
const EXPECTED_SECRET = '';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ status: 'error', message: 'Empty payload' }, 400);
    }

    const data = JSON.parse(e.postData.contents);

    if (EXPECTED_SECRET && data.secret !== EXPECTED_SECRET) {
      return jsonResponse({ status: 'error', message: 'Unauthorized secret' }, 403);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Refleksi');
    if (!sheet) {
      sheet = ss.getActiveSheet();
    }

    // Tambahkan header otomatis jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp Server',
        'ID Refleksi',
        'Waktu Kirim (ISO)',
        'Nama Lengkap Siswa',
        'Kelas',
        'Ekspresi Perasaan',
        'Pesan dan Kesan Siswa',
        'Sumber Aplikasi',
      ]);
    }

    sheet.appendRow([
      new Date(),
      String(data.id || ''),
      String(data.createdAt || new Date().toISOString()),
      String(data.studentName || ''),
      String(data.studentClass || ''),
      String(data.feeling || ''),
      String(data.message || '-'),
      String(data.source || 'bangun-datar-adventure-v2'),
    ]);

    return jsonResponse({
      synced: true,
      status: 'synced',
      message: 'Berhasil disimpan ke Google Sheets',
    });
  } catch (err) {
    return jsonResponse({
      synced: false,
      status: 'failed',
      message: String(err),
    });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

3. Klik ikon **Save (Simpan)** (`Ctrl + S`).

---

## 3. Deploy sebagai Web App

1. Klik tombol **Deploy → New deployment** di pojok kanan atas editor Apps Script.
2. Klik ikon roda gigi di samping **Select type**, lalu pilih **Web app**.
3. Isi pengaturan berikut:
   - **Description**: `Webhook Refleksi Bangun Datar Adventure`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone` *(Penting agar serverless function Netlify dapat mengirim data tanpa terblokir halaman login Google)*
4. Klik **Deploy**, berikan izin akses (*Authorize access*), lalu salin **Web app URL** yang berakhiran `/exec`.

---

## 4. Menghubungkan ke Netlify Environment Variables

1. Buka dashboard situs Anda di **Netlify → Site configuration → Environment variables**.
2. Tambahkan variabel berikut:
   - `GOOGLE_SHEETS_WEBHOOK_URL`: Tempelkan URL Web App Apps Script (`https://script.google.com/macros/s/.../exec`).
   - `VITE_GOOGLE_SHEETS_SPREADSHEET_URL`: Tempelkan URL Google Spreadsheet Anda (`https://docs.google.com/spreadsheets/d/.../edit`) agar tombol **Buka Google Sheets** di Dashboard Guru langsung membuka spreadsheet tersebut.
3. Lakukan **Trigger deploy** di Netlify agar variabel lingkungan aktif.
