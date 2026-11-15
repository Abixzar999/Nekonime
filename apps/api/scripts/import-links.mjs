// Mengimpor episode dari alamat watch_videos?video_ids=... (atau daftar tautan/ID video)
// ke apps/web/src/data/episodes.js. Tanpa API key, tanpa jaringan.
// Pakai: node scripts/import-links.mjs --links "<alamat>" --anime <id AniList> [--start 1] [--apply]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const apiDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const episodesPath = resolve(apiDir, "../web/src/data/episodes.js");

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const apply = args.includes("--apply");
const animeId = Number.parseInt(opt("anime"), 10);
const start = Number.parseInt(opt("start") || "1", 10);
const credit = opt("credit") || "Ani-One Indonesia (kanal resmi)";
const input = opt("links") || "";

function extractIds(text) {
  const found = [];
  const m = /video_ids=([^&\s]+)/.exec(text);
  if (m) {
    found.push(...decodeURIComponent(m[1]).split(","));
  } else {
    for (const part of text.split(/[\s,]+/)) {
      const x = /(?:v=|youtu\.be\/|embed\/)([\w-]{11})/.exec(part) || /^([\w-]{11})$/.exec(part);
      if (x) found.push(x[1]);
    }
  }
  return [...new Set(found.filter((id) => /^[\w-]{11}$/.test(id)))];
}

const ids = extractIds(input);
if (!ids.length || !Number.isInteger(animeId) || animeId <= 0 || !Number.isInteger(start) || start < 1) {
  console.error('Pakai: node scripts/import-links.mjs --links "<alamat>" --anime <id AniList> [--start 1] [--apply]');
  process.exit(1);
}

console.log(`Terbaca ${ids.length} video untuk anime ${animeId}:\n`);
ids.forEach((id, i) => console.log(`  episode ${String(start + i).padStart(2)}  ->  ${id}`));

if (!apply) {
  console.log("\nIni hanya pratinjau. Pastikan jumlah dan urutannya sesuai panel playlist, lalu ulangi dengan --apply.");
  process.exit(0);
}

const text = readFileSync(episodesPath, "utf8");
if (text.includes(`"${animeId}:`)) {
  console.error(`Anime ${animeId} sudah ada di episodes.js. Tidak ada yang diubah.`);
  process.exit(1);
}
const m = text.match(/(export const videoSources = \{[\s\S]*?)(\n\};)/);
if (!m) {
  console.error("Blok videoSources tidak ditemukan. Tidak ada yang diubah.");
  process.exit(1);
}
let body = m[1].trimEnd();
if (!body.endsWith(",") && !body.endsWith("{")) body += ",";
const lines = ids
  .map((id, i) => `  "${animeId}:${start + i}": { type: "youtube", id: "${id}", credit: ${JSON.stringify(credit)} }`)
  .join(",\n");
const block = `\n  // AniList ${animeId}, diimpor dari daftar tautan\n${lines}`;
writeFileSync(episodesPath, text.slice(0, m.index) + body + block + m[2] + text.slice(m.index + m[0].length));
console.log(`\nSelesai: ${ids.length} episode ditulis untuk anime ${animeId}.`);
