// Utilitas untuk mencocokkan video Muse Indonesia ke anime di katalog NEKONIME.
// Digunakan untuk menampilkan "Tersedia di Muse Indonesia" di halaman detail anime.

import { fetchMuseindoEpisodes, fetchMuseindoVideos } from "../services/museindoApi.js";

// Ambil episode Muse Indonesia untuk anime tertentu (menggunakan backend yang sudah filter pakai exact matching)
export async function getMuseindoEpisodesForAnime(animeId, animeTitle) {
  try {
    const { episodes } = await fetchMuseindoEpisodes(animeId, animeTitle);
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

// Cek apakah anime punya video di Muse Indonesia
export async function checkMuseindoAvailability(animeTitle) {
  try {
    const { data, pagination } = await fetchMuseindoVideos({ q: animeTitle, limit: 5 });
    return pagination.total > 0;
  } catch {
    return false;
  }
}