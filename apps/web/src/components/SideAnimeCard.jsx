import { memo } from "react";
import Icon from "./Icon";
import "./SideAnimeCard.css";

// Kartu ringkas untuk kolom samping bento: poster kecil, judul, rating, dan favorit.
function SideAnimeCard({ anime, isFavorite, playable, onSelect, onToggleFavorite }) {
  return (
    <li className="nk-side">
      <button
        type="button"
        className="nk-side__open"
        onClick={() => onSelect(anime)}
      >
        <span className="nk-side__poster">
          {anime.poster && <img src={anime.poster} alt="" loading="lazy" decoding="async" />}
          {playable && (
            <span className="nk-side__play" aria-hidden="true">
              <Icon name="play" size={10} filled />
            </span>
          )}
        </span>

        <span className="nk-side__body">
          <span className="nk-side__title">{anime.title}</span>
          <span className="nk-side__meta">
            <span className="nk-side__chip">
              <Icon name="star" size={11} filled className="icon-star" /> {anime.rating}
            </span>
            {anime.year && anime.year !== "-" && (
              <span className="nk-side__year">{anime.year}</span>
            )}
          </span>
          {anime.genre && anime.genre !== "-" && (
            <span className="nk-side__genre">{anime.genre}</span>
          )}
        </span>
      </button>

      <button
        type="button"
        className="nk-side__fav"
        onClick={() => onToggleFavorite(anime.id)}
        aria-label={`${isFavorite ? "Hapus" : "Simpan"} ${anime.title} ${isFavorite ? "dari" : "ke"} Daftar Saya`}
        aria-pressed={isFavorite}
      >
        <Icon
          name="heart"
          size={15}
          filled={isFavorite}
          className={isFavorite ? "icon-fav" : ""}
        />
      </button>
    </li>
  );
}

export default memo(SideAnimeCard);
