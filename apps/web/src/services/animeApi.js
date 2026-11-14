// Layanan untuk mengambil data anime dari backend NEKONIME (apps/api).
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function getData(path, signal) {
  const response = await fetch(`${BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }
  const json = await response.json();
  return json.data;
}

// category: "anime", "donghua", atau kosong untuk semua
const withCategory = (path, category) =>
  category ? `${path}${path.includes("?") ? "&" : "?"}category=${category}` : path;

export const searchAnime = (query, category, signal) =>
  getData(withCategory(`/search?q=${encodeURIComponent(query)}`, category), signal);

export const getTopAnime = (category, signal) =>
  getData(withCategory("/top", category), signal);

export const getAnimeByIds = (ids, signal) =>
  getData(`/anime?ids=${ids.join(",")}`, signal);
