// Layanan untuk mengambil data Muse Indonesia dari backend NEKONIME (apps/api).
const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3002/api";

async function getData(path, signal) {
  const response = await fetch(`${BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }
  const json = await response.json();
  return json.data;
}

export const fetchMuseindoVideos = (params = {}, signal) => {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.set("dateTo", params.dateTo);
  if (params.minViews) searchParams.set("minViews", String(params.minViews));
  const qs = searchParams.toString();
  return getData(`/museindo/videos${qs ? `?${qs}` : ""}`, signal);
};

export const fetchMuseindoVideo = (videoId, signal) =>
  getData(`/museindo/videos/${videoId}`, signal);

export const fetchMuseindoStats = (signal) =>
  getData("/museindo/stats", signal);

// Fetch episodes from backend (uses Muse Indonesia streaming provider with proper title matching)
export const fetchMuseindoEpisodes = (animeId, title, signal) =>
  getData(`/episodes/${animeId}?title=${encodeURIComponent(title)}`, signal);

// Helper: parse judul video Muse Indonesia untuk ekstrak nama anime + episode
// Format Muse Indonesia: "Series Title - Episode XX [Bahasa Indonesia]" atau "Series Title Season 3 - Episode XX [Bahasa Indonesia]"
export function parseMuseindoTitle(rawTitle) {
  if (!rawTitle) return { title: rawTitle, episode: null };

  // Remove subtitle indicators first
  let cleanTitle = rawTitle
    .replace(/\[Bahasa Indonesia\]/gi, "")
    .replace(/\[Takarir Indonesia\]/gi, "")
    .replace(/\[Sub Indo\]/gi, "")
    .replace(/\[Bahasa Inggris\]/gi, "")
    .trim();

  // Pattern: "Title - Episode XX" or "Title Season 3 - Episode XX"
  const match = cleanTitle.match(/^(.+?)\s*[-–—]\s*[Ee]pisode\s*(\d+)/);
  if (match) {
    const num = Number.parseInt(match[2], 10);
    if (num > 0 && num < 1000) {
      return {
        title: match[1].trim(),
        episode: num,
      };
    }
  }

  // Pattern: "Title - Ep XX" or "Title Season 3 - Ep XX"
  const match2 = cleanTitle.match(/^(.+?)\s*[-–—]\s*[Ee]p\s*(\d+)/);
  if (match2) {
    const num = Number.parseInt(match2[2], 10);
    if (num > 0 && num < 1000) {
      return {
        title: match2[1].trim(),
        episode: num,
      };
    }
  }

  // Pattern: "Title #XX"
  const match3 = cleanTitle.match(/^(.+?)\s*[#＃]\s*(\d+)/);
  if (match3) {
    const num = Number.parseInt(match3[2], 10);
    if (num > 0 && num < 1000) {
      return {
        title: match3[1].trim(),
        episode: num,
      };
    }
  }

  // Fallback: cari angka di akhir
  const trailingNum = cleanTitle.match(/(\d+)\s*$/);
  if (trailingNum) {
    const num = Number.parseInt(trailingNum[1], 10);
    if (num > 0 && num < 1000) {
      return {
        title: cleanTitle.slice(0, trailingNum.index).trim(),
        episode: num,
      };
    }
  }

  return { title: cleanTitle, episode: null };
}