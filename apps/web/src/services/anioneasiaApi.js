// Layanan untuk mengambil data AniOneAsia dari backend NEKONIME (apps/api).
const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3002/api";

async function getData(path, signal) {
  const response = await fetch(`${BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }
  const json = await response.json();
  return json.data;
}

export const fetchAnioneasiaVideos = (params = {}, signal) => {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.set("dateTo", params.dateTo);
  if (params.minViews) searchParams.set("minViews", String(params.minViews));
  const qs = searchParams.toString();
  return getData(`/anioneasia/videos${qs ? `?${qs}` : ""}`, signal);
};

export const fetchAnioneasiaVideo = (videoId, signal) =>
  getData(`/anioneasia/videos/${videoId}`, signal);

export const fetchAnioneasiaStats = (signal) =>
  getData("/anioneasia/stats", signal);

// Fetch episodes from backend (uses AniOneAsia streaming provider with proper title matching)
export const fetchAnioneasiaEpisodes = (animeId, title, signal) =>
  getData(`/episodes/${animeId}?title=${encodeURIComponent(title)}`, signal);

// Helper: parse judul video AniOneAsia untuk ekstrak nama anime + episode
// Format AniOneAsia: "《Series Title》#47 (ENG sub | JP dub) 【Ani-One Asia】"
// Juga handle format generik: "Spy x Family Episode 5 Sub Indo" -> { title: "Spy x Family", episode: 5 }
export function parseAnioneasiaTitle(rawTitle) {
  if (!rawTitle) return { title: rawTitle, episode: null };

  // 1. Ekstrak series title dari bracket 《》 (format AniOneAsia)
  const bracketMatch = rawTitle.match(/《([^》]+)》/);
  let seriesTitle = bracketMatch ? bracketMatch[1].trim() : null;

  // 2. Pattern episode untuk format AniOneAsia: #47, #＃47, dll
  const anioneasiaPatterns = [
    /[#＃]\s*(\d+)/,                    // 《Title》#47 or #＃47
    /(?:episode|ep\.?|eps\.?)\s*(\d+)/i,
    /[-–—]\s*episode\s*(\d+)/i,
    /\s+(\d+)\s*(?:sub|dub|indo|english)/i,
    /\s+(\d+)$/,
  ];

  for (const pattern of anioneasiaPatterns) {
    const match = rawTitle.match(pattern);
    if (match) {
      const num = Number.parseInt(match[1], 10);
      if (num > 0 && num < 1000) {
        return {
          title: seriesTitle || rawTitle,
          episode: num,
        };
      }
    }
  }

  // 3. Fallback generik untuk format lain
  const genericPatterns = [
    /^(.+?)\s+(?:episode|ep\.?|eps\.?)\s*(\d+)/i,
    /^(.+?)\s*[-–—]\s*episode\s*(\d+)/i,
    /^(.+?)\s+(\d+)\s*(?:sub|dub|indo|english)/i,
    /^(.+?)\s+(\d+)$/, // "Title 5"
  ];

  for (const pattern of genericPatterns) {
    const match = rawTitle.match(pattern);
    if (match) {
      return {
        title: match[1].trim(),
        episode: Number.parseInt(match[2], 10),
      };
    }
  }

  // 4. Fallback: cari angka di akhir
  const trailingNum = rawTitle.match(/(\d+)\s*$/);
  if (trailingNum) {
    const num = Number.parseInt(trailingNum[1], 10);
    if (num > 0 && num < 1000) {
      return {
        title: seriesTitle || rawTitle.slice(0, trailingNum.index).trim(),
        episode: num,
      };
    }
  }

  return { title: seriesTitle || rawTitle, episode: null };
}