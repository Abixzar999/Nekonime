// Membaca data dari localStorage dengan aman.
// Jika data kosong, rusak, atau localStorage diblokir, kembalikan nilai cadangan.
export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Menyimpan data ke localStorage. Gagal menyimpan tidak boleh merusak aplikasi.
export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Diabaikan: misalnya penyimpanan penuh atau mode privat.
  }
}
