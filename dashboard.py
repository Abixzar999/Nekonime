#!/usr/bin/env python3
"""
Streamlit dashboard untuk anioneasia.db
Jalankan: streamlit run dashboard.py
"""
import sqlite3
import pandas as pd
import streamlit as st
from pathlib import Path

DB_PATH = Path("anioneasia.db")

st.set_page_config(page_title="AniOneAsia Video Index", layout="wide")
st.title("📺 AniOneAsia Video Metadata")

@st.cache_data(ttl=300)
def load_data():
    if not DB_PATH.exists():
        return pd.DataFrame()
    con = sqlite3.connect(DB_PATH)
    df = pd.read_sql("""
        SELECT video_id, title, url, upload_date, duration_sec, view_count,
               description, fetched_at
        FROM videos
        ORDER BY upload_date DESC
    """, con)
    con.close()
    # Format tanggal
    df["upload_date"] = pd.to_datetime(df["upload_date"], format="%Y%m%d", errors="coerce")
    df["duration_hms"] = pd.to_timedelta(df["duration_sec"], unit="s").astype(str)
    return df

df = load_data()

if df.empty:
    st.warning("Database belum ada. Jalankan `python fetch_anioneasia.py` dulu.")
    st.stop()

# Sidebar filters
with st.sidebar:
    st.header("🔍 Filter")
    q = st.text_input("Cari judul (contains)", "")
    date_from = st.date_input("Dari tanggal", value=None)
    date_to = st.date_input("Sampai tanggal", value=None)
    min_views = st.number_input("Min views", min_value=0, value=0, step=1000)
    limit = st.slider("Limit rows", 10, 5000, 200)

# Apply filters
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

# Stats
c1, c2, c3, c4 = st.columns(4)
c1.metric("Total video (DB)", f"{len(df):,}")
c2.metric("Filtered", f"{len(filtered):,}")
c3.metric("Total views (filtered)", f"{filtered['view_count'].sum():,}")
c4.metric("Avg duration", str(pd.to_timedelta(filtered["duration_sec"].mean(), unit="s")))

# Table
st.dataframe(
    filtered[[
        "upload_date", "title", "duration_hms", "view_count", "url"
    ]].rename(columns={
        "upload_date": "Tanggal",
        "title": "Judul",
        "duration_hms": "Durasi",
        "view_count": "Views",
        "url": "Link"
    }),
    column_config={
        "Link": st.column_config.LinkColumn("Link", display_text="🔗 Buka"),
        "Tanggal": st.column_config.DateColumn("Tanggal", format="DD MMM YYYY"),
    },
    hide_index=True,
    use_container_width=True,
    height=600,
)

# Export buttons
col1, col2 = st.columns(2)
col1.download_button(
    "⬇️ Download CSV (filtered)",
    filtered.to_csv(index=False).encode("utf-8"),
    file_name="anioneasia_filtered.csv",
    mime="text/csv",
)
col2.download_button(
    "⬇️ Download JSON (filtered)",
    filtered.to_json(orient="records", force_ascii=False).encode("utf-8"),
    file_name="anioneasia_filtered.json",
    mime="application/json",
)

st.caption(f"Data di-fetch: {df['fetched_at'].max()} | Total {len(df):,} video")