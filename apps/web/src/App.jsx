import { useState, useEffect } from "react";
function App() {

const [search, setSearch] = useState("");
const [showSearch, setShowSearch] = useState(false);
const [activePage, setActivePage] = useState("home");
const [selectedAnime, setSelectedAnime] = useState(null);
const [isWatching, setIsWatching] = useState(false);
const [selectedEpisode, setSelectedEpisode] = useState(1);
const [favorites, setFavorites] = useState(() =>
  JSON.parse(localStorage.getItem("nekonime-favorites") || "[]")
);

const [watchHistory, setWatchHistory] = useState(() => JSON.parse(localStorage.getItem("nekonime-history") || "[]"));
const toggleFavorite = (animeId) => {
  setFavorites((previous) => {
    const updated = previous.includes(animeId)
      ? previous.filter((id) => id !== animeId)
      : [...previous, animeId];

    localStorage.setItem("nekonime-favorites", JSON.stringify(updated));
    return updated;
  });
};

const animeData = [
  { id: 1, name: "Anime Pilihan Petualangan Fantasi" },
  { id: 2, name: "Donghua Pilihan Action Fantasi" },
  { id: 3, name: "Animasi Pilihan Adventure Comedy" }
];

const visibleAnime = animeData.filter((anime) => {
  const query = search.trim().toLowerCase();

  const matchesSearch = anime.name.toLowerCase().includes(query);

  const matchesPage =
    activePage === "home" ||
    (activePage === "anime" && anime.id === 1) ||
    (activePage === "donghua" && anime.id === 2) ||
    (activePage === "favorites" && favorites.includes(anime.id));

  return matchesSearch && matchesPage;
});

useEffect(() => {
  if (!isWatching || !selectedAnime) return;

  const entry = {
    animeId: selectedAnime,
    episode: selectedEpisode,
    title: animeDetails[selectedAnime].title
  };

  setWatchHistory((previous) => {
    const updated = [
      entry,
      ...previous.filter((item) => item.animeId !== selectedAnime)
    ];

    localStorage.setItem("nekonime-history", JSON.stringify(updated));
    return updated;
  });
}, [selectedAnime, selectedEpisode, isWatching]);

const animeDetails = {
  1: {
    title: "Anime Pilihan",
    rating: "9.2",
    year: "2026",
    genre: "Petualangan · Fantasi",
    synopsis: "Sebuah perjalanan penuh petualangan dan misteri di dunia fantasi.",
    totalEpisodes: 12
  },
  2: {
    title: "Donghua Pilihan",
    rating: "9.0",
    year: "2026",
    genre: "Action · Fantasi",
    synopsis: "Kisah petualangan di dunia penuh kekuatan dan pertarungan.",
    totalEpisodes: 24
  },
  3: {
    title: "Animasi Pilihan",
    rating: "8.8",
    year: "2026",
    genre: "Adventure · Comedy",
    synopsis: "Petualangan seru yang dipenuhi kejadian lucu dan menarik.",
    totalEpisodes: 10
  }
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
          onClick={() => {
            setSelectedAnime(item.animeId);
            setSelectedEpisode(item.episode);
            setIsWatching(true);
          }}
        >
          <img
            src={`/images/anime/anime-${item.animeId}.jpeg`}
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
<div className="anime-grid">

{visibleAnime.some((anime) => anime.id === 1) && (
<article
  className="anime-card"
  onClick={() => setSelectedAnime(1)}
>
<div className="anime-poster poster-one">
<img src="/images/anime/anime-1.jpeg" alt="Poster Anime" />
</div>
<div className="anime-info">
  <span className="anime-category">ANIME</span>
  <span className="anime-rating">⭐ 9.2</span>
</div>

<button
  className="favorite-button"
  onClick={(e) => {
    e.stopPropagation();
    toggleFavorite(1);
  }}
  aria-label="Tambah atau hapus favorit"
>
  {favorites.includes(1) ? "❤️" : "🤍"}
</button>
<h3>Anime Pilihan</h3>
<p>Petualangan · Fantasi</p>
<span className="anime-year">2026</span>
  </article>
)}

<article
  className="anime-card"
  onClick={() => setSelectedAnime(2)}
  style={{
    display: visibleAnime.some((anime) => anime.id === 2)
      ? "block"
      : "none"
  }}
>
<div className="anime-poster poster-two">
  <img src="/images/anime/anime-2.jpeg" alt="Donghua Pilihan" />
</div>
<div className="anime-info">
  <span className="anime-category">DONGHUA</span>
  <span className="anime-rating">⭐ 9.0</span>
</div>
<button
  className="favorite-button"
  onClick={(e) => {
    e.stopPropagation();
    toggleFavorite(2);
  }}
  aria-label="Tambah atau hapus favorit"
>
  {favorites.includes(2) ? "❤️" : "🤍"}
</button>
<h3>Donghua Pilihan</h3>
<p>Action · Fantasi</p>
<span className="anime-year">2026</span>
    </article>
<article
  className="anime-card"
  onClick={() => setSelectedAnime(3)}
  style={{
    display: visibleAnime.some((anime) => anime.id === 3)
      ? "block"
      : "none"
  }}
>
<div className="anime-poster poster-three">
  <img src="/images/anime/anime-3.jpeg" alt="Animasi Pilihan" />
</div>
<div className="anime-info">
  <span className="anime-category">ANIMASI</span>
  <span className="anime-rating">⭐ 8.8</span>
</div>
<button
  className="favorite-button"
  onClick={(e) => {
    e.stopPropagation();
    toggleFavorite(3);
  }}
  aria-label="Tambah atau hapus favorit"
>
  {favorites.includes(3) ? "❤️" : "🤍"}
</button>
<h3>Animasi Pilihan</h3>
<p>Adventure · Comedy</p>
<span className="anime-year">2026</span>
    </article>
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

{isWatching && selectedAnime ? (
  <section className="video-page">
    <button onClick={() => setIsWatching(false)}>
      ← Kembali ke Detail
    </button>

    <h2>{animeDetails[selectedAnime].title}</h2>
    <p>Episode {selectedEpisode}</p>

    <div className="episode-navigation">
      <button
        disabled={selectedEpisode === 1}
        onClick={() => setSelectedEpisode(selectedEpisode - 1)}
      >
        ← Episode Sebelumnya
      </button>

      <button
        disabled={selectedEpisode === animeDetails[selectedAnime].totalEpisodes}
        onClick={() => setSelectedEpisode(selectedEpisode + 1)}
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
        {Array.from({ length: animeDetails[selectedAnime].totalEpisodes }, (_, i) => i + 1).map((episode) => (
          <button
            key={episode}
            className={selectedEpisode === episode ? "active" : ""}
            onClick={() => setSelectedEpisode(episode)}
          >
            Episode {episode}
          </button>
        ))}
      </div>
    </div>
  </section>
) : selectedAnime && (

  <section className="anime-detail">
    <button onClick={() => setSelectedAnime(null)}>
      ← Kembali
    </button>

    <div className="detail-content">
      <img
        className="detail-poster"
        src={`/images/anime/anime-${selectedAnime}.jpeg`}
        alt={animeDetails[selectedAnime].title}
      />

      <div className="detail-info">
        <h2>{animeDetails[selectedAnime].title}</h2>
        <p>⭐ {animeDetails[selectedAnime].rating}</p>
        <p>{animeDetails[selectedAnime].year}</p>
        <p>{animeDetails[selectedAnime].genre}</p>
        <p>{animeDetails[selectedAnime].synopsis}</p>
        <button
          className="watch-now-button"
          onClick={() => setIsWatching(true)}
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
