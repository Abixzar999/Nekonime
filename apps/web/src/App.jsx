import { useState } from "react";
import { getAnimeById } from "./data/anime";

// Mengubah data favorit lama (angka ID) menjadi objek ringkas.
const normalizeFavorites = (saved) =>
  saved
    .map((entry) => {
      if (typeof entry === "object" && entry !== null) return entry;
      const anime = getAnimeById(entry);
      return anime ? { ...anime } : null;
    })
    .filter(Boolean);
import { loadJSON, saveJSON } from "./utils/storage";
import AnimeCard from "./components/AnimeCard";
import { useAnimeCatalog } from "./hooks/useAnimeCatalog";

function App() {
  const [search, setSearch] = useState("");
  const { items, loading, error } = useAnimeCatalog(search);
  const [showSearch, setShowSearch] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [favorites, setFavorites] = useState(() =>
    normalizeFavorites(loadJSON("nekonime-favorites", []))
  );
  const [watchHistory, setWatchHistory] = useState(() =>
    loadJSON("nekonime-history", [])
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

  // Anime yang sedang dipilih (undefined jika belum ada yang dipilih)
  const findAnime = (id) =>
    items.find((anime) => anime.id === id) || getAnimeById(id);
  const selectedAnimeData = findAnime(selectedAnime);

  const visibleAnime = (activePage === "favorites" ? favorites : items).filter((anime) => {
    const matchesPage =
      activePage === "home" ||
      (activePage === "anime" && anime.category === "anime") ||
      (activePage === "donghua" && anime.category === "donghua") ||
      activePage === "favorites";

    return matchesPage;
  });

  // Catat anime + episode ke riwayat. Dipanggil langsung saat pengguna beraksi.
  const recordHistory = (animeId, episode) => {
    const anime = findAnime(animeId);
    if (!anime) return;

    setWatchHistory((previous) => {
      const updated = [
        { animeId, episode, title: anime.title, poster: anime.poster },
        ...previous.filter((item) => item.animeId !== animeId)
      ];
      saveJSON("nekonime-history", updated);
      return updated;
    });
  };

  // Mulai menonton episode tertentu (dipakai tombol Tonton, Riwayat, dan daftar episode)
  const watchEpisode = (animeId, episode) => {
    setSelectedAnime(animeId);
    setSelectedEpisode(episode);
    setIsWatching(true);
    recordHistory(animeId, episode);
  };

  // Ganti episode saat sedang menonton
  const changeEpisode = (episode) => {
    setSelectedEpisode(episode);
    recordHistory(selectedAnime, episode);
  };

  return (
    <div className="app">
      {!isWatching && !selectedAnime && (
        <>
          <nav className="navbar">
            <img
              src="/images/nekonime-logo.png"
              alt="Nekonime"
              className="brand-logo"
            />
            <div className="nav-links">
              <a href="#" className={activePage === "home" ? "active" : ""} aria-current={activePage === "home" ? "page" : undefined} onClick={(e) => { e.preventDefault(); setActivePage("home"); }}>Beranda</a>
              <a href="#" className={activePage === "anime" ? "active" : ""} aria-current={activePage === "anime" ? "page" : undefined} onClick={(e) => { e.preventDefault(); setActivePage("anime"); }}>Anime</a>
              <a href="#" className={activePage === "donghua" ? "active" : ""} aria-current={activePage === "donghua" ? "page" : undefined} onClick={(e) => { e.preventDefault(); setActivePage("donghua"); }}>Donghua</a>
              <a href="#" className={activePage === "favorites" ? "active" : ""} aria-current={activePage === "favorites" ? "page" : undefined} onClick={(e) => { e.preventDefault(); setActivePage("favorites"); }}>Daftar Saya</a>
            </div>

            <button
              className="search-button"
              aria-expanded={showSearch}
              onClick={() => setShowSearch(!showSearch)}
            >
              ⌕ Cari Anime
            </button>

            {showSearch && (
              <input
                className="search-input"
                type="text"
                placeholder="Ketik judul anime..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
          </nav>

          <main>
            {activePage === "home" && (
              <>
                <section className="hero">
                  <img
                    src="/images/nekonime-mascot.png"
                    alt="Maskot NEKONIME"
                    className="hero-mascot"
                  />
                  <div className="hero-content">
                    <p className="eyebrow">YOUR ANIME UNIVERSE</p>
                    <h1>Dunia Anime<br />Tanpa Batas.</h1>
                    <p className="description">
                      Temukan anime, donghua, dan animasi favoritmu
                      dalam satu tempat.
                    </p>
                    <button
                      className="watch-button"
                      onClick={() => setActivePage("anime")}
                    >
                      ▶ Jelajahi Sekarang
                    </button>
                  </div>
                </section>

                {watchHistory.length > 0 && (
                  <section className="watch-history">
                    <p className="eyebrow">YOUR HISTORY</p>
                    <h2>Lanjutkan Menonton</h2>

                    <div className="history-list">
                      {watchHistory.map((item) => (
                        <button
                          className="history-item"
                          key={item.animeId}
                          onClick={() => watchEpisode(item.animeId, item.episode)}
                        >
                          <img
                            src={item.poster || `/images/anime/anime-${item.animeId}.jpeg`}
                            alt={item.title}
                          />
                          <span>
                            <strong>{item.title}</strong>
                            <small>Episode {item.episode}</small>
                          </span>
                          <span>▶</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

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
                      : "Jelajahi Anime"}
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

              {loading && <p role="status">Memuat anime...</p>}
              {error && !loading && <p role="status">{error}</p>}

              <div className="anime-grid">
                {visibleAnime.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    isFavorite={isFavorite(anime.id)}
                    onSelect={setSelectedAnime}
                    onToggleFavorite={() => toggleFavorite(anime)}
                  />
                ))}
              </div>

              {visibleAnime.length === 0 && (
                <div className="empty-favorites" role="status" aria-live="polite">
                  <h3>
                    {activePage === "favorites" && favorites.length === 0
                      ? "🤍 Belum Ada Anime Favorit"
                      : "Anime Tidak Ditemukan"}
                  </h3>

                  <p>
                    {activePage === "favorites" && favorites.length === 0
                      ? "Yuk, kembali ke Beranda dan simpan anime kesukaanmu!"
                      : "Coba gunakan kata kunci lain atau hapus pencarian."}
                  </p>

                  <button
                    onClick={() => {
                      if (activePage === "favorites" && favorites.length === 0) {
                        setActivePage("home");
                      }
                      setSearch("");
                    }}
                  >
                    {activePage === "favorites" && favorites.length === 0
                      ? "Jelajahi Anime"
                      : "Hapus Pencarian"}
                  </button>
                </div>
              )}
            </section>
          </main>
        </>
      )}

      {isWatching && selectedAnimeData ? (
        <section className="video-page">
          <button onClick={() => setIsWatching(false)}>
            ← Kembali ke Detail
          </button>

          <h2>{selectedAnimeData.title}</h2>
          <p>Episode {selectedEpisode}</p>

          <div className="episode-navigation">
            <button
              disabled={selectedEpisode === 1}
              onClick={() => changeEpisode(selectedEpisode - 1)}
            >
              ← Episode Sebelumnya
            </button>

            <button
              disabled={selectedEpisode === selectedAnimeData.totalEpisodes}
              onClick={() => changeEpisode(selectedEpisode + 1)}
            >
              Episode Berikutnya →
            </button>
          </div>

          <div className="video-player">
            <div className="video-placeholder">
              <span>▶</span>
              <p>Pemutar video NEKONIME</p>
              <small>Video belum tersedia</small>
            </div>
          </div>

          <div className="episode-list">
            <h3>Daftar Episode</h3>
            <div className="episode-buttons">
              {Array.from({ length: selectedAnimeData.totalEpisodes }, (_, i) => i + 1).map((episode) => (
                <button
                  key={episode}
                  className={selectedEpisode === episode ? "active" : ""}
                  onClick={() => changeEpisode(episode)}
                >
                  Episode {episode}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : selectedAnimeData && (
        <section className="anime-detail">
          <button onClick={() => setSelectedAnime(null)}>
            ← Kembali
          </button>

          <div className="detail-content">
            <img
              className="detail-poster"
              src={selectedAnimeData.poster}
              alt={selectedAnimeData.title}
            />

            <div className="detail-info">
              <h2>{selectedAnimeData.title}</h2>
              <p>⭐ {selectedAnimeData.rating}</p>
              <p>{selectedAnimeData.year}</p>
              <p>{selectedAnimeData.genre}</p>
              <p>{selectedAnimeData.synopsis}</p>
              <button
                className="watch-now-button"
                onClick={() => watchEpisode(selectedAnime, selectedEpisode)}
              >
                ▶ Tonton Sekarang
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
