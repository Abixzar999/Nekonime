import { listMuseindoVideos } from "../../museindo.js";

function extractEpisodeFromTitle(title) {
  if (!title) return null;
  const patterns = [
    /[Ee]pisode\s*(\d+)/,               // Episode 02, episode 1
    /[#＃]\s*(\d+)/,                    // #47 or #＃47
    /(?:ep\.?|eps\.?)\s*(\d+)/i,       // ep 1, eps 2
    /[-–—]\s*episode\s*(\d+)/i,        // - Episode 1
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

// Extract the series title from Muse Indonesia video titles
// Pattern: "Series Title - Episode XX [Bahasa Indonesia]" or "Series Title Season 3 - Episode XX [Bahasa Indonesia]"
function extractSeriesTitle(videoTitle) {
  if (!videoTitle) return "";
  
  // Remove subtitle indicators first
  let cleanTitle = videoTitle
    .replace(/\[Bahasa Indonesia\]/gi, "")
    .replace(/\[Takarir Indonesia\]/gi, "")
    .replace(/\[Sub Indo\]/gi, "")
    .replace(/\[Bahasa Inggris\]/gi, "")
    .trim();
  
  // Pattern: "Title - Episode XX" or "Title Season 3 - Episode XX"
  const match = cleanTitle.match(/^(.+?)\s*[-–—]\s*[Ee]pisode\s*\d+/);
  if (match) {
    return match[1].trim();
  }
  
  // Pattern: "Title - Ep XX" or "Title Season 3 - Ep XX"
  const match2 = cleanTitle.match(/^(.+?)\s*[-–—]\s*[Ee]p\s*\d+/);
  if (match2) {
    return match2[1].trim();
  }
  
  // Pattern: "Title #XX" 
  const match3 = cleanTitle.match(/^(.+?)\s*[#＃]\s*\d+/);
  if (match3) {
    return match3[1].trim();
  }
  
  // Fallback: remove season suffixes and return what's left before common separators
  return cleanTitle
    .replace(/\s*[Ss]eason\s*\d+.*$/, "")
    .replace(/\s*[-–—].*$/, "")
    .trim();
}

// Normalize a title for comparison
function normalizeForCompare(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Check if video title matches the anime title precisely
// Muse Indonesia uses "Title - Episode XX [Bahasa Indonesia]" format
function titleContainsAnime(videoTitle, animeTitle) {
  if (!videoTitle || !animeTitle) return false;
  
  const lowerTitle = videoTitle.toLowerCase();
  
  // Filter out non-episode content (case-insensitive)
  const excludedKeywords = [
    "pv", "preview", "opening", "ending", " op ", " ed ", 
    "highlight", "trailer", "teaser", "promo", " cm ", "shout out",
    "best scene", "behind the scene", "making of", "interview",
    "highlights", "highlight", "rekap", "recap"
  ];
  if (excludedKeywords.some(kw => lowerTitle.includes(kw))) {
    return false;
  }
  
  // Must have subtitle indicator for Muse Indonesia (Bahasa Indonesia / Takarir Indonesia)
  const hasIndoSub = /\[(?:bahasa indonesia|takarir indonesia|sub indo)\]/i.test(videoTitle);
  if (!hasIndoSub) {
    return false;
  }
  
  // Extract the series title from video
  const seriesTitle = extractSeriesTitle(videoTitle);
  const normAnime = normalizeForCompare(animeTitle);
  const normSeries = normalizeForCompare(seriesTitle);
  
  if (!normSeries) return false;
  
  // Must be exact match OR series starts with anime title followed by valid suffixes
  // Valid suffixes: "season X", "(season X)", "sX", "final season", " (alt title)"
  // Invalid suffixes: ": " (spin-off indicator)
  if (normSeries === normAnime) return true;
  
  // Check for season suffix like "season 3" or "(season 3)"
  const seasonPrefix = normAnime + " season";
  if (normSeries.startsWith(seasonPrefix)) return true;
  
  // Check for "(season X)" suffix
  const seasonPrefixParen = normAnime + " (season";
  if (normSeries.startsWith(seasonPrefixParen)) return true;
  
  // Check for "s4", "s3", "s2" style season suffix (e.g., "Iruma-kun S4")
  const sSeasonPrefix = normAnime + " s";
  if (normSeries.startsWith(sSeasonPrefix) && /^\d+$/.test(normSeries.slice(sSeasonPrefix.length).split(" ")[0])) return true;
  
  // Check for alternative title in parentheses: "Title (Alt Title)" contains "Title"
  // Do this check on the original seriesTitle before parentheses are removed
  if (seriesTitle.startsWith(animeTitle + " (") && !seriesTitle.includes(": ")) return true;
  
  // Also check normalized version for cases where parens were already removed
  if (normSeries.startsWith(normAnime + " (") && !normSeries.includes(": ")) return true;
  
  // Check for "final season" suffix
  const finalSeasonPrefix = normAnime + " final season";
  if (normSeries.startsWith(finalSeasonPrefix)) return true;
  
  const finalSeasonPrefixParen = normAnime + " (final season";
  if (normSeries.startsWith(finalSeasonPrefixParen)) return true;
  
  return false;
}

const museindo = {
  id: "museindo",
  label: "Muse Indonesia",
  license: {
    verified: true,
    note: "Embed dari kanal resmi YouTube Muse Indonesia (metadata dari channel publik)",
  },
  enabled: true,

  async getStreams({ animeId, episode, title }) {
    if (!title || !episode) return [];

    // Search Muse Indonesia for this anime title
    const { data: videos } = listMuseindoVideos({
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

    // Prefer "Bahasa Indonesia" over "Takarir Indonesia" (newer/more standard)
    const best = matches.find(v => v.title.includes("Bahasa Indonesia")) || matches[0];
    return [
      {
        id: `museindo:${best.videoId}`,
        provider: "museindo",
        type: "youtube",
        youtubeId: best.videoId,
        url: null,
        title: `Episode ${episode}`,
        credit: "Muse Indonesia (kanal resmi YouTube)",
        license: { verified: true },
      },
    ];
  },

  // List all episodes available for an anime on Muse Indonesia
  async listEpisodes({ animeId, title }) {
    if (!title) return [];

    const { data: videos } = listMuseindoVideos({
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

export default museindo;