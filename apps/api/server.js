import express from "express";
import cors from "cors";
import { getStreams, listEpisodes } from "./streaming/index.js";
import { listProviders } from "./streaming/registry.js";
import { listAnioneasiaVideos, getAnioneasiaVideo, getAnioneasiaStats } from "./anioneasia.js";

const PORT = process.env.PORT || 3002;
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
  bannerImage
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
    // Jangan mengarang jumlah episode. null berarti belum diketahui.
    totalEpisodes:
      Number.isInteger(item.episodes) && item.episodes > 0 ? item.episodes : null,
    poster: item.coverImage?.extraLarge || item.coverImage?.large || "",
    // Banner landscape opsional untuk hero beranda (field tambahan, tidak mengubah kontrak lama).
    bannerImage: item.bannerImage || "",
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

// Bangun argumen media AniList berdasarkan filter yang diberikan pengguna.
function buildMediaArgs(category, filters, isSearch) {
  const args = ["type: ANIME"];
  if (category === "anime") args.push("countryOfOrigin: JP");
  if (category === "donghua") args.push("countryOfOrigin: CN");
  args.push("isAdult: false");
  if (filters.genre) args.push(`genre_in: ["${String(filters.genre).replace(/"/g, "")}"]`);
  if (filters.year) {
    const y = Number.parseInt(filters.year, 10);
    if (Number.isInteger(y)) args.push(`seasonYear: ${y}`);
  }
  if (filters.status) args.push(`status: ${String(filters.status).toUpperCase()}`);
  const sort = filters.sort === "latest" ? "START_DATE_DESC" : isSearch ? "SEARCH_MATCH" : "POPULARITY_DESC";
  args.push(`sort: ${sort}`);
  if (isSearch) args.push("search: $q");
  return args.join(", ");
}

function buildTopQuery(category, filters) {
  return `query ($page: Int) {
    Page(page: $page, perPage: 12) {
      media(${buildMediaArgs(category, filters, false)}) { ${MEDIA_FIELDS} }
    }
  }`;
}

function buildSearchQuery(category, filters) {
  return `query ($q: String, $page: Int) {
    Page(page: $page, perPage: 12) {
      media(${buildMediaArgs(category, filters, true)}) { ${MEDIA_FIELDS} }
    }
  }`;
}

// Kategori tab -> negara asal di AniList
const COUNTRY = { anime: "JP", donghua: "CN" };
const categoryOf = (req) => {
  const c = String(req.query.category || "");
  return Object.hasOwn(COUNTRY, c) ? c : "";
};
const pageOf = (req) => Math.min(50, Math.max(1, Number.parseInt(req.query.page, 10) || 1));
const withCountry = (query, category) =>
  category
    ? query.replace("isAdult: false", `isAdult: false, countryOfOrigin: ${COUNTRY[category]}`)
    : query;

const app = express();
// Hanya izinkan aplikasi web di localhost (ubah saat deploy).
app.use(cors({ origin: [/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/] }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, cached: cache.size });
});

// Baca parameter filter dari query string (genre, year, status, sort).
function filtersOf(req) {
  return {
    genre: String(req.query.genre || "").trim(),
    year: String(req.query.year || "").trim(),
    status: String(req.query.status || "").trim(),
    sort: String(req.query.sort || "").trim(),
  };
}

function filterKey(filters) {
  return `${filters.genre || "-"}:${filters.year || "-"}:${filters.status || "-"}:${filters.sort || "-"}`;
}

app.get("/api/top", async (req, res) => {
  try {
    const cat = categoryOf(req);
    const filters = filtersOf(req);
    const query = buildTopQuery(cat, filters);
    const cacheKey = `top:${cat}:${pageOf(req)}:${filterKey(filters)}`;
    res.json({ data: await fromAniList(cacheKey, query, { page: pageOf(req) }) });
  } catch (err) {
    res.status(502).json({ error: "Gagal menghubungi AniList", detail: err.message });
  }
});

app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 100);
  if (!q) return res.status(400).json({ error: "Parameter q wajib diisi" });
  try {
    const cat = categoryOf(req);
    const filters = filtersOf(req);
    const query = buildSearchQuery(cat, filters);
    const cacheKey = `search:${cat}:${pageOf(req)}:${q.toLowerCase()}:${filterKey(filters)}`;
    res.json({ data: await fromAniList(cacheKey, query, { q, page: pageOf(req) }) });
  } catch (err) {
    res.status(502).json({ error: "Gagal menghubungi AniList", detail: err.message });
  }
});

const IDS_QUERY = `query ($ids: [Int]) {
  Page(perPage: 25) {
    media(id_in: $ids, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} }
  }
}`;

// Ambil beberapa anime sekaligus berdasarkan ID AniList (dipakai untuk pilihan season)
app.get("/api/anime", async (req, res) => {
  const ids = String(req.query.ids || "")
    .split(",")
    .map((s) => Number.parseInt(s, 10))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 10);
  if (!ids.length) return res.status(400).json({ error: "Parameter ids wajib diisi" });
  try {
    res.json({ data: await fromAniList(`ids:${ids.join(",")}`, IDS_QUERY, { ids }) });
  } catch (err) {
    res.status(502).json({ error: "Gagal menghubungi AniList", detail: err.message });
  }
});

const SUGGEST_QUERY = `query ($q: String) {
  Page(page: 1, perPage: 16) {
    media(type: ANIME, search: $q, sort: POPULARITY_DESC, isAdult: false) { ${MEDIA_FIELDS} }
  }
}`;

// Cadangan saat tidak ada hasil: potong 2 huruf terakhir, lalu buang kata terakhir.
function suggestFallbacks(q) {
  const words = q.split(/\s+/).filter(Boolean);
  const last = words[words.length - 1] || "";
  const out = [];
  if (last.length >= 6) out.push([...words.slice(0, -1), last.slice(0, -2)].join(" "));
  if (words.length > 1) out.push(words.slice(0, -1).join(" "));
  return out.filter((x) => x.length >= 3).slice(0, 2);
}

// Lipat musim dari seri yang sama (Season 2, Part 2, dst.) supaya tidak memakai banyak slot.
const SEASON_MARK = /(season\s*\d+|\d+(st|nd|rd|th)\s+season|part\s*\d+|cour\s*\d+|final season)/i;
function collapseSeasons(list) {
  const titles = list.map((a) => a.title.toLowerCase());
  return list.filter((a, i) => {
    if (!SEASON_MARK.test(a.title)) return true;
    return !titles.some((t, j) => j !== i && t.length < titles[i].length && titles[i].startsWith(t));
  });
}

// Saran judul saat mengetik di kolom cari (anime dan donghua sekaligus)
app.get("/api/suggest", async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 60);
  if (q.length < 2) return res.json({ data: [], matched: q });
  try {
    const first = collapseSeasons(await fromAniList(`suggest:${q.toLowerCase()}`, SUGGEST_QUERY, { q }));
    if (first.length) return res.json({ data: first.slice(0, 8), matched: q });

    for (const cand of suggestFallbacks(q)) {
      try {
        const list = collapseSeasons(await fromAniList(`suggest:${cand.toLowerCase()}`, SUGGEST_QUERY, { q: cand }));
        if (list.length) return res.json({ data: list.slice(0, 8), matched: cand });
      } catch {
        break; // cadangan gagal (misalnya batas permintaan): tampilkan "tidak ada hasil"
      }
    }
    res.json({ data: [], matched: q });
  } catch (err) {
    res.status(502).json({ error: "Gagal menghubungi AniList", detail: err.message });
  }
});

// ============================================
// STREAMING (provider legal saja)
// ============================================

// Daftar provider yang aktif beserta status lisensinya.
app.get("/api/streams/providers", (req, res) => {
  res.json({ data: listProviders() });
});

const isNumericId = (value) => /^\d+$/.test(value);
const parseEpisode = (value) => {
  if (!/^\d+$/.test(value)) return null;
  const episode = Number(value);
  return Number.isSafeInteger(episode) && episode > 0 ? episode : null;
};

// Episode yang punya sumber dari provider aktif.
app.get("/api/episodes/:animeId", async (req, res) => {
  const { animeId } = req.params;
  if (!isNumericId(animeId)) {
    return res.status(400).json({ error: "ID anime tidak valid." });
  }

  const title = String(req.query.title || "").trim().slice(0, 200) || undefined;
  const episodes = await listEpisodes(animeId, title);
  res.json({ data: { animeId, total: episodes.length, episodes } });
});

// Sumber tunggal, kompatibel dengan pemanggilan lama.
app.get("/api/episodes/:animeId/:episode", async (req, res) => {
  const { animeId, episode: rawEpisode } = req.params;
  const episode = parseEpisode(rawEpisode);

  if (!isNumericId(animeId) || episode === null) {
    return res.status(400).json({ error: "ID anime atau nomor episode tidak valid." });
  }

  try {
    const title = String(req.query.title || "").trim().slice(0, 200) || undefined;
    const sources = await getStreams({ animeId, episode, title });
    if (sources.length === 0) {
      return res.status(404).json({ error: "Sumber video belum tersedia." });
    }
    res.json({ data: { animeId, episode, source: sources[0] } });
  } catch (err) {
    res.status(502).json({ error: "Gagal mengambil sumber video", detail: err.message });
  }
});

// Semua sumber dari provider aktif.
app.get("/api/episodes/:animeId/:episode/streams", async (req, res) => {
  const { animeId, episode: rawEpisode } = req.params;
  const episode = parseEpisode(rawEpisode);

  if (!isNumericId(animeId) || episode === null) {
    return res.status(400).json({ error: "ID anime atau nomor episode tidak valid." });
  }

  try {
    const title = String(req.query.title || "").trim().slice(0, 200) || undefined;
    const sources = await getStreams({ animeId, episode, title });
    if (sources.length === 0) {
      return res.status(404).json({ error: "Sumber video belum tersedia." });
    }
    res.json({ data: { animeId, episode, sources } });
  } catch (err) {
    res.status(502).json({ error: "Gagal mengambil sumber video", detail: err.message });
  }
});

// ============================================
// ANIONEASIA (Channel YouTube metadata)
// ============================================

// List video dengan filter: q, page, limit, dateFrom, dateTo, minViews
app.get("/api/anioneasia/videos", (req, res) => {
  try {
    const { q = "", page = 1, limit = 20, dateFrom, dateTo, minViews = 0 } = req.query;
    const result = listAnioneasiaVideos({
      q: String(q).trim(),
      page: Math.max(1, Number.parseInt(page, 10) || 1),
      limit: Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20)),
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      minViews: Math.max(0, Number.parseInt(minViews, 10) || 0),
    });
    if (result.error) return res.status(503).json({ error: result.error });
    res.json({ data: result.data, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data AniOneAsia", detail: err.message });
  }
});

// Detail satu video
app.get("/api/anioneasia/videos/:videoId", (req, res) => {
  try {
    const { videoId } = req.params;
    const result = getAnioneasiaVideo(videoId);
    if (result.error) return res.status(result.error === "Not found" ? 404 : 503).json({ error: result.error });
    res.json({ data: result.data });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil detail video", detail: err.message });
  }
});

// Statistik channel
app.get("/api/anioneasia/stats", (req, res) => {
  try {
    const result = getAnioneasiaStats();
    if (result.error) return res.status(503).json({ error: result.error });
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil statistik", detail: err.message });
  }
});

app.listen(PORT, () => console.log(`NEKONIME API di http://localhost:${PORT}`));
