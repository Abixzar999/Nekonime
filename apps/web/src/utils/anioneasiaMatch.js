// Utilitas untuk mencocokkan video AniOneAsia ke anime di katalog NEKONIME.
// Digunakan untuk menampilkan "Tersedia di AniOneAsia" di halaman detail anime.

import { fetchAnioneasiaEpisodes, fetchAnioneasiaVideos } from "../services/anioneasiaApi.js";

// Ambil episode AniOneAsia untuk anime tertentu (menggunakan backend yang sudah filter pakai 《》 bracket matching)
export async function getAnioneasiaEpisodesForAnime(animeId, animeTitle) {
  try {
    const { episodes } = await fetchAnioneasiaEpisodes(animeId, animeTitle);
    return episodes.map((ep) => ({
      videoId: ep.videoId,
      title: ep.title,
      parsedTitle: ep.title,
      parsedEpisode: ep.episode,
      uploadDate: ep.uploadDate,
    }));
  } catch {
    return [];
  }
}

// Cek apakah anime punya video di AniOneAsia
export async function checkAnioneasiaAvailability(animeTitle) {
  try {
    const { data, pagination } = await fetchAnioneasiaVideos({ q: animeTitle, limit: 5 });
    return pagination.total > 0;
  } catch {
    return false;
  }
}