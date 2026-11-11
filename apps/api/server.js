import express from "express";
import cors from "cors";

const PORT = process.env.PORT || 3001;
const ANILIST_URL = "https://graphql.anilist.co";
const CACHE_TTL_MS = 10 * 60 * 1000; // cache 10 menit
const TIMEOUT_MS = 8000;

const cache = new Map();

// Label tampilan untuk format AniList. Format lain tampil apa adanya.
const FORMAT_LABELS = { TV: "ANIME", TV_SHORT: "ANIME", MOVIE: "FILM" };

const MEDIA_FIELDS = `
  id
  title { romaji english }
  format
  status
  episodes
  seasonYear
  averageScore
  genres
  description(asHtml: false)
  countryOfOrigin
  coverImage { extraLarge large }
`;

// Mengubah format AniList menjadi format NEKONIME (sama dengan src/data/anime.js)
function normalize(item) {
  const isDonghua = item.countryOfOrigin === "CN";
  return {
    id: item.id,
    title: item.title.english || item.title.romaji,
    category: isDonghua ? "donghua" : "anime",
    categoryLabel: isDonghua ? "DONGHUA" : (FORMAT_LABELS[item.format] || (item.format || "ANIME").replace("_", " ")),
    rating: item.averageScore ? (item.averageScore / 10).toFixed(1) : "-",
    year: item.seasonYear ? String(item.seasonYear) : "-",
    genre: item.genres?.length ? item.genres.join(" · ") : "-",
    synopsis:
      (item.description || "").replace(/<[^>]*>/g, "").trim() ||
      "Sinopsis belum tersedia.",
    totalEpisodes: item.episodes || 12,
    poster: item.coverImage?.extraLarge || item.coverImage?.large || "",
    status: item.status || ""
  };
}

// Panggil AniList, normalisasi, simpan di cache. Kegagalan tidak di-cache.
async function fromAniList(cacheKey, query, variables) {
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.time < CACHE_TTL_MS) return hit.data;

  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`AniList membalas status ${res.status}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "Error dari AniList");

  const data = json.data.Page.media.map(normalize);
  cache.set(cacheKey, { data, time: Date.now() });
  return data;
}

const TOP_QUERY = `query {
  Page(perPage: 12) {
    media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FIELDS} }
  }
}`;

const SEARCH_QUERY = `query ($q: String) {
  Page(perPage: 12) {
    media(type: ANIME, search: $q, sort: SEARCH_MATCH, isAdult: false) { ${MEDIA_FIELDS} }
  }
}`;

const app = express();
// Hanya izinkan aplikasi web di localhost (ubah saat deploy).
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/] }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, cached: cache.size });
});

app.get("/api/top", async (req, res) => {
  try {
    res.json({ data: await fromAniList("top", TOP_QUERY, {}) });
  } catch (err) {
    res.status(502).json({ error: "Gagal menghubungi AniList", detail: err.message });
  }
});

app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 100);
  if (!q) return res.status(400).json({ error: "Parameter q wajib diisi" });
  try {
    res.json({ data: await fromAniList(`search:${q.toLowerCase()}`, SEARCH_QUERY, { q }) });
  } catch (err) {
    res.status(502).json({ error: "Gagal menghubungi AniList", detail: err.message });
  }
});

app.listen(PORT, () => console.log(`NEKONIME API di http://localhost:${PORT}`));
