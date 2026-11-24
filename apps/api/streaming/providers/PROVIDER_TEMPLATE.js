/**
 * Provider Template — NEKONIME Multi-Source Streaming
 *
 * INSTRUCTIONS:
 * 1. Copy this file to a new name, e.g., `officialProvider.js`
 * 2. Replace all placeholder values (marked with ⟪...⟫)
 * 3. Implement `getStreams` and optionally `listEpisodes`
 * 4. Register in `registry.js`: import and add to ALL_PROVIDERS
 * 5. Run tests: `npm test` (must pass before PR)
 *
 * COMPLIANCE CHECKLIST (all must be ✅):
 * ☐ Written confirmation of embedding rights from rights holder
 * ☐ No DRM bypass, token extraction, or auth circumvention
 * ☐ No scraping — uses official API or documented embed pattern
 * ☐ Geo-restriction handled: returns empty/403 for blocked regions (not spoofed)
 * ☐ Attribution preserved: `credit` field passed through to UI
 * ☐ Unverified gate implemented: `isPlayable()` equivalent
 * ☐ Respects 5s timeout contract (orchestrator enforces, but provider should be fast)
 */

// Provider metadata — REQUIRED
const provider = {
  // Unique identifier: lowercase, kebab-case, no spaces. Used in dedupeKey and logs.
  id: "⟪provider-id⟫", // e.g., "ani-one-asia"

  // Human-readable label for source selector dropdown.
  label: "⟪Display Name⟫", // e.g., "Ani-One Asia (Official)"

  // License verification — MANDATORY. Provider will be INACTIVE if not verified.
  license: {
    // Must be true for provider to be active. False = development only, never ships.
    verified: false, // ⟪CHANGE TO true ONLY AFTER LEGAL REVIEW⟫

    // Human-readable note: source of rights, embed policy URL, contact.
    note: "⟪Embed dari kanal resmi ⟪channel-name⟫ yang mengizinkan embedding di ⟪region⟫. Lisensi diverifikasi pada ⟪date⟫.⟫",
  },

  // Runtime toggle. Can be controlled via env/config in future.
  enabled: true,

  /**
   * Optional: synchronous playability gate.
   * Return false to skip backend call entirely for this anime/episode.
   * Mirrors localYouTube's `isPlayable(entry)` pattern.
   */
  // isPlayable({ animeId, episode }) { ... },

  /**
   * REQUIRED: Fetch stream sources for one episode.
   *
   * @param {Object} params
   * @param {string} params.animeId - AniList ID (string)
   * @param {number} params.episode - Episode number (1-based)
   * @param {string} [params.title] - Anime title (for search-based providers)
   * @returns {Promise<Source[]>} Array of source objects (see shape below)
   *
   * Source shape (all fields required unless noted):
   * {
   *   id: string,           // Unique per provider+episode. Format: "provider:animeId:episode[:variant]"
   *   provider: string,     // Must match this provider.id
   *   type: "youtube"|"file"|"embed",
   *   youtubeId: string|null,  // Required if type==="youtube"
   *   url: string|null,        // Required if type==="file" or "embed"
   *   title: string,           // e.g., "Episode 1", "Ep 1 - Subtitle Indonesia"
   *   credit: string,          // Attribution: "Official Channel Name (region)"
   *   license: "verified",     // Must be "verified" for active providers
   *   episode: number,         // Echo back for debugging
   *   // Optional metadata:
   *   quality?: string,        // e.g., "1080p", "720p"
   *   language?: string,       // e.g., "id", "en", "ja"
   *   subtitles?: string[],    // Available subtitle tracks
   * }
   */
  async getStreams({ animeId, episode, title }) {
    // 1. Validate inputs
    if (!animeId || !Number.isInteger(episode) || episode < 1) {
      return [];
    }

    // 2. Optional: check playability gate early
    // if (this.isPlayable && !this.isPlayable({ animeId, episode })) return [];

    // 3. Fetch from official source (API, embed page, playlist, etc.)
    //    - NO scraping, NO token extraction, NO auth bypass
    //    - Respect robots.txt, ToS, rate limits
    //    - Handle geo-blocking: return [] not fake data

    // Example pattern for YouTube official channel:
    // const videoId = await lookupVideoIdFromOfficialPlaylist(animeId, episode);
    // if (!videoId) return [];
    // return [{ id: `${this.id}:${animeId}:${episode}`, provider: this.id, type: "youtube", youtubeId: videoId, url: null, title: `Episode ${episode}`, credit: "Official Channel", license: "verified", episode }];

    // Example pattern for direct video file (HLS/DASH not yet supported in player):
    // const videoUrl = await getOfficialVideoUrl(animeId, episode);
    // if (!videoUrl) return [];
    // return [{ id: `${this.id}:${animeId}:${episode}`, provider: this.id, type: "file", youtubeId: null, url: videoUrl, title: `Episode ${episode}`, credit: "Official CDN", license: "verified", episode }];

    // Example pattern for generic embed (iframe):
    // const embedUrl = await getOfficialEmbedUrl(animeId, episode);
    // if (!embedUrl) return [];
    // return [{ id: `${this.id}:${animeId}:${episode}`, provider: this.id, type: "embed", youtubeId: null, url: embedUrl, title: `Episode ${episode}`, credit: "Official Site", license: "verified", episode }];

    // 4. Normalize and return
    // Each source MUST have provider === this.id
    return [];
  },

  /**
   * OPTIONAL: List episodes that have available streams.
   * Used by orchestrator's `listEpisodes(animeId)` for catalog badges.
   *
   * @param {Object} params
   * @param {string} params.animeId
   * @returns {Promise<{episode: number}[]>}
   */
  // async listEpisodes({ animeId }) {
  //   // Return [{ episode: 1 }, { episode: 2 }, ...]
  //   // Only include episodes that have verified, playable sources.
  //   return [];
  // },
};

// Export default for registry import
export default provider;