// Sementara: kelas CSS lama untuk latar poster. Akan dirapikan saat tahap CSS.
const posterClasses = { 1: "poster-one", 2: "poster-two", 3: "poster-three" };

function AnimeCard({ anime, isFavorite, onSelect, onToggleFavorite }) {
  return (
    <article className="anime-card" onClick={() => onSelect(anime.id)}>
      <div className={`anime-poster ${posterClasses[anime.id] || ""}`}>
        <img src={anime.poster} alt={anime.title} />
      </div>
      <div className="anime-info">
        <span className="anime-category">{anime.categoryLabel}</span>
        <span className="anime-rating">⭐ {anime.rating}</span>
      </div>

      <button
        className="favorite-button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(anime.id);
        }}
        aria-label="Tambah atau hapus favorit"
      >
        {isFavorite ? "❤️" : "🤍"}
      </button>
      <h3>{anime.title}</h3>
      <p>{anime.genre}</p>
      <span className="anime-year">{anime.year}</span>
    </article>
  );
}

export default AnimeCard;
