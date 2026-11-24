import test from "node:test";
import assert from "node:assert/strict";
import {
  animeFromHistory,
  clampEpisode,
  findAnimeIn,
  normalizeFavorites,
  normalizeHistory
} from "./animeState.js";
import { formatTime, isFinished, keepProgress, resumePoint } from "./progress.js";

test("favorit rusak atau bukan array tidak membuat crash", () => {
  assert.deepEqual(normalizeFavorites(null), []);
  assert.deepEqual(normalizeFavorites({}), []);
  assert.deepEqual(normalizeFavorites("bukan array"), []);
  assert.deepEqual(normalizeFavorites([null, "x"]), []);
});

test("favorit lama berbasis angka tetap bisa dipulihkan", () => {
  const restored = normalizeFavorites([1]);
  assert.equal(restored.length, 1);
  assert.equal(restored[0].id, 1);
  assert.equal(typeof restored[0].title, "string");
});

test("favorit berbentuk objek dipertahankan", () => {
  const saved = [{ id: 99, title: "Contoh" }];
  assert.deepEqual(normalizeFavorites(saved), saved);
});

test("riwayat rusak disaring dan field progres dinormalkan", () => {
  assert.deepEqual(normalizeHistory(null), []);
  assert.deepEqual(normalizeHistory({}), []);

  const restored = normalizeHistory([
    { animeId: 5, episode: 0, position: "x", duration: 12 },
    { foo: 1 },
    null
  ]);

  assert.equal(restored.length, 1);
  assert.equal(restored[0].episode, 1);
  assert.equal(restored[0].position, 0);
  assert.equal(restored[0].duration, 12);
});

test("riwayat lama tanpa snapshot tetap menghasilkan objek minimal yang jujur", () => {
  const anime = animeFromHistory({
    animeId: 7,
    episode: 2,
    title: "Judul Lama",
    poster: "/poster.jpg"
  });

  assert.equal(anime.id, 7);
  assert.equal(anime.title, "Judul Lama");
  assert.equal(anime.poster, "/poster.jpg");
  assert.equal(anime.totalEpisodes, null);
  assert.equal(anime.rating, "-");
  assert.equal(animeFromHistory(null), null);
});

test("snapshot anime di riwayat dipakai apa adanya", () => {
  const snapshot = { id: 7, title: "Snapshot" };
  assert.equal(animeFromHistory({ animeId: 7, anime: snapshot }), snapshot);
});

test("favorit di luar katalog aktif tetap bisa dibuka", () => {
  const favorite = { id: 501, title: "Favorit Lama" };
  const found = findAnimeIn(501, { items: [{ id: 1 }], favorites: [favorite] });
  assert.equal(found, favorite);
});

test("riwayat di luar katalog aktif tetap bisa dibuka", () => {
  const found = findAnimeIn(502, {
    items: [{ id: 1 }],
    watchHistory: [{ animeId: 502, episode: 3, title: "Dari Riwayat" }]
  });
  assert.equal(found.id, 502);
  assert.equal(found.title, "Dari Riwayat");
  assert.equal(found.totalEpisodes, null);
});

test("katalog aktif tetap menjadi prioritas pertama", () => {
  const fromCatalog = { id: 9, title: "Katalog" };
  const fromFavorite = { id: 9, title: "Favorit" };
  const found = findAnimeIn(9, {
    items: [fromCatalog],
    favorites: [fromFavorite]
  });
  assert.equal(found, fromCatalog);
});

test("id yang tidak dikenal mengembalikan undefined", () => {
  assert.equal(findAnimeIn(999, { items: [{ id: 1 }] }), undefined);
});

test("episode selalu di-clamp ke rentang yang valid", () => {
  assert.equal(clampEpisode(13, 12), 12);
  assert.equal(clampEpisode(0, 12), 1);
  assert.equal(clampEpisode(5, null), 5);
  assert.equal(clampEpisode(5, 0), 5);
  assert.equal(clampEpisode(2.5, 12), 1);
});

test("resume hanya untuk progres yang belum selesai", () => {
  assert.equal(resumePoint({ position: 30, duration: 100 }), 30);
  assert.equal(resumePoint({ position: 5, duration: 100 }), 0);
  assert.equal(resumePoint({ position: 96, duration: 100 }), 0);
  assert.equal(resumePoint(null), 0);
  assert.equal(isFinished(95, 100), true);
  assert.equal(isFinished(50, 100), false);
});

test("progres episode yang sama dipertahankan saat dicatat ulang", () => {
  const history = [{ animeId: 1, episode: 2, position: 40, duration: 100 }];
  assert.deepEqual(keepProgress(history, 1, 2), { position: 40, duration: 100 });
  assert.deepEqual(keepProgress(history, 1, 3), {});
});

test("format waktu tetap konsisten", () => {
  assert.equal(formatTime(754), "12:34");
  assert.equal(formatTime(0), "0:00");
  assert.equal(formatTime(3661), "1:01:01");
});
