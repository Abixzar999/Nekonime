import test from "node:test";
import assert from "node:assert/strict";
import { getActiveProviders, listProviders } from "./registry.js";
import { getStreams, listEpisodes } from "./index.js";
import localYouTube from "./providers/localYouTube.js";

test("semua provider aktif sudah terverifikasi lisensinya", () => {
  const providers = getActiveProviders();
  assert.ok(providers.length > 0);
  for (const provider of providers) {
    assert.equal(provider.enabled, true);
    assert.equal(provider.license.verified, true);
  }
});

test("daftar provider hanya berisi yang terverifikasi", () => {
  const providers = listProviders();
  assert.ok(providers.some((provider) => provider.id === "local-youtube"));
  for (const provider of providers) {
    assert.equal(provider.verified, true);
  }
});

test("provider lokal mengembalikan sumber YouTube resmi", async () => {
  const sources = await localYouTube.getStreams({ animeId: "21459", episode: 1 });
  assert.equal(sources.length, 1);
  assert.equal(sources[0].type, "youtube");
  assert.equal(sources[0].youtubeId, "jE2oIRiFjkY");
  assert.equal(sources[0].license, "verified");
});

test("provider lokal tidak mengarang sumber untuk episode yang tidak dipetakan", async () => {
  const sources = await localYouTube.getStreams({ animeId: "99999", episode: 1 });
  assert.deepEqual(sources, []);
});

test("orkestrator menggabungkan sumber dari provider aktif", async () => {
  const sources = await getStreams({ animeId: "21459", episode: 1 });
  assert.equal(sources.length, 1);
  assert.equal(sources[0].provider, "local-youtube");
});

test("orkestrator mengembalikan daftar kosong untuk episode tanpa sumber", async () => {
  const sources = await getStreams({ animeId: "99999", episode: 1 });
  assert.deepEqual(sources, []);
});

test("daftar episode mengikuti peta sumber lokal", () => {
  const episodes = listEpisodes("21459");
  assert.equal(episodes.length, 13);
  assert.equal(episodes[0].episode, 1);
  assert.equal(episodes.at(-1).episode, 13);
});

test("sumber yang belum terverifikasi tidak diputar", async () => {
  const sources = await localYouTube.getStreams({ animeId: "120120", episode: 1 });
  assert.deepEqual(sources, []);
});

test("daftar episode melewati sumber yang belum terverifikasi", () => {
  assert.deepEqual(listEpisodes("120120"), []);
});
