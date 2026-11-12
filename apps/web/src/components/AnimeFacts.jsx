import { useState } from "react";

const STATUS_LABELS = {
  FINISHED: "Tamat",
  RELEASING: "Sedang tayang",
  NOT_YET_RELEASED: "Belum tayang",
  CANCELLED: "Dibatalkan",
  HIATUS: "Hiatus"
};

// Label info (rating, tahun, episode, status), label genre, dan sinopsis yang bisa dipanjangkan.
function AnimeFacts({ anime }) {
  const [expanded, setExpanded] = useState(false);

  const genres = anime.genre && anime.genre !== "-" ? anime.genre.split(" · ") : [];
  const synopsis = (anime.synopsis || "").replace(/\r?\n+/g, " ").trim();
  const isLong = synopsis.length > 280;

  // Jumlah episode hanya ditampilkan untuk yang sudah tamat (angkanya pasti).
  const chips = [
    anime.rating && anime.rating !== "-" ? `⭐ ${anime.rating}` : null,
    anime.year && anime.year !== "-" ? anime.year : null,
    anime.status === "FINISHED" && anime.totalEpisodes ? `${anime.totalEpisodes} episode` : null,
    STATUS_LABELS[anime.status] || null
  ].filter(Boolean);

  return (
    <div className="detail-facts">
      {chips.length > 0 && (
        <div className="detail-chips">
          {chips.map((chip) => (
            <span className="detail-chip" key={chip}>{chip}</span>
          ))}
        </div>
      )}

      {genres.length > 0 && (
        <div className="detail-genres">
          {genres.map((genre) => (
            <span className="detail-genre" key={genre}>{genre}</span>
          ))}
        </div>
      )}

      <p className={`detail-synopsis${isLong && !expanded ? " is-clamped" : ""}`}>
        {synopsis}
      </p>

      {isLong && (
        <button
          type="button"
          className="detail-more"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Tampilkan lebih sedikit" : "Selengkapnya"}
        </button>
      )}
    </div>
  );
}

export default AnimeFacts;
