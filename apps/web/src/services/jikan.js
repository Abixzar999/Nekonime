// Layanan untuk mengambil metadata anime dari Jikan API.
// Catatan: Jikan hanya menyediakan METADATA (judul, poster, sinopsis, dll),
// bukan video atau URL streaming.
// Alamat backend NEKONIME (lihat apps/api). Bisa diubah lewat VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const CACHE_TTL_MS = 10 * 60 * 1000; // data dianggap segar selama 10 menit

const memoryCache = new Map();

// Mengambil JSON dari Jikan dengan cache sederhana di memori.
async function fetchJikan(path, signal) {
  const cached = memoryCache.get(path);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return cached.data;
  }

  const response = await fetch(`${BASE_URL}${path}`, { signal });

  if (response.status === 429) {
    throw new Error("Terlalu banyak permintaan. Coba lagi sebentar.");
  }
  if (!response.ok) {
    throw new Error(`Jikan error: ${response.status}`);
  }

  const json = await response.json();
  memoryCache.set(path, { data: json, time: Date.now() });
  return json;
}

// Mengubah format Jikan menjadi format NEKONIME (sama dengan src/data/anime.js)
export function normalizeAnime(item) {
  const genres = (item.genres || []).map((g) => g.name);
  return {
    id: item.mal_id,
    title: item.title_english || item.title,
    category: "anime",
    categoryLabel: (item.type || "ANIME").toUpperCase(),
    rating: item.score ? item.score.toFixed(1) : "-",
    year: item.year ? String(item.year) : "-",
    genre: genres.length ? genres.join(" · ") : "-",
    synopsis: item.synopsis || "Sinopsis belum tersedia.",
    totalEpisodes: item.episodes || 12,
    poster: item.images?.webp?.large_image_url || item.images?.jpg?.image_url || "",
    status: item.status || ""
  };
}

export async function searchAnime(query, signal) {
  const json = await fetchJikan(
    `/search?q=${encodeURIComponent(query)}`,
    signal
  );
  return json.data.map(normalizeAnime);
}

export async function getTopAnime(signal) {
  const json = await fetchJikan("/top", signal);
  return json.data.map(normalizeAnime);
}
