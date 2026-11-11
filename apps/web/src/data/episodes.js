// Sumber video per episode, terpisah dari metadata anime.
// Kunci: "<id anime>:<nomor episode>". Isi hanya dengan video yang SAH:
//   { type: "file", url: "/videos/contoh.mp4", credit: "..." }   -> video milik sendiri / lisensi terbuka
//   { type: "youtube", id: "ID_VIDEO", credit: "Kanal resmi ..." } -> embed dari kanal resmi yang mengizinkan
export const videoSources = {};

// Mengembalikan sumber video, atau null jika belum ada.
export const getVideoSource = (animeId, episode) =>
  videoSources[`${animeId}:${episode}`] || null;
