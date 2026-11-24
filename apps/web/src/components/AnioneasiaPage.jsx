import { useState, useEffect, useMemo } from "react";
import { fetchAnioneasiaVideos, fetchAnioneasiaStats, parseAnioneasiaTitle } from "../services/anioneasiaApi";
import AnimeCard from "./AnimeCard";
import Icon from "./Icon";
import "./AnioneasiaPage.css";

const PAGE_SIZE = 24;

export default function AnioneasiaPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "", minViews: 0, sort: "newest" });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Load videos
  const loadVideos = async (pageNum, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      const params = {
        q: debouncedSearch,
        page: pageNum,
        limit: PAGE_SIZE,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        minViews: filters.minViews,
      };

      const { data, pagination } = await fetchAnioneasiaVideos(params);
      const parsed = data.map((v) => {
        const { title, episode } = parseAnioneasiaTitle(v.title);
        return {
          ...v,
          parsedTitle: title,
          parsedEpisode: episode,
          // Generate a stable ID for React keys
          anioneasiaId: v.videoId,
        };
      });

      if (append) {
        setVideos((prev) => [...prev, ...parsed]);
      } else {
        setVideos(parsed);
      }
      setTotal(pagination.total);
      setHasMore(pagination.page < pagination.totalPages);
      setPage(pagination.page);
    } catch (err) {
      setError("Gagal memuat video AniOneAsia. Coba lagi nanti.");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load stats
  useEffect(() => {
    fetchAnioneasiaStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  // Load on filter/search/page change
  useEffect(() => {
    loadVideos(1, false);
  }, [debouncedSearch, filters.dateFrom, filters.dateTo, filters.minViews]);

  const loadMore = () => loadVideos(page + 1, true);

  // Group by anime title for "series" view
  const groupedByTitle = useMemo(() => {
    const groups = new Map();
    videos.forEach((v) => {
      const key = v.parsedTitle.toLowerCase();
      if (!groups.has(key)) groups.set(key, { title: v.parsedTitle, episodes: [], totalViews: 0, latestDate: v.uploadDate });
      const g = groups.get(key);
      g.episodes.push(v);
      g.totalViews += v.viewCount || 0;
      if (v.uploadDate > g.latestDate) g.latestDate = v.uploadDate;
    });
    return Array.from(groups.values())
      .map((g) => ({ ...g, episodes: g.episodes.sort((a, b) => (a.parsedEpisode || 0) - (b.parsedEpisode || 0)) }))
      .sort((a, b) => b.latestDate.localeCompare(a.latestDate));
  }, [videos]);

  const formatNumber = (n) => {
    if (!n) return "0";
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n);
  };

  const formatDuration = (sec) => {
    if (!sec) return "-";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading && videos.length === 0) {
    return (
      <section className="anioneasia-page">
        <div className="anioneasia-skeleton">
          <div className="anioneasia-header-skeleton">
            <div className="skeleton-title" />
            <div className="skeleton-stats">
              <div className="skeleton-stat" /><div className="skeleton-stat" />
              <div className="skeleton-stat" /><div className="skeleton-stat" />
            </div>
          </div>
          <div className="anioneasia-grid-skeleton">
            {[...Array(PAGE_SIZE)].map((_, i) => <div key={i} className="anioneasia-card-skeleton" />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="anioneasia-page">
      <header className="anioneasia-header">
        <div className="anioneasia-header__title">
          <h1>AniOne Asia</h1>
          <p className="anioneasia-subtitle">Katalog video resmi channel YouTube AniOne Asia</p>
        </div>
        {stats && (
          <div className="anioneasia-stats" aria-label="Statistik channel">
            <div className="anioneasia-stat">
              <span className="anioneasia-stat__value">{formatNumber(stats.totalVideos)}</span>
              <span className="anioneasia-stat__label">Total Video</span>
            </div>
            <div className="anioneasia-stat">
              <span className="anioneasia-stat__value">{formatNumber(stats.totalViews)}</span>
              <span className="anioneasia-stat__label">Total Views</span>
            </div>
            <div className="anioneasia-stat">
              <span className="anioneasia-stat__value">{stats.avgDuration}</span>
              <span className="anioneasia-stat__label">Rata-rata Durasi</span>
            </div>
            <div className="anioneasia-stat">
              <span className="anioneasia-stat__value">{stats.newest ? new Date(stats.newest).getFullYear() : "-"}</span>
              <span className="anioneasia-stat__label">Terbaru</span>
            </div>
          </div>
        )}
      </header>

      <div className="anioneasia-toolbar">
        <div className="anioneasia-search">
          <Icon name="search" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul video... (contoh: Spy x Family, Episode 5)"
            aria-label="Cari video AniOneAsia"
          />
        </div>

        <div className="anioneasia-filters">
          <select
            value={filters.sort}
            onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
            aria-label="Urutkan"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="popular">Paling Dilihat</option>
            <option value="duration">Durasi Terpanjang</option>
          </select>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))}
            placeholder="Dari tanggal"
            aria-label="Dari tanggal"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))}
            placeholder="Sampai tanggal"
            aria-label="Sampai tanggal"
          />
          <input
            type="number"
            min="0"
            step="1000"
            value={filters.minViews}
            onChange={(e) => setFilters((p) => ({ ...p, minViews: Number(e.target.value) || 0 }))}
            placeholder="Min views"
            aria-label="Minimum views"
          />
        </div>
      </div>

      {error && <div className="anioneasia-error" role="alert">{error}</div>}

      <div className="anioneasia-content">
        {/* Grid view: individual videos */}
        <div className="anioneasia-grid" role="list" aria-label="Video AniOneAsia">
          {videos.map((video) => (
            <AnioneasiaCard key={video.anioneasiaId} video={video} formatNumber={formatNumber} formatDuration={formatDuration} />
          ))}
        </div>

        {!loading && videos.length === 0 && (
          <div className="anioneasia-empty" role="status">
            <Icon name="video-off" size={48} />
            <h3>Tidak ada video ditemukan</h3>
            <p>Coba ubah pencarian atau filter.</p>
          </div>
        )}

        {hasMore && !loading && !loadingMore && (
          <div className="anioneasia-loadmore">
            <button type="button" className="anioneasia-loadmore-btn" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Memuat..." : `Muat lebih banyak (${videos.length} / ${total})`}
            </button>
          </div>
        )}

        {total > 0 && !hasMore && (
          <p className="anioneasia-end">— Semua {total} video sudah dimuat —</p>
        )}
      </div>
    </section>
  );
}

function AnioneasiaCard({ video, formatNumber, formatDuration }) {
  const thumbnail = `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

  return (
    <article className="anioneasia-card" role="listitem">
      <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="anioneasia-card__link" aria-label={video.title}>
        <div className="anioneasia-card__thumb">
          <img src={thumbnail} alt="" loading="lazy" width="480" height="270" />
          <span className="anioneasia-card__duration">{formatDuration(video.durationSec)}</span>
          {video.parsedEpisode && (
            <span className="anioneasia-card__episode">Ep {video.parsedEpisode}</span>
          )}
        </div>
        <div className="anioneasia-card__info">
          <h3 className="anioneasia-card__title">{video.parsedTitle || video.title}</h3>
          <div className="anioneasia-card__meta">
            <span className="anioneasia-card__views">
              <Icon name="eye" size={12} /> {formatNumber(video.viewCount)}
            </span>
            <time className="anioneasia-card__date" dateTime={video.uploadDate}>
              {video.uploadDate ? new Date(video.uploadDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
            </time>
          </div>
        </div>
      </a>
    </article>
  );
}