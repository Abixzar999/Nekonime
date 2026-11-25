#!/usr/bin/env python3
import os, requests, sqlite3, pandas as pd, streamlit as st
from pathlib import Path

ANIONEASIA_DB = Path("anioneasia.db")
ANIONEASIA_RELEASE_URL = "https://github.com/Abixzar999/Nekonime/releases/download/db-latest/anioneasia.db"
MUSEINDO_DB = Path("museindo.db")
MUSEINDO_RELEASE_URL = "https://github.com/Abixzar999/Nekonime/releases/download/db-latest/museindo.db"

# Auto-download DBs dari GitHub Release kalau tidak ada
def download_db(db_path, release_url, label):
    if not db_path.exists():
        with st.spinner(f"Downloading {label} database from GitHub Release..."):
            resp = requests.get(release_url, timeout=60)
            if resp.status_code == 200:
                db_path.write_bytes(resp.content)
                st.success(f"{label} database downloaded!")
            else:
                st.error(f"Failed to download {label} DB: {resp.status_code}")
                return False
    return True

st.set_page_config(page_title="Anime Channel Video Index", layout="wide")
st.title("📺 Anime Channel Video Metadata (Legal Sources)")

# Sidebar: Channel selector
channel = st.sidebar.radio("Channel", ["AniOneAsia", "Muse Indonesia (Sub Indo)"])

if channel == "AniOneAsia":
    DB_PATH = ANIONEASIA_DB
    RELEASE_URL = ANIONEASIA_RELEASE_URL
    label = "AniOneAsia"
else:
    DB_PATH = MUSEINDO_DB
    RELEASE_URL = MUSEINDO_RELEASE_URL
    label = "Muse Indonesia"

if not download_db(DB_PATH, RELEASE_URL, label):
    st.stop()

@st.cache_data(ttl=300)
def load_data(db_path):
    if not db_path.exists():
        return pd.DataFrame()
    con = sqlite3.connect(db_path)
    df = pd.read_sql("""
        SELECT video_id, title, url, upload_date, duration_sec, view_count,
               description, fetched_at
        FROM videos
        ORDER BY upload_date DESC
    """, con)
    con.close()
    df["upload_date"] = pd.to_datetime(df["upload_date"], format="%Y%m%d", errors="coerce")
    df["duration_hms"] = pd.to_timedelta(df["duration_sec"], unit="s").astype(str)
    return df

df = load_data(DB_PATH)

if df.empty:
    st.warning("Database belum ada.")
    st.stop()

with st.sidebar:
    st.header("🔍 Filter")
    q = st.text_input("Cari judul (contains)", "")
    date_from = st.date_input("Dari tanggal", value=None)
    date_to = st.date_input("Sampai tanggal", value=None)
    min_views = st.number_input("Min views", min_value=0, value=0, step=1000)
    limit = st.slider("Limit rows", 10, 5000, 200)

mask = pd.Series(True, index=df.index)
if q:
    mask &= df["title"].str.contains(q, case=False, na=False)
if date_from:
    mask &= df["upload_date"] >= pd.Timestamp(date_from)
if date_to:
    mask &= df["upload_date"] <= pd.Timestamp(date_to)
if min_views:
    mask &= df["view_count"] >= min_views

filtered = df[mask].head(limit)

c1, c2, c3, c4 = st.columns(4)
c1.metric(f"Total video ({label})", f"{len(df):,}")
c2.metric("Filtered", f"{len(filtered):,}")
c3.metric("Total views (filtered)", f"{filtered['view_count'].sum():,}")
c4.metric("Avg duration", str(pd.to_timedelta(filtered["duration_sec"].mean(), unit="s")))

st.dataframe(
    filtered[["upload_date", "title", "duration_hms", "view_count", "url"]].rename(columns={
        "upload_date": "Tanggal", "title": "Judul", "duration_hms": "Durasi",
        "view_count": "Views", "url": "Link"
    }),
    column_config={
        "Link": st.column_config.LinkColumn("Link", display_text="🔗 Buka"),
        "Tanggal": st.column_config.DateColumn("Tanggal", format="DD MMM YYYY"),
    },
    hide_index=True, width='stretch', height=600,
)

col1, col2 = st.columns(2)
col1.download_button(f"⬇️ Download {label} CSV", filtered.to_csv(index=False).encode("utf-8"),
                     file_name=f"{label.lower().replace(' ', '_')}_filtered.csv", mime="text/csv")
col2.download_button(f"⬇️ Download {label} JSON", filtered.to_json(orient="records", force_ascii=False, date_format="iso").encode("utf-8"),
                     file_name=f"{label.lower().replace(' ', '_')}_filtered.json", mime="application/json")

st.caption(f"Data di-fetch: {df['fetched_at'].max()} | Total {len(df):,} video | Source: {label} (Legal)")
