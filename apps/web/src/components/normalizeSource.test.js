import test from "node:test";
import assert from "node:assert/strict";

// Replicate normalizeSource logic for testing (mirrors VideoPlayer.jsx)
const SUPPORTED_TYPES = new Set(["youtube", "file", "embed"]);

function normalizeSource(source, index) {
  if (!source || typeof source !== "object") return null;

  const provider = source.provider || "local";
  const type = source.type;
  if (!type || !SUPPORTED_TYPES.has(type)) return null;

  let youtubeId = null;
  if (type === "youtube") {
    youtubeId = source.youtubeId || source.id || null;
    if (!youtubeId) return null;
  }

  let url = null;
  if (type === "file" || type === "embed") {
    url = source.url || null;
    if (!url) return null;
  }

  const identifier = youtubeId || url || source.id || `idx-${index}`;
  const sourceId = source.id ? String(source.id) : `${provider}:${type}:${identifier}`;
  const credit = source.credit || source.provider || provider;
  const license = source.license || undefined;

  return {
    ...source,
    provider,
    id: sourceId,
    type,
    youtubeId,
    url,
    title: source.title || `Episode ${source.episode || index}`,
    credit,
    license,
    key: `${provider}:${sourceId}:${index}`,
  };
}

test("normalizeSource: rejects null/undefined", () => {
  assert.equal(normalizeSource(null, 0), null);
  assert.equal(normalizeSource(undefined, 0), null);
  assert.equal(normalizeSource("string", 0), null);
  assert.equal(normalizeSource(123, 0), null);
});

test("normalizeSource: rejects unsupported type", () => {
  assert.equal(normalizeSource({ type: "hls", url: "x.m3u8" }, 0), null);
  assert.equal(normalizeSource({ type: "dash", url: "x.mpd" }, 0), null);
  assert.equal(normalizeSource({ type: "unknown" }, 0), null);
  assert.equal(normalizeSource({ type: "" }, 0), null);
});

test("normalizeSource: rejects youtube without ID", () => {
  assert.equal(normalizeSource({ type: "youtube" }, 0), null);
  assert.equal(normalizeSource({ type: "youtube", id: "" }, 0), null);
  assert.equal(normalizeSource({ type: "youtube", youtubeId: "" }, 0), null);
});

test("normalizeSource: rejects file/embed without URL", () => {
  assert.equal(normalizeSource({ type: "file" }, 0), null);
  assert.equal(normalizeSource({ type: "file", url: "" }, 0), null);
  assert.equal(normalizeSource({ type: "embed" }, 0), null);
  assert.equal(normalizeSource({ type: "embed", url: "" }, 0), null);
});

test("normalizeSource: accepts valid youtube with youtubeId", () => {
  const result = normalizeSource({ type: "youtube", youtubeId: "abc123", provider: "test" }, 0);
  assert.ok(result);
  assert.equal(result.type, "youtube");
  assert.equal(result.youtubeId, "abc123");
  assert.equal(result.url, null);
  assert.equal(result.provider, "test");
});

test("normalizeSource: accepts valid youtube with legacy id field", () => {
  const result = normalizeSource({ type: "youtube", id: "legacy123" }, 0);
  assert.ok(result);
  assert.equal(result.youtubeId, "legacy123");
  assert.equal(result.provider, "local"); // default
});

test("normalizeSource: accepts valid file with url", () => {
  const result = normalizeSource({ type: "file", url: "https://cdn.example.com/ep1.mp4" }, 0);
  assert.ok(result);
  assert.equal(result.type, "file");
  assert.equal(result.url, "https://cdn.example.com/ep1.mp4");
  assert.equal(result.youtubeId, null);
});

test("normalizeSource: accepts valid embed with url", () => {
  const result = normalizeSource({ type: "embed", url: "https://player.example.com/embed/123" }, 0);
  assert.ok(result);
  assert.equal(result.type, "embed");
  assert.equal(result.url, "https://player.example.com/embed/123");
});

test("normalizeSource: generates stable key with provider prefix", () => {
  const result = normalizeSource({ type: "youtube", youtubeId: "abc", provider: "provider-x" }, 0);
  assert.ok(result.key.startsWith("provider-x:"));
  assert.ok(result.key.includes("abc"));
  assert.ok(result.key.endsWith(":0"));
});

test("normalizeSource: preserves explicit id field", () => {
  const result = normalizeSource({ type: "youtube", youtubeId: "abc", id: "custom-id-42" }, 0);
  assert.equal(result.id, "custom-id-42");
});

test("normalizeSource: generates id when missing", () => {
  const result = normalizeSource({ type: "youtube", youtubeId: "abc", provider: "p1" }, 0);
  assert.ok(result.id.startsWith("p1:youtube:abc"));
});

test("normalizeSource: defaults credit to provider", () => {
  const result = normalizeSource({ type: "youtube", youtubeId: "abc", provider: "my-provider" }, 0);
  assert.equal(result.credit, "my-provider");
});

test("normalizeSource: uses explicit credit when provided", () => {
  const result = normalizeSource({ type: "youtube", youtubeId: "abc", credit: "Official Channel" }, 0);
  assert.equal(result.credit, "Official Channel");
});

test("normalizeSource: preserves license field", () => {
  const result = normalizeSource({ type: "youtube", youtubeId: "abc", license: "verified" }, 0);
  assert.equal(result.license, "verified");
});

test("normalizeSource: generates title from episode or index", () => {
  const r1 = normalizeSource({ type: "youtube", youtubeId: "abc", episode: 5 }, 0);
  assert.equal(r1.title, "Episode 5");
  const r2 = normalizeSource({ type: "youtube", youtubeId: "abc" }, 3);
  assert.equal(r2.title, "Episode 3");
});

test("normalizeSource: legacy localYouTube shape compatibility", () => {
  // Old shape from episodes.js: { type: "youtube", id: "VIDEO_ID", credit: "..." }
  const legacy = { type: "youtube", id: "jE2oIRiFjkY", credit: "Ani-One Indonesia (kanal resmi)" };
  const result = normalizeSource(legacy, 0);
  assert.ok(result);
  assert.equal(result.youtubeId, "jE2oIRiFjkY");
  assert.equal(result.credit, "Ani-One Indonesia (kanal resmi)");
  assert.equal(result.provider, "local");
  assert.equal(result.license, undefined); // not in legacy
});

test("normalizeSource: provider field from source takes precedence", () => {
  const result = normalizeSource({ type: "youtube", youtubeId: "abc", provider: "explicit-provider" }, 0);
  assert.equal(result.provider, "explicit-provider");
});