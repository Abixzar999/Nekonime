# Streaming Provider Compliance Requirements
**NEKONIME** — Multi-Source Streaming Architecture

---

## 1. Integration Permission Requirements

### 1.1 Mandatory Written Confirmation
Before any provider is added to `ALL_PROVIDERS` in `registry.js`:

- **Explicit embedding rights** from the rights holder (licensor, official channel, platform)
- **Written confirmation** (email, contract, public API terms, developer portal docs) that:
  - Embedding via `<iframe>` or official player is permitted
  - Geographic scope includes target regions (Indonesia, Southeast Asia, or global)
  - No authentication bypass, token extraction, or DRM circumvention required
  - Attribution/credit requirements are documented

### 1.2 Evidence Repository
Store verification evidence in `docs/provider-verification/<provider-id>/`:
```
docs/provider-verification/
├── ani-one-asia/
│   ├── email-confirmation.pdf
│   ├── embed-policy-url.txt
│   └── regions-covered.txt
├── muse-indonesia/
│   ├── youtube-embed-permission.txt
│   └── channel-verification.md
└── provider-template/
    └── CHECKLIST.md
```

### 1.3 Verification Gate in Code
```javascript
// registry.js — enforced at runtime
export function getActiveProviders() {
  return ALL_PROVIDERS.filter(
    (provider) => provider && provider.enabled === true && provider.license?.verified === true
  );
}
```
**Never set `verified: true` without documented evidence.**

---

## 2. Metadata Scraping vs. Video Integration

| Aspect | Metadata Scraping (FORBIDDEN) | Video Integration (PERMITTED) |
|--------|------------------------------|-------------------------------|
| **What** | Scraping anime titles, descriptions, episode lists, thumbnails from third-party sites | Using official embed codes, player APIs, or documented embed URLs |
| **Source** | Unauthorized sites, pirate aggregators, unofficial wikis | Official licensor sites, official YouTube channels, official platform APIs |
| **Legal Basis** | None — copyright infringement, ToS violation | Explicit permission or public embed policy |
| **NEKONIME Policy** | **Strictly prohibited** — no scraping code in repo | **Required** — all video sources must be authorized |

**Current Implementation:**
- Anime metadata (titles, posters, episodes) comes from **AniList API** (official, licensed)
- Video sources come from **manual mapping** in `episodes.js` (verified official channels only)
- **No provider performs scraping.** Any provider that scrapes will be rejected.

---

## 3. Embedding Requirements

### 3.1 Permitted Embed Patterns
1. **YouTube IFrame Embed** — `youtube-nocookie.com` with `rel=0`, channel allows embedding
2. **Official Player Embed** — Licensor-provided embed code (e.g., `player.ani-one.com/embed/...`)
3. **Direct Video File** — HLS/DASH/MP4 from official CDN with CORS headers permitting embedding
4. **Platform Embed** — Official embed from Crunchyroll, Netflix, etc. (if API/embed program exists)

### 3.2 Forbidden Patterns
- ❌ Bypassing geo-restrictions (VPN, proxy, header spoofing)
- ❌ Extracting HLS/DASH manifests from authenticated sessions
- ❌ Using `youtube.com/embed` without channel embedding permission
- ❌ iframe-ing pirate sites or unauthorized re-uploads
- ❌ Reverse-engineering private APIs (GraphQL, internal endpoints)

### 3.3 Attribution Requirements
Every source **must** include `credit` field displayed in UI:
```javascript
{ credit: "Ani-One Indonesia (kanal resmi)" }
{ credit: "Muse Indonesia (kanal resmi)" }
{ credit: "Ani-Mi Asia (kanal resmi)" }
```
Format: `"Channel/Brand Name (kanan resmi|official channel)"` — Indonesian UI, English fallback.

---

## 4. API Usage Policy

### 4.1 Rate Limits & Courtesy
- Respect provider rate limits (YouTube: 10k units/day default, official APIs vary)
- Implement exponential backoff on 429/5xx
- Cache responses (orchestrator: 5 min TTL)
- **No aggressive polling** — user-initiated only

### 4.2 Authentication
- **No API keys in client code** — backend-only if needed
- **No user credentials** — NEKONIME is unauthenticated public site
- **No token sharing** — each provider manages its own auth

### 4.3 Data Handling
- **No PII collected** — animeId, episode, title only
- **No tracking pixels** — clean embeds only
- **Referrer policy:** `strict-origin-when-cross-origin` (set in VideoPlayer)

---

## 5. Anti-Circumvention Prohibitions

The following are **strictly forbidden** and will result in immediate provider rejection:

| Prohibited Action | Why |
|-------------------|-----|
| DRM bypass (Widevine, PlayReady, FairPlay extraction) | Illegal (DMCA 1201, EUCD Art 6) |
| Authentication bypass (session stealing, cookie reuse) | Unauthorized access, CFAA violation |
| Geo-restriction circumvention (VPN, proxy, header spoofing) | License violation, ToS breach |
| Token/manifest extraction from encrypted streams | DRM circumvention |
| Reverse-engineering private/undocumented APIs | ToS violation, unstable |
| Automated scraping of any kind | Copyright, ToS, robots.txt |
| Storing/redistributing video segments | Redistribution without license |

**Providers must fail gracefully** — return `[]` (empty) when:
- Geo-blocked
- Episode not yet released
- License expired
- API unavailable

---

## 6. Source Verification Process

### 6.1 Pre-Activation Checklist
For each new provider, **all** must be ✅ before `verified: true`:

| # | Requirement | Verification Method |
|---|-------------|---------------------|
| 1 | Rights holder identified | Document licensor/channel owner |
| 2 | Embedding permission confirmed | Written evidence in `docs/provider-verification/` |
| 3 | Geographic coverage matches | Test from target regions (ID, SG, MY, etc.) |
| 4 | No DRM/auth bypass in code | Code review — only public embed/API calls |
| 5 | Attribution/credit documented | `credit` field populated correctly |
| 6 | Playability gate implemented | `isPlayable()` or equivalent returns false for unverified |
| 7 | Timeout compliance | Responds < 5s (orchestrator enforces) |
| 8 | Error handling | Returns `[]` on 404/403/5xx, never throws |
| 9 | Dedupe key stability | `provider.id` + stable identifier |
| 10 | Tests pass | Unit + integration tests green |

### 6.2 Ongoing Compliance
- **Quarterly audit:** Re-verify embedding permissions still valid
- **Channel monitoring:** Official channels may disable embedding
- **Region changes:** Licensor may restrict regions
- **Deprecation:** Set `enabled: false` immediately if permission revoked

### 6.3 Emergency Revocation
If rights holder requests removal or violation discovered:
1. Set `enabled: false` in provider file immediately
2. Remove from `ALL_PROVIDERS` in registry
3. Deploy hotfix — no waiting for sprint
4. Document in `CHANGELOG.md`

---

## 7. Current Verified Providers (Reference)

| Provider ID | Label | License Note | Verified | Since |
|-------------|-------|--------------|----------|-------|
| `local-youtube` | YouTube Resmi | Embed dari kanal resmi yang dipetakan manual di `apps/web/src/data/episodes.js` | ✅ | 2026-11 |

**All other providers must meet or exceed this standard.**

---

## 8. Adding a New Provider — Step-by-Step

1. **Legal Review** — Obtain written embedding permission
2. **Evidence Archive** — Save to `docs/provider-verification/<id>/`
3. **Implement Adapter** — Copy `PROVIDER_TEMPLATE.js`, implement `getStreams`
4. **Unit Tests** — Test `getStreams` with valid/invalid/geo-blocked cases
5. **Integration Test** — Verify orchestrator merges, dedupes, caches correctly
6. **Code Review** — Security + compliance review (no bypass, proper errors)
7. **Set `verified: true`** — Only after all above ✅
8. **Register** — Add to `ALL_PROVIDERS` in `registry.js`
9. **Deploy** — Monitor logs for errors, latency
10. **Document** — Update this file's provider table

---

## 9. Enforcement

- **CI Gate:** `npm test` must pass (includes provider compliance tests)
- **Code Review:** Required for any provider change
- **No Exception:** Not even for "testing" or "development" — unverified providers never reach production
- **Audit Trail:** Git history shows who approved `verified: true` and when

---

*This document is binding. Violations constitute project policy breach and legal risk.*
*Last updated: 2026-11-24 | Review quarterly*