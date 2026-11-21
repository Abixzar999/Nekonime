import { clientCache } from "@middlewares/cache.js";
import appConfig from "@configs/app.config.js";
import express from "express";
import errorHandler from "@middlewares/errorHandler.js";
import otakudesuRouter from "@routes/otakudesu.routes.js";
import samehadakuRouter from "@routes/samehadaku.routes.js";
import kuramanimeRouter from "@routes/kuramanime.routes.js";
import oploverzRouter from "@routes/oploverz.routes.js";
import setPayload from "@helpers/setPayload.js";
import { proxyRequest, batchFetchAnime } from "@helpers/proxyRequest.js";
import {
  transformOngoingToFrontend,
  transformCompletedToFrontend,
  transformSearchedToFrontend,
  transformAnimeDetailsToFrontend,
  transformPagination,
} from "@helpers/transform.js";
import cors from "cors";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load episodes data using CommonJS require (episodes.js uses ESM export but works with require)
const episodesModule = require(join(__dirname, "../../web/src/data/episodes.js"));
const { videoSources, getVideoSource } = episodesModule;

const { PORT } = appConfig;
const app = express();

app.use(cors());
app.use(clientCache(1));

// ============================================
// WAJIK ROUTES (mounted under /api prefix)
// ============================================
app.use("/api/otakudesu", otakudesuRouter);
app.use("/api/kuramanime", kuramanimeRouter);
app.use("/api/samehadaku", samehadakuRouter);
app.use("/api/oploverz", oploverzRouter);

// ============================================
// ADAPTER ROUTES (old API contract preserved)
// ============================================

// Root route listing
app.get("/", (req, res) => {
  const routes = [
    { method: "GET", path: "/api/top", description: "Top anime (ongoing/completed)", queryParams: ["category", "page"] },
    { method: "GET", path: "/api/search", description: "Search anime", queryParams: ["q", "category", "page"] },
    { method: "GET", path: "/api/anime", description: "Get anime by IDs", queryParams: ["ids"] },
    { method: "GET", path: "/api/suggest", description: "Search suggestions", queryParams: ["q"] },
    { method: "GET", path: "/api/episodes/:animeId", description: "List episodes with video sources" },
    { method: "GET", path: "/api/episodes/:animeId/:episode", description: "Get episode source" },
    { method: "GET", path: "/api/episodes/:animeId/:episode/streams", description: "Get episode streams (local + wajik)" },
    { method: "GET", path: "/api/otakudesu/*", description: "Otakudesu direct routes" },
    { method: "GET", path: "/api/kuramanime/*", description: "Kuramanime direct routes" },
    { method: "GET", path: "/api/samehadaku/*", description: "Samehadaku direct routes" },
    { method: "GET", path: "/api/oploverz/*", description: "Oploverz direct routes" },
  ];

  res.json(setPayload(res, { data: { routes } }));
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, source: "wajik-anime-api" });
});

// GET /api/top?category=anime|donghua&page=1
// Maps to: /api/otakudesu/ongoing (category=anime) or /api/otakudesu/completed (category=anime&page=999 for completed)
app.get("/api/top", async (req, res, next) => {
  try {
    const category = req.query.category === "donghua" ? "donghua" : "anime";
    const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10));

    if (category === "donghua") {
      // Otakudesu doesn't have donghua category, return empty
      return res.json(setPayload(res, { data: [], pagination: transformPagination({ currentPage: page, totalPages: 0 }) }));
    }

    // category=anime defaults to ongoing
    const targetPath = `/api/otakudesu/${page > 1 ? "ongoing" : "ongoing"}`;
    const queryParams = page > 1 ? `?page=${page}` : "";

    await proxyRequest(
      `${targetPath}${queryParams}`,
      req,
      res,
      next,
      (json) => {
        const animeList = json.data?.animeList || [];
        return setPayload(res, {
          data: animeList.map(transformOngoingToFrontend),
          pagination: transformPagination(json.pagination),
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/search?q=query&category=anime|donghua&page=1
app.get("/api/search", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) {
      return res.status(400).json(setPayload(res, { message: "Parameter q wajib diisi" }));
    }

    const category = req.query.category === "donghua" ? "donghua" : "anime";
    const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10));

    if (category === "donghua") {
      return res.json(setPayload(res, { data: [], pagination: transformPagination({ currentPage: page, totalPages: 0 }) }));
    }

    // Forward to otakudesu search
    await proxyRequest(
      `/api/otakudesu/search?q=${encodeURIComponent(q)}`,
      req,
      res,
      next,
      (json) => {
        const animeList = json.data?.animeList || [];
        return setPayload(res, {
          data: animeList.map(transformSearchedToFrontend),
          pagination: transformPagination(json.pagination),
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/anime?ids=1,2,3 (batch fetch by otakudesu animeId)
app.get("/api/anime", async (req, res, next) => {
  try {
    const idsParam = String(req.query.ids || "");
    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (!ids.length) {
      return res.status(400).json(setPayload(res, { message: "Parameter ids wajib diisi" }));
    }

    await batchFetchAnime(ids, req, res, next, "otakudesu");
  } catch (error) {
    next(error);
  }
});

// GET /api/suggest?q=query (search suggestions)
app.get("/api/suggest", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) {
      return res.json(setPayload(res, { data: [] }));
    }

    await proxyRequest(
      `/api/otakudesu/search?q=${encodeURIComponent(q)}`,
      req,
      res,
      next,
      (json) => {
        const animeList = json.data?.animeList || [];
        return setPayload(res, {
          data: animeList.slice(0, 8).map(transformSearchedToFrontend),
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

// ============================================
// EPISODE API (merge local + wajik streams)
// ============================================

// GET /api/episodes/:animeId - list episodes with available sources
app.get("/api/episodes/:animeId", (req, res) => {
  const { animeId } = req.params;

  if (!/^\d+$/.test(animeId)) {
    return res.status(400).json(setPayload(res, { message: "ID anime tidak valid." }));
  }

  const prefix = `${animeId}:`;
  const episodes = Object.keys(videoSources)
    .filter((key) => key.startsWith(prefix))
    .map((key) => Number(key.slice(prefix.length)))
    .filter((number) => Number.isSafeInteger(number) && number > 0)
    .sort((a, b) => a - b)
    .map((episode) => ({
      episode,
      available: true,
    }));

  return res.json(
    setPayload(res, {
      data: {
        animeId,
        total: episodes.length,
        episodes,
      },
    })
  );
});

// GET /api/episodes/:animeId/:episode - get episode source (local)
app.get("/api/episodes/:animeId/:episode", (req, res) => {
  const { animeId, episode } = req.params;
  const episodeNumber = Number(episode);

  if (
    !/^\d+$/.test(animeId) ||
    !/^\d+$/.test(episode) ||
    !Number.isSafeInteger(episodeNumber) ||
    episodeNumber < 1
  ) {
    return res.status(400).json(setPayload(res, { message: "ID anime atau nomor episode tidak valid." }));
  }

  const source = getVideoSource(animeId, episodeNumber);

  if (!source) {
    return res.status(404).json(setPayload(res, { message: "Sumber episode belum tersedia." }));
  }

  return res.json(
    setPayload(res, {
      data: {
        animeId,
        episode: episodeNumber,
        source,
      },
    })
  );
});

// GET /api/episodes/:animeId/:episode/streams - MERGE local + wajik server
app.get("/api/episodes/:animeId/:episode/streams", async (req, res, next) => {
  const { animeId, episode } = req.params;
  const episodeNumber = Number(episode);

  // Resolve slug animeId to otakudesu episodeId for stream fetching.
  // If numeric AniList ID, local video source lookup will handle it directly.
  let normalizedAnimeId = animeId;
  const isNumericId = /^\d+$/.test(animeId);
  let animeTitle: string | null = null;
  let otakudesuEpisodeId: string | null = null;

  if (!isNumericId) {
    // Anime ID is a slug (e.g., "uchi-otouto-sumimasen-sub-indo").
    // Fetch anime details once to get title + target episode's otakudesu episodeId.
    try {
      const animeRes = await fetch(`http://localhost:${PORT}/api/otakudesu/anime/${encodeURIComponent(animeId)}`);
      if (animeRes.ok) {
        const animeJson = (await animeRes.json()) as { data?: { details?: { title?: string; episodeList?: any[] } } };
        animeTitle = animeJson.data?.details?.title || null;
        const episodeList = animeJson.data?.details?.episodeList || [];
        const targetEpisode = episodeList.find((ep: any) => ep.title === String(episodeNumber));
        if (targetEpisode?.episodeId) {
          normalizedAnimeId = targetEpisode.episodeId; // e.g. "utgs-episode-10-sub-indo"
          otakudesuEpisodeId = targetEpisode.episodeId;
        } else {
          normalizedAnimeId = animeId;
        }
      } else {
        normalizedAnimeId = animeId;
      }
    } catch (e) {
      console.warn("Failed to resolve anime slug:", e);
      normalizedAnimeId = animeId;
    }
  }

  // Validate: numeric AniList ID OR otakudesu episodeId string
  const isValidAnimeId = /^\d+$/.test(normalizedAnimeId) ||
                        /^utgs-episode-\d+-[a-z-]+$/.test(normalizedAnimeId);
  if (!isValidAnimeId || !Number.isSafeInteger(episodeNumber) || episodeNumber < 1) {
    return res.status(400).json(setPayload(res, { message: "ID anime atau nomor episode tidak valid." }));
  }

  try {
    // 1. Get local source (YouTube embeds)
    let localSource = getVideoSource(normalizedAnimeId, episodeNumber);
    if (!localSource && normalizedAnimeId !== animeId) {
      localSource = getVideoSource(animeId, episodeNumber);
    }

    // 2. Try to get wajik server streams from all sources
    let wajikStreams: any[] = [];

    // ---- Source 1: Otakundesu (episode details) ----
    if (otakudesuEpisodeId) {
      try {
        const epRes = await fetch(`http://localhost:${PORT}/api/otakudesu/episode/${otakudesuEpisodeId}`);
        if (epRes.ok) {
          const epJson = (await epRes.json()) as { data?: { details?: { server?: { qualityList?: any[] }; referer?: string } } };
          const epData = epJson.data?.details;
          if (epData?.server?.qualityList) {
            const streams = epData.server.qualityList.flatMap((q: any) =>
              q.serverList?.map((s: any) => ({
                type: "wajik",
                source: "otakudesu",
                server: q.title,
                title: s.title,
                serverId: s.serverId,
                referer: epData.referer,
              })) || []
            );
            wajikStreams.push(...streams);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch otakundesu episode streams:", e);
      }
    }

    // ---- Source 2: Kuramanime (has direct server URLs in episode details) ----
    if (animeTitle) {
      try {
        // Search kuramanime for the anime
        const searchRes = await fetch(`http://localhost:${PORT}/api/kuramanime/anime?search=${encodeURIComponent(animeTitle)}`);
        if (searchRes.ok) {
          const searchJson = (await searchRes.json()) as { data?: { animeList?: any[] } };
          const animeList = searchJson.data?.animeList || [];

          if (animeList.length > 0) {
            const matchedAnime = animeList[0];
            const animeIdKm = matchedAnime.animeId;
            const animeSlug = matchedAnime.slug;

            // Get anime details to find episode list
            const detailsRes = await fetch(`http://localhost:${PORT}/api/kuramanime/anime/${animeIdKm}/${animeSlug}`);
            if (detailsRes.ok) {
              const detailsJson = (await detailsRes.json()) as { data?: { details?: { episodeList?: any[] } } };
              const episodeList = detailsJson.data?.details?.episodeList || [];
              const targetEpisode = episodeList.find((ep: any) => ep.episodeNumber === episodeNumber || ep.title?.includes(`Episode ${episodeNumber}`));

              if (targetEpisode?.episodeId) {
                // Get episode details which includes server qualityList with direct URLs
                const epRes = await fetch(`http://localhost:${PORT}/api/kuramanime/episode/${animeIdKm}/${animeSlug}/${targetEpisode.episodeId}`);
                if (epRes.ok) {
                  const epJson = (await epRes.json()) as { data?: { details?: { server?: { qualityList?: any[] }; referer?: string } } };
                  const epData = epJson.data?.details;
                  if (epData?.server?.qualityList) {
                    const streams = epData.server.qualityList.flatMap((q: any) =>
                      q.serverList?.map((s: any) => ({
                        type: "file",
                        source: "kuramanime",
                        server: q.title,
                        title: s.title,
                        url: s.url, // Direct URL from kuramadrive
                        referer: epData.referer || "",
                      })) || []
                    );
                    wajikStreams.push(...streams);
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("Failed to fetch kuramanime streams:", e);
      }
    }

    // ---- Source 3: Oploverz (has direct streamingUrl in episode details) ----
    if (animeTitle) {
      try {
        // Search oploverz for the anime
        const searchRes = await fetch(`http://localhost:${PORT}/api/oploverz/search?q=${encodeURIComponent(animeTitle)}`);
        if (searchRes.ok) {
          const searchJson = (await searchRes.json()) as { data?: { animeList?: any[] } };
          const animeList = searchJson.data?.animeList || [];

          if (animeList.length > 0) {
            const matchedAnime = animeList[0];
            const animeSlug = matchedAnime.slug || matchedAnime.id; // Oploverz uses slug

            // Get anime details to find episode list
            const detailsRes = await fetch(`http://localhost:${PORT}/api/oploverz/anime/${animeSlug}`);
            if (detailsRes.ok) {
              const detailsJson = (await detailsRes.json()) as { data?: { details?: { episodeList?: any[] } } };
              const episodeList = detailsJson.data?.details?.episodeList || [];
              const targetEpisode = episodeList.find((ep: any) => ep.episodeNumber === episodeNumber || ep.title?.includes(`Episode ${episodeNumber}`));

              if (targetEpisode?.episodeId) {
                // Get episode details which includes streamingUrl
                const epRes = await fetch(`http://localhost:${PORT}/api/oploverz/episode/${targetEpisode.episodeId}`);
                if (epRes.ok) {
                  const epJson = (await epRes.json()) as { data?: { details?: { streamingUrl?: string; title?: string } } };
                  const epData = epJson.data?.details;
                  if (epData?.streamingUrl) {
                    wajikStreams.push({
                      type: "file",
                      source: "oploverz",
                      server: "Oploverz",
                      title: epData.title || `Episode ${episodeNumber}`,
                      url: epData.streamingUrl,
                    });
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("Failed to fetch oploverz streams:", e);
      }
    }

    // Merge sources - prioritize local, then wajik
    const sources = [];
    if (localSource) {
      sources.push({ ...localSource, source: "local" });
    }
    sources.push(...wajikStreams);

    if (sources.length === 0) {
      return res.status(404).json(setPayload(res, { message: "Sumber video belum tersedia." }));
    }

    return res.json(
      setPayload(res, {
        data: {
          animeId,
          episode: episodeNumber,
          sources,
        },
      })
    );
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`NEKONIME API (wajik) running on http://localhost:${PORT}`);
});