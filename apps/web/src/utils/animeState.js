import { getAnimeById } from "../data/anime.js";

export const isAnimeObject = (value) =>
  Boolean(value) && typeof value === "object" && value.id != null;

// Entri riwayat lama hanya menyimpan judul/poster. Bentuk objek minimal agar
// halaman detail tetap bisa dibuka tanpa mengarang data yang tidak ada.
export const animeFromHistory = (entry) => {
  if (!entry || typeof entry !== "object" || entry.animeId == null) return null;
  if (isAnimeObject(entry.anime)) return entry.anime;
  return {
    id: entry.animeId,
    title: entry.title || "Anime tanpa judul",
    poster: entry.poster || "",
    category: "anime",
    categoryLabel: "ANIME",
    rating: "-",
    year: "-",
    genre: "-",
    synopsis: "",
    totalEpisodes: null,
    status: ""
  };
};

// Mencari anime dari semua sumber yang dikenal aplikasi. Favorit dan riwayat
// ikut dicari agar memilih item di luar halaman katalog tidak menghasilkan
// halaman kosong.
export const findAnimeIn = (
  id,
  {
    items = [],
    seasonAnime = [],
    pinnedAnime = [],
    favorites = [],
    watchHistory = []
  } = {}
) =>
  items.find((anime) => anime.id === id) ||
  seasonAnime.find((anime) => anime.id === id) ||
  pinnedAnime.find((anime) => anime.id === id) ||
  favorites.find((anime) => anime.id === id) ||
  animeFromHistory(watchHistory.find((entry) => entry.animeId === id)) ||
  getAnimeById(id);

// Mengubah data favorit lama (angka ID) menjadi objek ringkas.
export const normalizeFavorites = (saved) => {
  if (!Array.isArray(saved)) return [];
  return saved
    .map((entry) => {
      if (isAnimeObject(entry)) return entry;
      const anime = getAnimeById(entry);
      return anime ? { ...anime } : null;
    })
    .filter(Boolean);
};

// Riwayat yang rusak tidak boleh membuat aplikasi gagal dimuat.
export const normalizeHistory = (saved) => {
  if (!Array.isArray(saved)) return [];
  return saved
    .filter((entry) => entry && typeof entry === "object" && entry.animeId != null)
    .map((entry) => ({
      ...entry,
      episode: Number.isInteger(entry.episode) && entry.episode > 0 ? entry.episode : 1,
      position: Number.isFinite(entry.position) ? entry.position : 0,
      duration: Number.isFinite(entry.duration) ? entry.duration : 0
    }))
    .slice(0, 20);
};

// Episode selalu berada di rentang 1..totalEpisodes bila jumlahnya diketahui.
export const clampEpisode = (episode, totalEpisodes) => {
  const value = Number.isInteger(episode) && episode > 0 ? episode : 1;
  return Number.isInteger(totalEpisodes) && totalEpisodes > 0
    ? Math.min(value, totalEpisodes)
    : value;
};
