import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path ke anioneasia.db (di root project, 2 level naik dari apps/api)
const DB_PATH = join(__dirname, "..", "..", "anioneasia.db");

let db;
try {
  db = new Database(DB_PATH, { readonly: true });
  // Test koneksi
  db.prepare("SELECT 1 FROM videos LIMIT 1").get();
  console.log("[AniOneAsia] DB connected:", DB_PATH);
} catch (err) {
  console.warn("[AniOneAsia] DB not found or error:", err.message);
  db = null;
}

function parseDate(yyyymmdd) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return null;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`;
}

export function listAnioneasiaVideos({ q = "", page = 1, limit = 20, dateFrom, dateTo, minViews = 0 } = {}) {
  if (!db) return { data: [], total: 0, page, limit, error: "Database not available" };

  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (q) {
    conditions.push("title LIKE ?");
    params.push(`%${q}%`);
  }
  if (dateFrom) {
    conditions.push("upload_date >= ?");
    params.push(dateFrom.replace(/-/g, ""));
  }
  if (dateTo) {
    conditions.push("upload_date <= ?");
    params.push(dateTo.replace(/-/g, ""));
  }
  if (minViews > 0) {
    conditions.push("view_count >= ?");
    params.push(minViews);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // Total count
  const total = db.prepare(`SELECT COUNT(*) as count FROM videos ${whereClause}`).get(...params).count;

  // Data
  const rows = db.prepare(`
    SELECT video_id, title, url, upload_date, duration_sec, view_count, description
    FROM videos
    ${whereClause}
    ORDER BY upload_date DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const data = rows.map((r) => ({
    videoId: r.video_id,
    title: r.title,
    url: r.url,
    uploadDate: parseDate(r.upload_date),
    duration: formatDuration(r.duration_sec),
    durationSec: r.duration_sec,
    viewCount: r.view_count,
    description: r.description,
  }));

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function getAnioneasiaVideo(videoId) {
  if (!db) return { data: null, error: "Database not available" };
  const row = db.prepare("SELECT * FROM videos WHERE video_id = ?").get(videoId);
  if (!row) return { data: null, error: "Not found" };
  return {
    data: {
      videoId: row.video_id,
      title: row.title,
      url: row.url,
      uploadDate: parseDate(row.upload_date),
      duration: formatDuration(row.duration_sec),
      durationSec: row.duration_sec,
      viewCount: row.view_count,
      description: row.description,
      fetchedAt: row.fetched_at,
    },
  };
}

export function getAnioneasiaStats() {
  if (!db) return { error: "Database not available" };
  const row = db.prepare(`
    SELECT 
      COUNT(*) as totalVideos,
      SUM(view_count) as totalViews,
      AVG(duration_sec) as avgDurationSec,
      MIN(upload_date) as oldest,
      MAX(upload_date) as newest
    FROM videos
  `).get();
  return {
    totalVideos: row.totalVideos,
    totalViews: row.totalViews,
    avgDuration: formatDuration(Math.round(row.avgDurationSec || 0)),
    oldest: parseDate(row.oldest),
    newest: parseDate(row.newest),
  };
}