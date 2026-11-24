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

// Helper: parse judul video AniOneAsia untuk ekstrak nama anime + episode
// Contoh: "Spy x Family Episode 5 Sub Indo" -> { title: "Spy x Family", episode: 5 }
export function parseAnioneasiaTitle(rawTitle) {
  if (!rawTitle) return { title: rawTitle, episode: null };

  // Pattern umum: "Anime Title Episode XX" atau "Anime Title - Episode XX" atau "Anime Title Ep XX"
  const patterns = [
    /^(.+?)\s+(?:episode|ep\.?|eps\.?)\s*(\d+)/i,
    /^(.+?)\s*[-–—]\s*episode\s*(\d+)/i,
    /^(.+?)\s+(\d+)\s*(?:sub|dub|indo|english)/i,
    /^(.+?)\s+(\d+)$/, // "Title 5"
  ];

  for (const pattern of patterns) {
    const match = rawTitle.match(pattern);
    if (match) {
      return {
        title: match[1].trim(),
        episode: Number.parseInt(match[2], 10),
      };
    }
  }

  // Fallback: cari angka di akhir
  const trailingNum = rawTitle.match(/(\d+)\s*$/);
  if (trailingNum) {
    const num = Number.parseInt(trailingNum[1], 10);
    if (num > 0 && num < 1000) {
      return {
        title: rawTitle.slice(0, trailingNum.index).trim(),
        episode: num,
      };
    }
  }

  return { title: rawTitle, episode: null };
}