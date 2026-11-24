import { getActiveProviders } from "./registry.js";

const PROVIDER_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

// Batasi waktu satu provider agar provider lambat tidak menahan respons.
function withTimeout(promise, ms, providerId) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Provider ${providerId} timeout`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function dedupeKey(source) {
  // Provider ID is required for cross-provider uniqueness.
  // Fallback to "unknown" only for legacy sources without provider field.
  const provider = source.provider || "unknown";
  const identifier = source.youtubeId || source.url || source.id || "no-id";
  return `${provider}:${source.type}:${identifier}`;
}

// Kumpulkan sumber dari seluruh provider aktif. Provider yang gagal dilewati.
export async function getStreams({ animeId, episode, title }) {
  const cacheKey = `${animeId}:${episode}:${title || ""}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.sources;

  const providers = getActiveProviders();
  const results = await Promise.allSettled(
    providers.map((provider) =>
      withTimeout(
        Promise.resolve().then(() => provider.getStreams({ animeId, episode, title })),
        PROVIDER_TIMEOUT_MS,
        provider.id
      )
    )
  );

  const sources = [];
  const seen = new Set();

  for (const result of results) {
    if (result.status !== "fulfilled" || !Array.isArray(result.value)) continue;
    for (const source of result.value) {
      const key = dedupeKey(source);
      if (seen.has(key)) continue;
      seen.add(key);
      sources.push(source);
    }
  }

  // Jangan cache hasil kosong agar sumber baru langsung terlihat saat pengembangan.
  if (sources.length > 0) {
    cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, sources });
  }

  return sources;
}

// Daftar episode yang punya sumber dari provider aktif.
export function listEpisodes(animeId) {
  const byEpisode = new Map();

  for (const provider of getActiveProviders()) {
    if (typeof provider.listEpisodes !== "function") continue;
    for (const item of provider.listEpisodes({ animeId })) {
      if (!byEpisode.has(item.episode)) byEpisode.set(item.episode, item);
    }
  }

  return [...byEpisode.values()].sort((a, b) => a.episode - b.episode);
}
