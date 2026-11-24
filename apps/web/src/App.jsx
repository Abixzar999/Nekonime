import { useEffect, useState } from "react";
import { loadJSON, saveJSON } from "./utils/storage";
import { keepProgress, resumePoint } from "./utils/progress";
import {
  clampEpisode,
  findAnimeIn,
  normalizeFavorites,
  normalizeHistory
} from "./utils/animeState";
import AnimeCard from "./components/AnimeCard";
import CatalogNotice from "./components/CatalogNotice";
import VideoPlayer from "./components/VideoPlayer";
import HistoryRow from "./components/HistoryRow";
import Navbar from "./components/Navbar";
import Backdrop from "./components/Backdrop";
import EmptyPanel from "./components/EmptyPanel";
import Intro from "./components/Intro";
import Footer from "./components/Footer";
import HeroCarousel from "./components/HeroCarousel";
import SideAnimeCard from "./components/SideAnimeCard";
import Icon from "./components/Icon";
import OfficialLinks from "./components/OfficialLinks";
import SeasonPicker from "./components/SeasonPicker";
import AnimeFacts from "./components/AnimeFacts";
import { useSeasonAnime } from "./hooks/useSeasonAnime";
import { getSeries } from "./data/series";
import { getSourceStatus, getVideoSource, hasPlayableSource, playableAnimeIds } from "./data/episodes";
import { getAnimeByIds, getTopAnime } from "./services/animeApi";
import { useAnimeCatalog } from "./hooks/useAnimeCatalog";
import { getEpisodeStreams } from "./services/animeApi";

function App() {
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [catalogFilters, setCatalogFilters] = useState({ genre: "", year: "", status: "", sort: "popular" });
  const [discovery, setDiscovery] = useState({ popularAnime: [], latestAnime: [], popularDonghua: [], loading: false, error: false });
  const { items, loading, loadingMore, error, hasMore, loadMore } = useAnimeCatalog(search, activePage, catalogFilters);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const seasonAnime = useSeasonAnime(selectedAnime);

  const [pinnedAnime, setPinnedAnime] = useState([]);
  const [watchableItems, setWatchableItems] = useState([]);
  const [watchableLoading, setWatchableLoading] = useState(false);

  useEffect(() => {
    if (activePage !== "home") return undefined;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDiscovery((p) => ({ ...p, loading: true }));
    Promise.allSettled([
      getTopAnime("anime", 1, { sort: "popular" }),
      getTopAnime("anime", 1, { sort: "latest" }),
      getTopAnime("donghua", 1, { sort: "popular" })
    ]).then(([pa, la, pd]) => {
      if (cancelled) return;
      const popularAnime = pa.status === "fulfilled" ? (pa.value || []).slice(0, 12) : [];
      const latestAnime = la.status === "fulfilled" ? (la.value || []).slice(0, 8) : [];
      const popularDonghua = pd.status === "fulfilled" ? (pd.value || []).slice(0, 8) : [];
      const allFailed = pa.status === "rejected" && la.status === "rejected" && pd.status === "rejected";
      setDiscovery({
        popularAnime,
        latestAnime,
        popularDonghua,
        loading: false,
        error: allFailed
      });
    });
    return () => { cancelled = true; };
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "watchable") return undefined;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWatchableLoading(true);
    getAnimeByIds(playableAnimeIds)
      .then((items) => {
        if (cancelled) return;
        setWatchableItems(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (cancelled) return;
        setWatchableItems([]);
      })
      .finally(() => {
        if (!cancelled) setWatchableLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activePage]);
  const [favorites, setFavorites] = useState(() =>
    normalizeFavorites(loadJSON("nekonime-favorites", []))
  );
  const [watchHistory, setWatchHistory] = useState(() =>
    normalizeHistory(loadJSON("nekonime-history", []))
  );
  // Progress per episode: kunci "<animeId>:<episode>" -> { position, duration }.
  // Disimpan terpisah agar progress setiap episode tidak saling menimpa.
  const [progressMap, setProgressMap] = useState(() =>
    loadJSON("nekonime-progress", {})
  );

  const isFavorite = (animeId) =>
    favorites.some((item) => item.id === animeId);

  const toggleFavorite = (anime) => {
    setFavorites((previous) => {
      const updated = previous.some((item) => item.id === anime.id)
        ? previous.filter((item) => item.id !== anime.id)
        : [...previous, anime];

      saveJSON("nekonime-favorites", updated);
      return updated;
    });
  };

  // Anime yang sedang dipilih (undefined jika belum ada yang dipilih).
  // Favorit dan riwayat ikut dicari agar tidak berakhir di halaman kosong.
  const findAnime = (id) =>
    findAnimeIn(id, { items, seasonAnime, pinnedAnime, favorites, watchHistory });
  const selectedAnimeData = findAnime(selectedAnime);
  const totalEpisodes =
    Number.isInteger(selectedAnimeData?.totalEpisodes) && selectedAnimeData.totalEpisodes > 0
      ? selectedAnimeData.totalEpisodes
      : null;
  const currentEpisode = clampEpisode(selectedEpisode, totalEpisodes);

  // Sumber streaming dari provider legal. Jika API mati/lambat/404,
  // fallback ke sumber lokal agar YouTube resmi tetap berfungsi.
  const [remoteStreams, setRemoteStreams] = useState({ key: "", sources: [] });
  const streamKey =
    isWatching && selectedAnimeData ? `${selectedAnimeData.id}:${currentEpisode}` : "";
  const sourceStatus =
    isWatching && selectedAnimeData
      ? getSourceStatus(selectedAnimeData.id, currentEpisode)
      : "none";
  const localStream =
    isWatching && selectedAnimeData
      ? getVideoSource(selectedAnimeData.id, currentEpisode)
      : null;
  const fallbackStreams = localStream
    ? [{ ...localStream, provider: "local", title: `Episode ${currentEpisode}` }]
    : [];
  const streamSources =
    sourceStatus === "unverified"
      ? []
      : remoteStreams.key === streamKey
        ? remoteStreams.sources
        : fallbackStreams;

  useEffect(() => {
    if (!isWatching || !selectedAnimeData?.id) return undefined;
    // Entri yang belum terverifikasi tidak perlu ditanyakan ke backend.
    if (getSourceStatus(selectedAnimeData.id, currentEpisode) === "unverified") {
      return undefined;
    }

    const animeId = selectedAnimeData.id;
    const controller = new AbortController();
    let cancelled = false;

    getEpisodeStreams(animeId, currentEpisode, {
      title: selectedAnimeData.title,
      signal: controller.signal,
    })
      .then((sources) => {
        if (cancelled || !Array.isArray(sources) || sources.length === 0) return;
        setRemoteStreams({ key: `${animeId}:${currentEpisode}`, sources });
      })
      .catch(() => {
        // API tidak tersedia: fallback lokal tetap dipakai.
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isWatching, selectedAnimeData?.id, selectedAnimeData?.title, currentEpisode]);

  // Posisi terakhir untuk episode yang sama, dipakai untuk melanjutkan video.
  const historyEntry = selectedAnimeData
    ? watchHistory.find(
        (entry) =>
          entry.animeId === selectedAnimeData.id && entry.episode === currentEpisode
      )
    : null;
  const progressKey = selectedAnimeData ? `${selectedAnimeData.id}:${currentEpisode}` : null;
  const savedProgress = progressKey ? progressMap[progressKey] : null;
  const startAt = resumePoint(savedProgress || historyEntry);


  const visibleAnime = (activePage === "favorites"
    ? favorites
    : activePage === "watchable"
      ? watchableItems
      : items).filter((anime) => {
    const matchesPage =
      activePage === "home" ||
      (activePage === "anime" && anime.category === "anime") ||
      (activePage === "donghua" && anime.category === "donghua") ||
      activePage === "favorites" ||
      (activePage === "watchable" && hasPlayableSource(anime.id));

    return matchesPage;
  });

  // Catat anime + episode ke riwayat, termasuk snapshot anime agar favorit/riwayat
  // tetap bisa dibuka walau tidak ada di halaman katalog yang sedang aktif.
  const recordHistory = (anime, episode) => {
    if (!anime?.id) return;

    setWatchHistory((previous) => {
      const updated = [
        {
          animeId: anime.id,
          episode,
          title: anime.title,
          poster: anime.poster,
          anime,
          ...keepProgress(previous, anime.id, episode)
        },
        ...previous.filter((item) => item.animeId !== anime.id).slice(0, 19)
      ];
      saveJSON("nekonime-history", updated);
      return updated;
    });
  };

  // Simpan posisi video berkala agar "Lanjutkan Menonton" bekerja.
  const saveProgress = (position, duration) => {
    if (!selectedAnimeData?.id || !Number.isFinite(duration) || duration <= 0) return;
    if (!Number.isFinite(position) || position < 0) return;

    // Progress per episode disimpan terpisah agar tidak saling menimpa.
    const key = `${selectedAnimeData.id}:${currentEpisode}`;
    setProgressMap((previous) => {
      const updated = { ...previous, [key]: { position, duration } };
      saveJSON("nekonime-progress", updated);
      return updated;
    });

    setWatchHistory((previous) => {
      const index = previous.findIndex(
        (entry) =>
          entry.animeId === selectedAnimeData.id && entry.episode === currentEpisode
      );
      if (index === -1) return previous;

      const updated = previous.map((entry, i) =>
        i === index ? { ...entry, position, duration } : entry
      );
      saveJSON("nekonime-history", updated);
      return updated;
    });
  };

  // Buka detail anime baru: episode selalu kembali ke 1.
  const selectAnime = (animeOrId) => {
    const animeId = typeof animeOrId === "object" && animeOrId !== null ? animeOrId.id : animeOrId;
    const anime = (typeof animeOrId === "object" && animeOrId !== null) ? animeOrId : (findAnime(animeId) || items.find((a) => a.id === animeId));
    if (anime && !pinnedAnime.some((item) => item.id === animeId)) {
      setPinnedAnime((previous) => [...previous, anime]);
    }
    setSelectedAnime(animeId);
    setSelectedEpisode(1);
    setIsWatching(false);
  };

  // Mulai menonton episode tertentu (dipakai tombol Tonton, Riwayat, dan daftar episode).
  // Menerima ID maupun objek anime, supaya highlight beranda bisa langsung diputar.
  const watchEpisode = (animeOrId, episode) => {
    const anime =
      typeof animeOrId === "object" && animeOrId !== null ? animeOrId : findAnime(animeOrId);
    const animeId = anime?.id ?? animeOrId;
    const nextEpisode = clampEpisode(
      episode,
      Number.isInteger(anime?.totalEpisodes) && anime.totalEpisodes > 0
        ? anime.totalEpisodes
        : null
    );

    setSelectedAnime(animeId);
    setSelectedEpisode(nextEpisode);
    setIsWatching(true);
    recordHistory(anime, nextEpisode);
  };

  // Tonton langsung dari highlight beranda: simpan objeknya agar halaman detail tersedia.
  const watchFromHero = (anime) => {
    if (!anime?.id) return;
    setPinnedAnime((previous) =>
      previous.some((item) => item.id === anime.id) ? previous : [...previous, anime]
    );
    watchEpisode(anime, 1);
  };

  // Pindah season: di halaman menonton mulai dari episode 1, di halaman detail cukup ganti pilihan
  const changeSeason = (id) => {
    if (isWatching) watchEpisode(id, 1);
    else selectAnime(id);
  };

  // Buka detail anime yang dipilih dari saran pencarian (judulnya mungkin belum ada di katalog)
  const openFromSearch = (anime) => {
    setPinnedAnime((previous) =>
      previous.some((item) => item.id === anime.id) ? previous : [...previous, anime]
    );
    setSearch("");
    selectAnime(anime.id);
  };

  // Hapus satu anime dari riwayat.
  const removeHistoryItem = (animeId) => {
    setWatchHistory((previous) => {
      const updated = previous.filter((item) => item.animeId !== animeId);
      saveJSON("nekonime-history", updated);
      return updated;
    });
  };

  // Hapus semua riwayat tontonan.
  const clearHistory = () => {
    setWatchHistory([]);
    saveJSON("nekonime-history", []);
  };

  // Ganti episode saat sedang menonton
  const changeEpisode = (episode) => {
    const nextEpisode = clampEpisode(episode, totalEpisodes);
    setSelectedEpisode(nextEpisode);
    recordHistory(selectedAnimeData, nextEpisode);
  };

  return (
    <div className="app">
      <Backdrop />
      <Intro />
      {!isWatching && !selectedAnime && (
        <>
          <Navbar
            activePage={activePage}
            onNavigate={setActivePage}
            search={search}
            onSearchChange={setSearch}
            onPickSuggestion={openFromSearch}
          />

          <main>
            {activePage === "home" && (
              <>
                <HeroCarousel
                  items={discovery.popularAnime}
                  loading={discovery.loading}
                  onSelect={selectAnime}
                  onWatch={watchFromHero}
                  isPlayable={hasPlayableSource}
                />

                {/* Histori tetap jadi bagian utama beranda: akses cepat ke episode terakhir. */}
                {watchHistory.length > 0 && (
                  <div className="home-history">
                    <HistoryRow
                      history={watchHistory}
                      onWatch={watchEpisode}
                      onRemove={removeHistoryItem}
                      onClear={clearHistory}
                    />
                  </div>
                )}

                <section className="home-bento">
                  {discovery.error && (
                    <p className="discovery-error" role="alert">Gagal memuat rekomendasi. Coba muat ulang halaman.</p>
                  )}

                  <div className="home-bento__main">
                    <DiscoveryGrid
                      title="Anime Populer"
                      eyebrow="TRENDING"
                      items={discovery.popularAnime}
                      onSeeAll={() => { setCatalogFilters((p) => ({ ...p, sort: "popular" })); setActivePage("anime"); }}
                      onSelect={selectAnime}
                      isFavorite={isFavorite}
                      toggleFavorite={toggleFavorite}
                    />
                  </div>

                  <aside className="home-bento__side" aria-label="Pilihan lainnya">
                    <DiscoveryList
                      title="Anime Terbaru"
                      eyebrow="BARU TAYANG"
                      items={discovery.latestAnime}
                      onSeeAll={() => { setCatalogFilters((p) => ({ ...p, sort: "latest" })); setActivePage("anime"); }}
                      onSelect={selectAnime}
                      isFavorite={isFavorite}
                      toggleFavorite={toggleFavorite}
                    />
                    <DiscoveryList
                      title="Donghua Populer"
                      eyebrow="DONGHUA"
                      items={discovery.popularDonghua}
                      onSeeAll={() => { setCatalogFilters((p) => ({ ...p, sort: "popular" })); setActivePage("donghua"); }}
                      onSelect={selectAnime}
                      isFavorite={isFavorite}
                      toggleFavorite={toggleFavorite}
                    />
                  </aside>

                  <div className="bento-block bento-block--wide bento-genres">
                    <div className="bento-head">
                      <div className="bento-head__title">
                        <p className="eyebrow">JELAJAHI</p>
                        <h2>Berdasarkan Genre</h2>
                      </div>
                    </div>
                    <div className="bento-genre-chips">
                      {["Action","Adventure","Comedy","Drama","Fantasy","Romance","Sci-Fi"].map((g) => (
                        <button key={g} type="button" onClick={() => { setCatalogFilters((p) => ({ ...p, genre: g })); setActivePage("anime"); }}>{g}</button>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}

            {activePage !== "home" && (
            <section className="catalog">
              <p className="eyebrow">
                {activePage === "favorites" ? "YOUR COLLECTION" : "DISCOVER"}
              </p>
              <h2>
                {activePage === "favorites"
                  ? "Daftar Saya"
                  : activePage === "anime"
                    ? "Koleksi Anime"
                    : activePage === "donghua"
                      ? "Koleksi Donghua"
                      : activePage === "watchable" ? "Bisa Ditonton" : "Jelajahi Anime"}
              </h2>
              <p>
                {activePage === "favorites"
                  ? "Anime yang sudah kamu simpan."
                  : activePage === "anime"
                    ? "Temukan berbagai cerita anime favoritmu."
                    : activePage === "donghua"
                      ? "Jelajahi koleksi animasi dari Tiongkok."
                      : "Koleksi cerita menarik menantimu."}
              </p>

              <CatalogNotice loading={activePage === "watchable" ? watchableLoading : loading} error={activePage === "watchable" ? null : error} />

              {activePage !== "watchable" && activePage !== "favorites" && (
                <div className="catalog-filters">
                  <select value={catalogFilters.genre} onChange={(e) => setCatalogFilters((p) => ({ ...p, genre: e.target.value }))} aria-label="Filter genre">
                    <option value="">Semua genre</option>
                    <option value="Action">Action</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Drama">Drama</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Romance">Romance</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                  </select>
                  <select value={catalogFilters.year} onChange={(e) => setCatalogFilters((p) => ({ ...p, year: e.target.value }))} aria-label="Filter tahun">
                    <option value="">Semua tahun</option>
                    {[2026,2025,2024,2023,2022,2021,2020].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <select value={catalogFilters.status} onChange={(e) => setCatalogFilters((p) => ({ ...p, status: e.target.value }))} aria-label="Filter status">
                    <option value="">Semua status</option>
                    <option value="FINISHED">Selesai</option>
                    <option value="RELEASING">Tayang</option>
                    <option value="NOT_YET_RELEASED">Belum tayang</option>
                  </select>
                  <select value={catalogFilters.sort} onChange={(e) => setCatalogFilters((p) => ({ ...p, sort: e.target.value }))} aria-label="Urutkan">
                    <option value="popular">Populer</option>
                    <option value="latest">Terbaru</option>
                  </select>
                </div>
              )}
              

              <div className="anime-grid">
                {visibleAnime.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    isFavorite={isFavorite(anime.id)}
                     playable={hasPlayableSource(anime.id)}
                    onSelect={(anime) => selectAnime(anime)}
                    onToggleFavorite={() => toggleFavorite(anime)}
                  />
                ))}
              </div>

              {activePage !== "favorites" && hasMore && !loading && (
                <div className="load-more">
                  <button
                    type="button"
                    className="load-more-btn"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Memuat..." : "Muat lebih banyak"}
                  </button>
                </div>
              )}

              {!loading && !error && visibleAnime.length === 0 && (
                <EmptyPanel
                  variant={activePage === "favorites" && favorites.length === 0 ? "favorites" : "search"}
                  query={search.trim()}
                  onAction={() => {
                    if (activePage === "favorites" && favorites.length === 0) {
                      setActivePage("home");
                    }
                    setSearch("");
                  }}
                />
              )}
            </section>
            )}
          </main>
        </>
      )}

      {isWatching && selectedAnimeData ? (
        <section className="video-page">
          <button onClick={() => setIsWatching(false)}>
            <Icon name="arrow-left" size={16} /> Kembali ke Detail
          </button>

          <h2>{selectedAnimeData.title}</h2>
          <p>Episode {currentEpisode}</p>
          <SeasonPicker
            seasons={getSeries(selectedAnimeData.id)?.seasons}
            currentId={selectedAnimeData.id}
            isAvailable={(id) => Boolean(findAnime(id))}
            onSelect={changeSeason}
          />

          <div className="episode-navigation">
            <button
              disabled={currentEpisode <= 1}
              onClick={() => changeEpisode(currentEpisode - 1)}
            >
              <Icon name="arrow-left" size={16} /> Episode Sebelumnya
            </button>

            <button
              disabled={!totalEpisodes || currentEpisode >= totalEpisodes}
              onClick={() => changeEpisode(currentEpisode + 1)}
            >
              Episode Berikutnya <Icon name="arrow-right" size={16} />
            </button>
          </div>

          {sourceStatus === "unverified" && (
            <p className="source-notice" role="status">
              Sumber video episode ini belum terverifikasi, jadi tidak diputar.
            </p>
          )}

          <VideoPlayer
            sources={streamSources}
            title={selectedAnimeData.title}
            poster={selectedAnimeData.poster}
            startAt={startAt}
            onProgress={saveProgress}
          />

          <div className="episode-list">
            <h3>Daftar Episode</h3>
            {totalEpisodes ? (
              <div className="episode-buttons">
                {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((episode) => (
                  <button
                    key={episode}
                    className={currentEpisode === episode ? "active" : ""}
                    onClick={() => changeEpisode(episode)}
                  >
                    Episode {episode}
                    {(() => {
                      const k = selectedAnimeData ? `${selectedAnimeData.id}:${episode}` : null;
                      const p = k ? progressMap[k] : null;
                      const pct =
                        p && Number.isFinite(p.duration) && p.duration > 0
                          ? Math.min(100, Math.round((p.position / p.duration) * 100))
                          : 0;
                      const done = pct >= 95;
                      return (
                        <>
                          {pct > 0 && !done && (
                            <span className="episode-progress" aria-hidden="true">
                              <span style={{ width: `${pct}%` }} />
                            </span>
                          )}
                          {done && <span className="episode-done" aria-label="Selesai">✓</span>}
                        </>
                      );
                    })()}
                  </button>
                ))}
              </div>
            ) : (
              <p className="episode-empty">Jumlah episode belum tersedia.</p>
            )}
          </div>
        </section>
      ) : selectedAnimeData && (
        <section className="anime-detail">
          <button onClick={() => setSelectedAnime(null)}>
            <Icon name="arrow-left" size={16} /> Kembali
          </button>

          <div className="detail-content">
            {selectedAnimeData.poster && (
              <img
                className="detail-poster"
                src={selectedAnimeData.poster}
                alt={selectedAnimeData.title}
              />
            )}

            <div className="detail-info">
              <h2>{selectedAnimeData.title}</h2>
              <SeasonPicker
            seasons={getSeries(selectedAnimeData.id)?.seasons}
            currentId={selectedAnimeData.id}
            isAvailable={(id) => Boolean(findAnime(id))}
            onSelect={changeSeason}
          />
              <AnimeFacts key={selectedAnimeData.id} anime={selectedAnimeData} />
              <OfficialLinks title={selectedAnimeData.title} />
              <button
                type="button"
                className="detail-fav"
                aria-pressed={isFavorite(selectedAnimeData.id)}
                onClick={() => toggleFavorite(selectedAnimeData)}
              >
                {isFavorite(selectedAnimeData.id)
                  ? <><Icon name="heart" size={16} filled className="icon-fav" /> Tersimpan di Daftar Saya</>
                  : <><Icon name="heart" size={16} /> Simpan ke Daftar Saya</>}
              </button>
              
              
              
              <button
                className="watch-now-button"
                onClick={() => watchEpisode(selectedAnime, currentEpisode)}
              >
                <Icon name="play" size={16} filled /> Tonton Sekarang
              </button>
            </div>
          </div>
        </section>
      )}

      {selectedAnime && !selectedAnimeData && (
        <section className="anime-detail">
          <button onClick={() => setSelectedAnime(null)}>
            <Icon name="arrow-left" size={16} /> Kembali
          </button>
          <p className="detail-missing">Data anime ini tidak tersedia.</p>
        </section>
      )}
      <Footer />
    </div>
  );
}

function DiscoveryHead({ title, eyebrow, onSeeAll }) {
  return (
    <header className="bento-head">
      <div className="bento-head__title">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      <button type="button" className="bento-seeall" onClick={onSeeAll}>
        Lihat Semua <Icon name="chevron-right" size={14} />
      </button>
    </header>
  );
}

// Kolom utama: grid poster yang ukurannya mengikuti lebar kolom.
function DiscoveryGrid({ title, eyebrow, items, onSeeAll, onSelect, isFavorite, toggleFavorite }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="bento-block">
      <DiscoveryHead title={title} eyebrow={eyebrow} onSeeAll={onSeeAll} />
      <div className="bento-grid">
        {items.map((anime) => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            isFavorite={isFavorite(anime.id)}
            playable={hasPlayableSource(anime.id)}
            onSelect={onSelect}
            onToggleFavorite={() => toggleFavorite(anime)}
          />
        ))}
      </div>
    </section>
  );
}

// Kolom samping: daftar ringkas, hierarki lebih kecil dari grid utama.
function DiscoveryList({ title, eyebrow, items, onSeeAll, onSelect, isFavorite, toggleFavorite }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="bento-block">
      <DiscoveryHead title={title} eyebrow={eyebrow} onSeeAll={onSeeAll} />
      <ul className="bento-list">
        {items.slice(0, 4).map((anime) => (
          <SideAnimeCard
            key={anime.id}
            anime={anime}
            isFavorite={isFavorite(anime.id)}
            playable={hasPlayableSource(anime.id)}
            onSelect={onSelect}
            onToggleFavorite={() => toggleFavorite(anime)}
          />
        ))}
      </ul>
    </section>
  );
}

export default App;
