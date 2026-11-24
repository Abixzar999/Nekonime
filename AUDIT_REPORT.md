# Multi-Source Streaming Architecture Audit Report
**Project:** NEKONIME | **Phase:** Read-Only Audit | **Date:** 2026-11-24

---

## Executive Summary
The current architecture already implements a **provider adapter pattern** with a local YouTube provider as the sole active source. The system is well-structured for multi-source expansion but requires specific integration points to be hardened before adding new providers. All existing features (history, progress, favorites, catalog, player) are preserved by design.

---

## A. Current Provider Pipeline

### 1. Data Layer (Frontend)
```
apps/web/src/data/episodes.js
├── videoSources map: { "animeId:episode" → { type, id/url, credit, unverified? } }
├── getVideoSource(animeId, episode) → verified entry or null
├── getSourceStatus(animeId, episode) → "available" | "unverified" | "none"
├── hasPlayableSource(animeId) → boolean
└── playableAnimeIds → number[] (for "Watchable" catalog filter)
```

**Key invariant:** Only entries with `unverified !== true` are playable. The `unverified` flag gates playability at the provider level.

### 2. Provider Adapter Interface
Each provider in `apps/api/streaming/providers/*.js` must implement:
```javascript
{
  id: string,                    // unique identifier (e.g., "local-youtube")
  label: string,                 // display name (e.g., "YouTube Resmi")
  license: { verified: boolean, note: string },
  enabled: boolean,
  
  async getStreams({ animeId, episode, title }) → Source[],
  listEpisodes?({ animeId }) → { episode: number }[]
}
```

### 3. Current Sole Provider: `localYouTube.js`
- **Source:** Reads from `apps/web/src/data/episodes.js` (manual mapping)
- **Output shape:** `{ id, provider, type, youtubeId, url, title, credit, license: "verified" }`
- **Types supported:** `youtube`, `file`
- **Gate:** `isPlayable(entry)` = `entry && entry.unverified !== true`

### 4. Registry & Orchestrator (`apps/api/streaming/`)
```
registry.js:
  ALL_PROVIDERS = [localYouTube]
  getActiveProviders() → filters by enabled && license.verified

index.js:
  getStreams({ animeId, episode, title })
    → Promise.allSettled with 5s timeout per provider
    → Deduplication by `${type}:${youtubeId||url||id}`
    → 5-min cache (disabled for empty results)
  
  listEpisodes(animeId) → merges across providers, first-wins
```

### 5. Frontend Integration (App.jsx)
```javascript
// Stream fetching effect (lines 154-181)
- Skips backend call if getSourceStatus() === "unverified"
- Merges: remoteStreams (from API) || fallbackStreams (local videoSources)
- Stream key: `${animeId}:${episode}` (same as history/progress key)

// VideoPlayer receives:
sources={streamSources}  // array of normalized source objects
```

---

## B. VideoPlayer Capabilities & Gaps

### Supported Source Types
| Type | Implementation | Progress Tracking |
|------|---------------|-------------------|
| `youtube` | YouTube IFrame API (preferred) + fallback embed | ✅ via YT.Player.getCurrentTime() |
| `file` | HTML5 `<video>` | ✅ via onTimeUpdate/onPause |
| `embed` | Generic `<iframe>` | ❌ **No progress tracking** |

### Source Selector UI
- Dropdown with provider `credit` as label (line 280+ in VideoPlayer.jsx)
- Auto-selects first source on list change (line 69)
- Cinema mode (fullscreen overlay with page dimming)

### Critical Gaps for Multi-Source
1. **No HLS/DASH support** — only YouTube embed, direct file, generic iframe
2. **No progress tracking for `embed` type** — cross-origin iframes block time access
3. **Source identity tied to `youtubeId`** — dedupe key fails for non-YouTube sources
4. **No quality/ABR selection** — single source per provider
5. **No DRM/EME hooks** — by design (legal sources only)

---

## C. History / Progress / Favorites Integration

### Storage Keys (localStorage)
| Feature | Key | Structure |
|---------|-----|-----------|
| History | `nekonime-history` | `[{ animeId, episode, title, poster, anime, position, duration }, ...]` |
| Progress | `nekonime-progress` | `{ "animeId:episode": { position, duration } }` |
| Favorites | `nekonime-favorites` | `[animeId, ...]` |
| Cinema mode | `nekonime-cinema` | `boolean` |

### Key Coupling Points
- **History/Progress key:** `${animeId}:${episode}` — **must remain stable** across source switches
- `recordHistory(anime, episode)` called in `watchEpisode()` (App.jsx:288)
- `saveProgress(position, duration)` → `onProgress` prop of VideoPlayer
- `resumePoint(entry)` returns 0 if `< 10s` or `≥ 95%` (finished)

### Preservation Requirements
✅ **Current design preserves all features** because:
- Source switching doesn't change `animeId:episode` key
- Progress saved per episode, not per source
- History stores `anime` snapshot for offline catalog access

---

## D. Verified Sources Inventory (as of audit)

### Episodes Mapped in `episodes.js` (all `type: "youtube"`, `unverified: false`)

| Anime (AniList ID) | Title | Episodes | Provider (Credit) | Status |
|---|---|---|---|---|
| 21459 | My Hero Academia S1 | 1-13 | Ani-One Indonesia | ✅ Verified |
| 21856 | My Hero Academia S2 | 1 | Ani-One Indonesia | ✅ Verified |
| 159831 | Zom 100 | 1-12 | Muse Indonesia | ✅ Verified |
| 205909 | Hotaru no Yomeiri | 1-5 | Muse Indonesia | ✅ Verified* |
| 198376 | BanG Dream! YUME∞MITA | 1-13 | Muse Indonesia | ✅ Verified |
| 98503 | School Babysitters | 1-12 | Muse Indonesia | ✅ Verified |
| 152682 | Sasaki and Peeps | 1-12 | Muse Indonesia | ⚠️ **Needs embed verification** |
| 141862 | Ringing Fate | 1-10 | Ani-Mi Asia | ✅ Verified |

> *Hotaru no Yomeiri: "Masih tayang, episode 1-5 terverifikasi" — ongoing series

### Unverified (blocked from playback)
- `120120:1-24` — "Kanal belum terverifikasi", `unverified: true`

---

## E. Integration Points for New Providers

### 1. Add Provider File
`apps/api/streaming/providers/<providerId>.js`
```javascript
export default {
  id: "<provider-id>",
  label: "Display Name",
  license: { verified: true, note: "Legal basis..." },
  enabled: true,
  async getStreams({ animeId, episode, title }) { ... },
  listEpisodes?({ animeId }) { ... }
}
```

### 2. Register in Registry
`apps/api/streaming/registry.js`:
```javascript
import newProvider from "./providers/newProvider.js";
const ALL_PROVIDERS = [localYouTube, newProvider];
```

### 3. Frontend Source Normalization (VideoPlayer.jsx:33-40)
```javascript
function normalizeSource(source) {
  return {
    ...source,
    youtubeId: source.youtubeId || (source.type === "youtube" ? source.id : null),
    key: source.id ? `${source.id}:${index}` : `source:${index}`,
  };
}
```
⚠️ **Risk:** `key` generation uses `source.id` which may collide across providers.

### 4. Backend Deduplication (index.js:16-18)
```javascript
function dedupeKey(source) {
  return `${source.type}:${source.youtubeId || source.url || source.id}`;
}
```
⚠️ **Risk:** Different providers returning same YouTube ID will dedupe (correct). Different providers with same `url` but different licenses will dedupe (potential issue).

---

## F. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Source key collision** | High | Use provider-prefixed IDs: `${provider.id}:${animeId}:${episode}` |
| **Progress loss on source switch** | Medium | Ensure `animeId:episode` key stable; test multi-source resume |
| **Embed type no progress** | High | Document limitation; consider `postMessage` for same-origin embeds |
| **Cache staleness** | Low | 5-min TTL; empty results not cached |
| **Provider timeout blocking** | Low | 5s timeout + `Promise.allSettled` (already implemented) |
| **Unverified content leakage** | Critical | Double-gate: provider `isPlayable()` + frontend `getSourceStatus()` |

---

## G. Compliance Checklist (Must-Pass Before Adding Providers)

- [ ] **License verified:** Written confirmation of embedding rights from rights holder
- [ ] **No DRM bypass:** Provider uses official embed/player, no token extraction
- [ ] **No scraping:** Provider uses official API or documented embed pattern
- [ ] **Geo-restriction handling:** Provider returns 403/empty for blocked regions (not spoofed)
- [ ] **Attribution preserved:** `credit` field passed through to UI
- [ ] **Unverified gate:** Provider implements `isPlayable()` equivalent
- [ ] **Timeout resilience:** Provider respects 5s timeout contract

---

## H. Recommended Implementation Sequence

1. **Hardening (do first, no new providers)**
   - [ ] Prefix source `id` with provider ID in all providers
   - [ ] Add `provider` field to `dedupeKey()` for cross-provider uniqueness
   - [ ] Add integration test: multi-provider stream merge + dedupe
   - [ ] Document `embed` type progress limitation in VideoPlayer

2. **Provider Template & Docs**
   - [ ] Create `PROVIDER_TEMPLATE.js` with JSDoc interface
   - [ ] Add `CONTRIBUTING_PROVIDERS.md` with compliance checklist

3. **Pilot Provider (when approved)**
   - [ ] Add one verified provider (e.g., Ani-One Asia if embed rights confirmed)
   - [ ] End-to-end test: source select → progress save → history → resume
   - [ ] Verify catalog filters (`hasPlayableSource`, `playableAnimeIds`) update

4. **Observability**
   - [ ] Add provider latency/error metrics to `/streams` response (debug mode)
   - [ ] Log source selection in VideoPlayer (console.debug)

---

## I. Files Requiring Changes (Implementation Phase Only)

| File | Change Type |
|------|-------------|
| `apps/api/streaming/providers/*.js` | New provider implementations |
| `apps/api/streaming/registry.js` | Add to `ALL_PROVIDERS` |
| `apps/api/streaming/index.js` | `dedupeKey()` enhancement (provider prefix) |
| `apps/web/src/components/VideoPlayer.jsx` | `normalizeSource()` key stability |
| `apps/web/src/data/episodes.js` | Add new verified source mappings (manual) |
| `tests/` | New integration tests for multi-provider |

---

## Sign-Off
**Audit Complete.** Awaiting user approval to proceed with hardening phase (Section H, item 1).

*Report generated from read-only codebase inspection. No files modified.*