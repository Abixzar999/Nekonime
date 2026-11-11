import express from "express";
import cors from "cors";

const PORT = process.env.PORT || 3001;
const JIKAN_URL = "https://api.jikan.moe/v4";
const CACHE_TTL_MS = 10 * 60 * 1000; // cache 10 menit
const TIMEOUT_MS = 8000;

const cache = new Map();

// Panggil Jikan, simpan hasilnya di cache.
async function fromJikan(path) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.time < CACHE_TTL_MS) return hit.data;

  const res = await fetch(`${JIKAN_URL}${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`Jikan membalas status ${res.status}`);

  const data = await res.json();
  cache.set(path, { data, time: Date.now() });
  return data;
}

const app = express();
// Hanya izinkan aplikasi web di localhost (ubah saat deploy).
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/] }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, cached: cache.size });
});

app.get("/api/top", async (req, res) => {
  try {
    res.json(await fromJikan("/top/anime?limit=12&sfw=true"));
  } catch (err) {
    res.status(502).json({ error: "Gagal menghubungi Jikan", detail: err.message });
  }
});

app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 100);
  if (!q) return res.status(400).json({ error: "Parameter q wajib diisi" });
  try {
    res.json(await fromJikan(`/anime?q=${encodeURIComponent(q)}&limit=12&sfw=true`));
  } catch (err) {
    res.status(502).json({ error: "Gagal menghubungi Jikan", detail: err.message });
  }
});

app.listen(PORT, () => console.log(`NEKONIME API di http://localhost:${PORT}`));
