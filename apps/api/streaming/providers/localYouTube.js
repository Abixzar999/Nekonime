import { videoSources } from "../../../web/src/data/episodes.js";

// Hanya entri yang atribusinya sudah terverifikasi yang boleh diputar.
const isPlayable = (entry) => Boolean(entry) && entry.unverified !== true;

// Sumber lokal yang sudah dipetakan manual ke kanal resmi (lihat data/episodes.js).
// Provider ini tidak melakukan scraping dan tidak mengarang URL.
const localYouTube = {
  id: "local-youtube",
  label: "YouTube Resmi",
  license: {
    verified: true,
    note: "Embed dari kanal resmi yang dipetakan manual di apps/web/src/data/episodes.js",
  },
  enabled: true,

  async getStreams({ animeId, episode }) {
    const entry = videoSources[`${animeId}:${episode}`];
    if (!isPlayable(entry)) return [];

    if (entry.type === "youtube" && entry.id) {
      return [
        {
          id: `local-youtube:${animeId}:${episode}`,
          provider: "local-youtube",
          type: "youtube",
          youtubeId: entry.id,
          url: null,
          title: `Episode ${episode}`,
          credit: entry.credit || "YouTube resmi",
          license: "verified",
        },
      ];
    }

    if (entry.type === "file" && entry.url) {
      return [
        {
          id: `local-youtube:${animeId}:${episode}`,
          provider: "local-youtube",
          type: "file",
          youtubeId: null,
          url: entry.url,
          title: `Episode ${episode}`,
          credit: entry.credit || "Sumber resmi",
          license: "verified",
        },
      ];
    }

    return [];
  },

  listEpisodes({ animeId }) {
    const prefix = `${animeId}:`;
    return Object.keys(videoSources)
      .filter((key) => key.startsWith(prefix) && isPlayable(videoSources[key]))
      .map((key) => Number(key.slice(prefix.length)))
      .filter((episode) => Number.isSafeInteger(episode) && episode > 0)
      .sort((a, b) => a - b)
      .map((episode) => ({ episode, available: true }));
  },
};

export default localYouTube;
