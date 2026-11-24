// Utilitas untuk mencocokkan video AniOneAsia ke anime di katalog NEKONIME.
// Digunakan untuk menampilkan "Tersedia di AniOneAsia" di halaman detail anime.

import { animeList } from "../data/anime.js";
import { fetchAnioneasiaVideos, parseAnioneasiaTitle } from "../services/anioneasiaApi.js";

const animeIndex = new Map();
animeList.forEach((anime) => {
  const key = normalizeTitle(anime.title);
  if (!animeIndex.has(key)) animeIndex.set(key, []);
  animeIndex.get(key).push(anime);
});

// Normalisasi judul untuk pencocokan fuzzy
function normalizeTitle(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Fungsi similarity sederhana (Jaccard pada kata)
function similarity(a, b) {
  const wordsA = new Set(a.split(" ").filter(Boolean));
  const wordsB = new Set(b.split(" ").filter(Boolean));
  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}

// Cari anime di katalog yang cocok dengan judul video AniOneAsia
export function findAnimeMatch(videoTitle) {
  const { title: parsedTitle } = parseAnioneasiaTitle(videoTitle);
  const normVideo = normalizeTitle(parsedTitle);

  let bestMatch = null;
  let bestScore = 0;

  for (const [normCatalog, animes] of animeIndex.entries()) {
    const score = similarity(normVideo, normCatalog);
    if (score > bestScore && score > 0.5) {
      bestScore = score;
      bestMatch = animes[0]; // ambil yang pertama
    }
  }

  return bestMatch ? { anime: bestMatch, score: bestScore } : null;
}

// Ambil episode AniOneAsia untuk anime tertentu
export async function getAnioneasiaEpisodesForAnime(animeId, animeTitle) {
  // Cari video dengan query judul anime
  const { data } = await fetchAnioneasiaVideos({ q: animeTitle, limit: 100 });

  // Filter dan parse episode
  const episodes = data
    .map((v) => {
      const { title: parsedTitle, episode } = parseAnioneasiaTitle(v.title);
      return { ...v, parsedTitle, parsedEpisode: episode };
    })
    .filter((v) => v.parsedEpisode && v.parsedEpisode > 0 && v.parsedEpisode <= 100)
    .sort((a, b) => (a.parsedEpisode || 0) - (b.parsedEpisode || 0));

  return episodes;
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