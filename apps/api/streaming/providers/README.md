# Menambah Provider Streaming

Folder ini hanya boleh berisi provider yang **memiliki izin distribusi yang jelas**.
Scraper situs agregator tidak diaktifkan sampai legalitasnya terverifikasi.

## Checklist sebelum mendaftarkan provider

1. Sumber memiliki pernyataan lisensi/izin distribusi yang bisa ditunjuk.
2. URL yang dikembalikan adalah URL resmi dari pemegang hak, bukan hasil scrape.
3. Tidak melewati DRM, autentikasi, paywall, atau proteksi akses.
4. Tipe sumber sesuai:
   - `youtube` → `youtubeId`
   - `file` → `url` langsung `.mp4`/`.m3u8`
   - `embed` → `url` halaman embed resmi
5. Provider mengembalikan `license.verified: true` hanya setelah checklist di atas terpenuhi.

## Langkah teknis

1. Buat file di `providers/`, misalnya `providers/exampleProvider.js`.
2. Implementasikan kontrak di `../types.js` (`id`, `label`, `license`, `enabled`, `getStreams`).
3. Daftarkan provider di `../registry.js` pada `ALL_PROVIDERS`.
4. Tambahkan test di `../streaming.test.js` untuk memastikan provider hanya
   mengembalikan sumber yang diharapkan.

Registry akan mengabaikan provider dengan `enabled !== true` atau
`license.verified !== true`.
