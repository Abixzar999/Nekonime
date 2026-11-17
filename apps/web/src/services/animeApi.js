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

// Menambahkan ?category=...&page=... hanya jika perlu
const withParams = (path, category, page) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${path}${path.includes("?") ? "&" : "?"}${qs}` : path;
};

export const searchAnime = (query, category, page, signal) =>
  getData(withParams(`/search?q=${encodeURIComponent(query)}`, category, page), signal);

export const getTopAnime = (category, page, signal) =>
  getData(withParams("/top", category, page), signal);

export const getAnimeByIds = (ids, signal) =>
  getData(`/anime?ids=${ids.join(",")}`, signal);

// Mengembalikan { items, matched }: matched = kata yang akhirnya cocok (bisa lebih pendek dari ketikan)
export async function getSuggestions(query, signal) {
  const response = await fetch(`${BASE_URL}/suggest?q=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) throw new Error(`Backend error: ${response.status}`);
  const json = await response.json();
  return { items: json.data || [], matched: json.matched || query };
}
