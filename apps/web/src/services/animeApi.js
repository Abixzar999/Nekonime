// Layanan untuk mengambil data anime dari backend NEKONIME (apps/api).
// Backend yang memanggil AniList dan mengubah datanya ke format NEKONIME.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function getData(path, signal) {
  const response = await fetch(`${BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }
  const json = await response.json();
  return json.data;
}

export const searchAnime = (query, signal) =>
  getData(`/search?q=${encodeURIComponent(query)}`, signal);

export const getTopAnime = (signal) => getData("/top", signal);

export const getAnimeByIds = (ids, signal) =>
  getData(`/anime?ids=${ids.join(",")}`, signal);
