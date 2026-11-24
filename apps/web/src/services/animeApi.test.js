import test from "node:test";
import assert from "node:assert/strict";
import { getEpisodeStreams } from "./animeApi.js";

const withFetch = async (impl, run) => {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
};

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });

test("404 berarti belum ada sumber, bukan error", async () => {
  await withFetch(
    async () => new Response(null, { status: 404 }),
    async () => {
      assert.deepEqual(await getEpisodeStreams(21459, 1), []);
    }
  );
});

test("respons sukses mengembalikan daftar sumber", async () => {
  const source = { id: "local-youtube:21459:1", type: "youtube" };

  await withFetch(
    async () => jsonResponse({ data: { sources: [source] } }),
    async () => {
      assert.deepEqual(await getEpisodeStreams(21459, 1), [source]);
    }
  );
});

test("judul dikirim sebagai query yang aman", async () => {
  let requested = "";

  await withFetch(
    async (url) => {
      requested = String(url);
      return jsonResponse({ data: { sources: [] } });
    },
    async () => {
      await getEpisodeStreams(21459, 1, { title: "My Hero & Friends" });
    }
  );

  assert.match(requested, /\/episodes\/21459\/1\/streams\?title=My\+Hero\+%26\+Friends/);
});

test("error server tetap dilempar agar fallback lokal dipakai", async () => {
  await withFetch(
    async () => new Response(null, { status: 500 }),
    async () => {
      await assert.rejects(() => getEpisodeStreams(21459, 1), /Backend error: 500/);
    }
  );
});
