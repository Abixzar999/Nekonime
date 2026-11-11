// Sumber video per episode, terpisah dari metadata anime.
// Kunci: "<id anime>:<nomor episode>". Isi hanya dengan video yang SAH:
//   { type: "file", url: "/videos/contoh.mp4", credit: "..." }   -> video milik sendiri / lisensi terbuka
//   { type: "youtube", id: "ID_VIDEO", credit: "Kanal resmi ..." } -> embed dari kanal resmi yang mengizinkan
export const videoSources = {
  // My Hero Academia S1 (AniList 21459), kanal resmi Ani-One Indonesia
  "21459:1": { type: "youtube", id: "jE2oIRiFjkY", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:2": { type: "youtube", id: "Gj4O-1USJXs", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:3": { type: "youtube", id: "tbAEoF84pv0", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:4": { type: "youtube", id: "l6eVfplcDWg", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:5": { type: "youtube", id: "JxbJb_lrUUQ", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:6": { type: "youtube", id: "GO2goZdhPos", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:7": { type: "youtube", id: "o0JDCZA-ETc", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:8": { type: "youtube", id: "lOx4UKBpt_M", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:9": { type: "youtube", id: "F0vzvCSMl_E", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:10": { type: "youtube", id: "WrPpgh3S2is", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:11": { type: "youtube", id: "hjykLSHg0D0", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:12": { type: "youtube", id: "N3jKOTu_pGc", credit: "Ani-One Indonesia (kanal resmi)" },
  "21459:13": { type: "youtube", id: "Oty53UfzE38", credit: "Ani-One Indonesia (kanal resmi)" }
};

// Mengembalikan sumber video, atau null jika belum ada.
export const getVideoSource = (animeId, episode) =>
  videoSources[`${animeId}:${episode}`] || null;
