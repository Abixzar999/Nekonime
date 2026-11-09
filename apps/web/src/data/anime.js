// Satu-satunya sumber data anime untuk sementara.
// Nanti file ini akan digantikan oleh data dari Jikan API.
export const animeList = [
  {
    id: 1,
    title: "Anime Pilihan",
    category: "anime",
    categoryLabel: "ANIME",
    rating: "9.2",
    year: "2026",
    genre: "Petualangan · Fantasi",
    synopsis: "Sebuah perjalanan penuh petualangan dan misteri di dunia fantasi.",
    totalEpisodes: 12,
    poster: "/images/anime/anime-1.jpeg"
  },
  {
    id: 2,
    title: "Donghua Pilihan",
    category: "donghua",
    categoryLabel: "DONGHUA",
    rating: "9.0",
    year: "2026",
    genre: "Action · Fantasi",
    synopsis: "Kisah petualangan di dunia penuh kekuatan dan pertarungan.",
    totalEpisodes: 24,
    poster: "/images/anime/anime-2.jpeg"
  },
  {
    id: 3,
    title: "Animasi Pilihan",
    category: "animasi",
    categoryLabel: "ANIMASI",
    rating: "8.8",
    year: "2026",
    genre: "Adventure · Comedy",
    synopsis: "Petualangan seru yang dipenuhi kejadian lucu dan menarik.",
    totalEpisodes: 10,
    poster: "/images/anime/anime-3.jpeg"
  }
];

// Mengambil satu anime berdasarkan id. Mengembalikan undefined jika tidak ada.
export const getAnimeById = (id) => animeList.find((anime) => anime.id === id);
