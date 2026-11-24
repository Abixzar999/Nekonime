import localYouTube from "./providers/localYouTube.js";

// Semua provider yang dikenal aplikasi. Provider yang legalitasnya belum
// terverifikasi tidak boleh didaftarkan di sini.
const ALL_PROVIDERS = [localYouTube];

// Gate tunggal: provider hanya aktif jika diaktifkan DAN lisensinya terverifikasi.
export function getActiveProviders() {
  return ALL_PROVIDERS.filter(
    (provider) => provider && provider.enabled === true && provider.license?.verified === true
  );
}

// Info ringkas untuk endpoint diagnostik. Tidak membocorkan implementasi internal.
export function listProviders() {
  return getActiveProviders().map((provider) => ({
    id: provider.id,
    label: provider.label,
    license: provider.license.note,
    verified: true,
  }));
}
