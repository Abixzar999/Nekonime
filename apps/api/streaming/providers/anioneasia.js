import { listAnioneasiaVideos } from "../../anioneasia.js";

function extractEpisodeFromTitle(title) {
  if (!title) return null;
  const patterns = [
    /[#＃]\s*(\d+)/,                    // 《Title》#47 or #＃47
    /(?:episode|ep\.?|eps\.?)\s*(\d+)/i,
    /[-–—]\s*episode\s*(\d+)/i,
    /\s+(\d+)\s*(?:sub|dub|indo|english)/i,
    /\s+(\d+)$/,
  ];
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const num = Number.parseInt(match[1], 10);
      if (num > 0 && num < 1000) return num;
    }
  }
  return null;
}

// Extract the series title from AniOneAsia video titles (text inside 《》 brackets)
function extractSeriesTitle(videoTitle) {
  if (!videoTitle) return "";
  const match = videoTitle.match(/《([^》]+)》/);
  return match ? match[1].trim() : "";
}

// Normalize a title for comparison
function normalizeForCompare(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

// Check if video title matches the anime title precisely
// Uses the series title from 《》 brackets for exact matching
// Videos without 《》 brackets are highlights/trailers/OPs and are excluded
function titleContainsAnime(videoTitle, animeTitle) {
  if (!videoTitle || !animeTitle) return false;
  
  // Filter out non-episode content (case-insensitive)
  const lowerTitle = videoTitle.toLowerCase();
  const excludedKeywords = [
    "recap", "pv", "preview", "opening", "ending", " op ", " ed ", 
    "highlight", "trailer", "teaser", "promo", " cm ", "shout out",
    "best scene", "behind the scene", "making of", "interview"
  ];
  if (excludedKeywords.some(kw => lowerTitle.includes(kw))) {
    return false;
  }
  
  // Extract the series title from video (inside 《》)
  const seriesTitle = extractSeriesTitle(videoTitle);
  const normAnime = normalizeForCompare(animeTitle);
  
  // Require 《》 brackets - videos without them are not episode videos
  if (!seriesTitle) {
    return false;
  }
  
  const normSeries = normalizeForCompare(seriesTitle);
  
  // Must be exact match OR series starts with anime title followed by valid suffixes
  // Valid suffixes: "(season X)", "season X", "(final season)"
  // Invalid suffixes: ": " (spin-off indicator)
  if (normSeries === normAnime) return true;
  
  // Check for season suffix like "(season 7)" or "(season 6)"
  const seasonPrefix = normAnime + " (season";
  if (normSeries.startsWith(seasonPrefix)) return true;
  
  // Also check for "season X" without parentheses
  const seasonPrefix2 = normAnime + " season";
  if (normSeries.startsWith(seasonPrefix2)) return true;
  
  // Check for "(final season)" suffix
  const finalSeasonPrefix = normAnime + " (final season";
  if (normSeries.startsWith(finalSeasonPrefix)) return true;
  
  // Check for "final season" without parentheses
  const finalSeasonPrefix2 = normAnime + " final season";
  if (normSeries.startsWith(finalSeasonPrefix2)) return true;
  
  return false;
}

const anioneasia = {
  id: "anioneasia",
  label: "AniOne Asia",
  license: {
    verified: true,
    note: "Embed dari kanal resmi YouTube AniOne Asia (metadata dari channel publik)",
  },
  enabled: true,

  async getStreams({ animeId, episode, title }) {
    if (!title || !episode) return [];

    // Search AniOneAsia for this anime title
    const { data: videos } = listAnioneasiaVideos({
      q: title,
      limit: 100,
    });

    if (!videos.length) return [];

    // Find videos matching this exact episode number AND containing the anime title
    const matches = videos
      .map((v) => ({
        ...v,
        episode: extractEpisodeFromTitle(v.title),
      }))
      .filter((v) => v.episode === episode && titleContainsAnime(v.title, title));

    if (!matches.length) return [];

    // Prefer "ULTRA" (newer/higher quality) but any match works
    const best = matches.find(v => v.title.includes("ULTRA")) || matches[0];
    return [
      {
        id: `anioneasia:${best.videoId}`,
        provider: "anioneasia",
        type: "youtube",
        youtubeId: best.videoId,
        url: null,
        title: `Episode ${episode}`,
        credit: "Ani-One Asia (kanal resmi YouTube)",
        license: { verified: true },
      },
    ];
  },

  // List all episodes available for an anime on AniOneAsia
  async listEpisodes({ animeId, title }) {
    if (!title) return [];

    const { data: videos } = listAnioneasiaVideos({
      q: title,
      limit: 200,
    });

    if (!videos.length) return [];

    // Extract episodes and deduplicate
    const episodeMap = new Map();
    for (const v of videos) {
      const ep = extractEpisodeFromTitle(v.title);
      if (ep && ep > 0 && ep <= 500 && titleContainsAnime(v.title, title)) {
        if (!episodeMap.has(ep)) {
          episodeMap.set(ep, {
            episode: ep,
            videoId: v.videoId,
            title: v.title,
            uploadDate: v.uploadDate,
          });
        }
      }
    }

    return [...episodeMap.values()].sort((a, b) => a.episode - b.episode);
  },
};

export default anioneasia;