---
description: Panduan Lengkap Publikasi Aplikasi ke Google Play Store
---

# Panduan Publikasi Aplikasi ke Google Play Store

Workflow ini akan membimbingmu langkah demi langkah untuk mem-publish aplikasi **Prefrontal (Brain)** ke Google Play Store.

## Persiapan Awal
1.  **Akun Google Play Console**: Kamu harus memiliki akun developer ($25 sekali bayar). Daftar di [play.google.com/console](https://play.google.com/console).
2.  **Keystore**: Kunci digital untuk menandatangani aplikasimu.
3.  **Aset Grafis**:
    *   Ikon Aplikasi (sudah ada di aplikasi).
    *   Ikon Play Store: 512 x 512 px (PNG).
    *   Grafis Fitur (Banner): 1024 x 500 px.
    *   Screenshot Aplikasi (Minimal 2 untuk HP).

## Langkah 1: Build Versi Produksi
Pastikan kode terbaru sudah dibuild dan disinkronisasi.

```bash
cd client
npm run build
npx cap sync android
```
// turbo-all

## Langkah 2: Generate Signed Bundle (AAB) di Android Studio
Google Play mewajibkan format **.aab (Android App Bundle)** bukan .apk untuk publikasi baru.

1.  Buka **Android Studio**.
2.  Buka project `c:\Projek\client\android`.
3.  Di menu atas, pilih **Build** > **Generate Signed Bundle / APK**.
4.  Pilih **Android App Bundle** > **Next**.
5.  **Key Store Path**:
    *   Klik **Create new...**
    *   Simpan file `.jks` di tempat aman (JANGAN SIMPAN DI DALAM FOLDER PROJECT YANG DI-UPLOAD KE GIT PUBLIK).
    *   Isi Password (ingat baik-baik!).
    *   Isi Alias (misal: `key0`) dan Password key.
    *   Certificate: Isi "First and Last Name" saja sudah cukup.
6.  Klik **Next**.
7.  Pilih **Release**.
8.  Klik **Create**.
9.  Tunggu proses selesai. File akan muncul di `android/app/release/app-release.aab`.

## Langkah 3: Setup di Google Play Console
1.  **Buat Aplikasi**: Klik **Create App**.
2.  **Isi Detail**:
    *   App Name: `Prefrontal: Productivity & AI` (Contoh).
    *   Default Language: Indonesian / English.
    *   App or Game: App.
    *   Free or Paid: Free.
3.  **Setup Store Listing**:
    *   Upload Icon (512x512).
    *   Upload Feature Graphic (1024x500).
    *   Upload Screenshots (Bisa ambil screenshot dari emulator/HP saat menjalankan aplikasi).
4.  **Privacy Policy**: Kamu wajib punya URL Privacy Policy. (Bisa gunakan generator gratis seperti *TermsFeed* atau *Privact Policy Generator* lalu host di Google Sites/Notion/Github Pages).

## Langkah 4: Upload Bundle
1.  Masuk ke menu **Testing** > **Internal testing** (Disarankan untuk tes awal) atau **Production** (Langsung rilis).
2.  **Create new release**.
3.  Upload file `.aab` yang tadi dibuat di Langkah 2.
4.  Beri nama rilis (misal: `1.0.0 Initial Release`).
5.  **Save** dan **Review Release**.

## Langkah 5: Peluncuran
1.  Selesaikan semua "Inbox" tasks di Dashboard (Content Rating, Target Audience, News Apps, dll).
2.  Setelah semua centang hijau, kembali ke menu **Production** > **Releases**.
3.  Klik **Start Rollout to Production**.
4.  Tunggu review dari tim Google (biasanya 1-7 hari).

---
**Tips Penting:**
*   **Simpan Keystore (.jks)** dan password-nya di tempat SANGAT AMAN (Google Drive, Password Manager). Jika hilang, kamu TIDAK BISA update aplikasi selamanya.
*   Jangan lupa naikkan `versionCode` di `build.gradle` setiap kali mau update versi baru nanti.
