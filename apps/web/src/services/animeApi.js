// Layanan untuk mengambil data anime dari backend NEKONIME (apps/api).
const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3002/api";

async function getData(path, signal) {
  const response = await fetch(`${BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }
  const json = await response.json();
  return json.data;
}

// Menambahkan ?category=...&page=...&genre=...&year=...&status=...&sort=... hanya jika perlu
const withParams = (path, category, page, filters) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  if (filters) {
    if (filters.genre) params.set("genre", filters.genre);
    if (filters.year) params.set("year", String(filters.year));
    if (filters.status) params.set("status", filters.status);
    if (filters.sort) params.set("sort", filters.sort);
  }
  const qs = params.toString();
  return qs ? `${path}${path.includes("?") ? "&" : "?"}${qs}` : path;
};

export const searchAnime = (query, category, page, filters, signal) =>
  getData(withParams(`/search?q=${encodeURIComponent(query)}`, category, page, filters), signal);

export const getTopAnime = (category, page, filters, signal) =>
  getData(withParams("/top", category, page, filters), signal);

export const getAnimeByIds = (ids, signal) =>
  getData(`/anime?ids=${ids.join(",")}`, signal);

// Wajik Anime API (via backend NEKONIME). Tidak langsung ke Wajik.

export async function searchWajikCatalog(source, query, page, signal) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  params.set("q", query);
  const response = await fetch(
    `${BASE_URL}/wajik/${source}/search?${params.toString()}`,
    { signal }
  );
  if (!response.ok) throw new Error(`Backend error: ${response.status}`);
  const json = await response.json();
  return json.data;
}



// Sumber video dari provider legal. 404 berarti belum ada sumber, bukan error.
export async function getEpisodeStreams(animeId, episode, { title, signal } = {}) {
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  const qs = params.toString();
  const response = await fetch(
    `${BASE_URL}/episodes/${animeId}/${episode}/streams${qs ? `?${qs}` : ""}`,
    { signal }
  );
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`Backend error: ${response.status}`);
  const json = await response.json();
  return json.data?.sources || [];
}

// Mengembalikan { items, matched }: matched = kata yang akhirnya cocok (bisa lebih pendek dari ketikan)
export async function getSuggestions(query, signal) {
  const response = await fetch(`${BASE_URL}/suggest?q=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) throw new Error(`Backend error: ${response.status}`);
  const json = await response.json();
  return { items: json.data || [], matched: json.matched || query };
}
