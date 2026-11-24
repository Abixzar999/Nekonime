#!/usr/bin/env python3
"""
Fetch AniOneAsia video metadata → SQLite (dedup, incremental).
Two modes:
  1. Fast: --flat-playlist only (basic fields, no upload_date)
  2. Full: fetch detail per video (slow, complete metadata)
"""
import json
import subprocess
import sys
import sqlite3
import shutil
import time
from pathlib import Path
from datetime import datetime

DB_PATH = Path("anioneasia.db")
CHANNEL_URL = "https://www.youtube.com/AniOneAsia/videos"

# Set True untuk full metadata (lambat), False untuk flat-playlist saja (cepat)
FULL_METADATA = False

def init_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("""
        CREATE TABLE IF NOT EXISTS videos (
            video_id      TEXT PRIMARY KEY,
            title         TEXT NOT NULL,
            url           TEXT NOT NULL,
            upload_date   TEXT,           -- YYYYMMDD
            duration_sec  INTEGER,
            view_count    INTEGER,
            description   TEXT,
            fetched_at    TEXT DEFAULT (datetime('now'))
        )
    """)
    con.execute("CREATE INDEX IF NOT EXISTS idx_upload ON videos(upload_date DESC)")
    con.commit()
    return con

def fetch_flat_playlist():
    """Ambil daftar video ID + basic info (cepat)"""
    cmd = [
        "yt-dlp",
        "--flat-playlist",
        "--print-json",
        "--no-warnings",
        CHANNEL_URL,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return [json.loads(line) for line in proc.stdout.strip().splitlines()]

def fetch_video_detail(video_id):
    """Ambil metadata lengkap satu video (lambat)"""
    cmd = [
        "yt-dlp",
        "--print-json",
        "--no-warnings",
        "--skip-download",
        f"https://www.youtube.com/watch?v={video_id}",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return json.loads(proc.stdout.strip())

def upsert_videos(con, items):
    sql = """
        INSERT INTO videos (video_id, title, url, upload_date, duration_sec, view_count, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(video_id) DO UPDATE SET
            title=excluded.title,
            url=excluded.url,
            upload_date=excluded.upload_date,
            duration_sec=excluded.duration_sec,
            view_count=excluded.view_count,
            description=excluded.description,
            fetched_at=datetime('now')
    """
    rows = []
    for v in items:
        # upload_date dari timestamp (Unix) → YYYYMMDD
        # Flat playlist pakai 'epoch', full metadata pakai 'timestamp'
        upload_date = None
        ts = v.get("timestamp") or v.get("epoch")
        if ts:
            upload_date = datetime.fromtimestamp(ts).strftime("%Y%m%d")
        
        rows.append((
            v.get("id"),
            v.get("title"),
            v.get("webpage_url") or f"https://youtu.be/{v.get('id')}",
            upload_date,
            v.get("duration"),
            v.get("view_count"),
            v.get("description"),
        ))
    con.executemany(sql, rows)
    con.commit()
    return len(rows)

def main():
    if not shutil.which("yt-dlp"):
        sys.exit("yt-dlp not found. Install: pip install yt-dlp")

    print(f"[{datetime.now()}] Mode: {'FULL' if FULL_METADATA else 'FLAT'} | Fetching {CHANNEL_URL} …")
    
    # Step 1: Dapatkan daftar video ID (flat playlist)
    flat_items = fetch_flat_playlist()
    print(f"  Found {len(flat_items)} videos in playlist")

    con = init_db()

    if FULL_METADATA:
        # Step 2: Fetch detail per video (dengan delay biar aman)
        print(f"  Fetching full metadata for each video…")
        detailed_items = []
        for i, item in enumerate(flat_items, 1):
            vid = item.get("id")
            if not vid:
                continue
            try:
                detail = fetch_video_detail(vid)
                detailed_items.append(detail)
                if i % 50 == 0:
                    print(f"    {i}/{len(flat_items)} done")
                time.sleep(0.3)  # delay 300ms biar nggak kena rate limit
            except subprocess.CalledProcessError as e:
                print(f"    Warning: failed to fetch {vid}: {e}")
                # Fallback ke flat data
                detailed_items.append(item)
        
        n = upsert_videos(con, detailed_items)
        print(f"  Upserted {n} rows with full metadata")
    else:
        # Hanya flat playlist data
        n = upsert_videos(con, flat_items)
        print(f"  Upserted {n} rows (flat playlist only)")

    # Quick stats
    cur = con.execute("SELECT COUNT(*), MIN(upload_date), MAX(upload_date) FROM videos")
    total, oldest, newest = cur.fetchone()
    print(f"  Total in DB: {total} | Range: {oldest} → {newest}")

if __name__ == "__main__":
    main()