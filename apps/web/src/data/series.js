// Daftar series yang punya beberapa season (tiap season = satu entri AniList).
// Menambah series baru: tambahkan satu objek di bawah dengan ID AniList tiap season.
export const series = [
  {
    title: "My Hero Academia",
    seasons: [
      { label: "Season 1", id: 21459 },
      { label: "Season 2", id: 21856 }
    ]
  }
];

// Mengembalikan series yang memuat anime ini, atau null.
export const getSeries = (animeId) =>
  series.find((s) => s.seasons.some((x) => x.id === animeId)) || null;
