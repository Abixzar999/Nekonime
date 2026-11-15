import Icon from "./Icon";
import "./AnimeCard.css";

// Kartu anime bergaya Liquid Glass: poster penuh, info di panel kaca bawah.
function AnimeCard({ anime, isFavorite, onSelect, onToggleFavorite }) {
  return (
    <article className="nk-card">
      <button
        type="button"
        className="nk-card__open"
        onClick={() => onSelect(anime.id)}
      >
        <span className="nk-card__poster">
          {anime.poster && <img src={anime.poster} alt="" loading="lazy" />}
        </span>

        <span className="nk-card__badge">{anime.categoryLabel}</span>

        <span className="nk-card__glass">
          <span className="nk-card__title">{anime.title}</span>
          <span className="nk-card__genre">{anime.genre}</span>
          <span className="nk-card__meta">
            <span className="nk-card__chip">
              <Icon name="star" size={12} filled className="icon-star" /> {anime.rating}
            </span>
            <span className="nk-card__chip">{anime.year}</span>
          </span>
        </span>
      </button>

      <button
        type="button"
        className="nk-card__fav"
        onClick={() => onToggleFavorite(anime.id)}
        aria-label={`${isFavorite ? "Hapus" : "Simpan"} ${anime.title} ${isFavorite ? "dari" : "ke"} Daftar Saya`}
        aria-pressed={isFavorite}
      >
        <Icon
          name="heart"
          size={17}
          filled={isFavorite}
          className={isFavorite ? "icon-fav" : ""}
        />
      </button>
    </article>
  );
}

export default AnimeCard;
