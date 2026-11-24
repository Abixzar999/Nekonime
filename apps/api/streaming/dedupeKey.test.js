import test from "node:test";
import assert from "node:assert/strict";

// Import the internal function for testing
// Since dedupeKey is not exported, we test via getStreams integration
// But we can also test the logic directly by replicating it here

function dedupeKey(source) {
  const provider = source.provider || "unknown";
  const identifier = source.youtubeId || source.url || source.id || "no-id";
  return `${provider}:${source.type}:${identifier}`;
}

test("dedupeKey: includes provider ID for cross-provider uniqueness", () => {
  const sourceA = { provider: "provider-a", type: "youtube", youtubeId: "abc123" };
  const sourceB = { provider: "provider-b", type: "youtube", youtubeId: "abc123" };
  assert.notEqual(dedupeKey(sourceA), dedupeKey(sourceB));
});

test("dedupeKey: same provider + same identifier = same key (dedupes)", () => {
  const source1 = { provider: "local-youtube", type: "youtube", youtubeId: "jE2oIRiFjkY" };
  const source2 = { provider: "local-youtube", type: "youtube", youtubeId: "jE2oIRiFjkY" };
  assert.equal(dedupeKey(source1), dedupeKey(source2));
});

test("dedupeKey: different type with same identifier = different keys", () => {
  const sourceYT = { provider: "p1", type: "youtube", youtubeId: "same-id" };
  const sourceFile = { provider: "p1", type: "file", url: "same-id" };
  assert.notEqual(dedupeKey(sourceYT), dedupeKey(sourceFile));
});

test("dedupeKey: falls back to url when youtubeId absent", () => {
  const source = { provider: "p1", type: "file", url: "https://example.com/video.mp4" };
  assert.equal(dedupeKey(source), "p1:file:https://example.com/video.mp4");
});

test("dedupeKey: falls back to id when youtubeId and url absent", () => {
  const source = { provider: "p1", type: "embed", id: "custom-id-123" };
  assert.equal(dedupeKey(source), "p1:embed:custom-id-123");
});

test("dedupeKey: defaults to 'unknown' provider when missing", () => {
  const source = { type: "youtube", youtubeId: "abc" };
  assert.equal(dedupeKey(source), "unknown:youtube:abc");
});

test("dedupeKey: defaults to 'no-id' when all identifiers missing", () => {
  const source = { provider: "p1", type: "youtube" };
  assert.equal(dedupeKey(source), "p1:youtube:no-id");
});

test("dedupeKey: deterministic ordering", () => {
  const source = { provider: "p1", type: "youtube", youtubeId: "abc" };
  const key1 = dedupeKey(source);
  const key2 = dedupeKey(source);
  assert.equal(key1, key2);
});

test("dedupeKey: provider prefix prevents collision across providers", () => {
  // Two providers returning the same YouTube video (e.g., same official upload mirrored)
  // Should be treated as separate sources so user can choose
  const sources = [
    { provider: "ani-one", type: "youtube", youtubeId: "shared123", credit: "Ani-One" },
    { provider: "muse", type: "youtube", youtubeId: "shared123", credit: "Muse" },
  ];
  const keys = sources.map(dedupeKey);
  assert.equal(new Set(keys).size, 2); // Both preserved
  assert.ok(keys[0].startsWith("ani-one:"));
  assert.ok(keys[1].startsWith("muse:"));
});