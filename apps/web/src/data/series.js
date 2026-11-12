// Daftar series yang punya beberapa season (tiap season = satu entri AniList).
// Menambah series baru: tambahkan satu objek di bawah dengan ID AniList tiap season.
export const series = [
  {
    title: "My Hero Academia",
    seasons: [
      { label: "Season 1", id: 21459 },
      { label: "Season 2", id: 21856 },
      { label: "Season 3", id: 100166 },
      { label: "Season 4", id: 104276 },
      { label: "Season 5", id: 117193 },
      { label: "Season 6", id: 139630 },
      { label: "Season 7", id: 163139 },
      { label: "Final Season", id: 182896 }
    ]
  }
];

// Mengembalikan series yang memuat anime ini, atau null.
export const getSeries = (animeId) =>
  series.find((s) => s.seasons.some((x) => x.id === animeId)) || null;
