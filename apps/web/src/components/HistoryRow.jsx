import { useState } from "react";
import Icon from "./Icon";
import "./HistoryRow.css";

const LIMIT = 4;

// "Lanjutkan Menonton": daftar ringkas satu baris per anime, 4 teratas, sisanya lewat tombol.
function HistoryRow({ history, onWatch, onRemove, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? history : history.slice(0, LIMIT);
  const extra = history.length - LIMIT;

  const confirmClear = () => {
    if (window.confirm("Hapus semua riwayat tontonan?")) onClear();
  };

  return (
    <section className="watch-history nk-hist">
      <div className="nk-hist__head">
        <div>
          <p className="eyebrow">YOUR HISTORY</p>
          <h2>Lanjutkan Menonton</h2>
        </div>
        <button type="button" className="nk-hist__clear" onClick={confirmClear}>
          <Icon name="trash" size={15} /> Hapus semua
        </button>
      </div>

      <ul className="nk-hist__list">
        {visible.map((item) => (
          <li className="nk-hist__row" key={item.animeId}>
            <button
              type="button"
              className="nk-hist__open"
              onClick={() => onWatch(item.animeId, item.episode)}
            >
              <img
                src={item.poster || `/images/anime/anime-${item.animeId}.jpeg`}
                alt=""
                loading="lazy"
              />
              <span className="nk-hist__text">
                <span className="nk-hist__title" title={item.title}>{item.title}</span>
                <span className="nk-hist__ep">Episode {item.episode}</span>
              </span>
              <span className="nk-hist__play" aria-hidden="true">
                <Icon name="play" size={15} filled />
              </span>
            </button>
            <button
              type="button"
              className="nk-hist__remove"
              onClick={() => onRemove(item.animeId)}
              aria-label={`Hapus ${item.title} dari riwayat`}
              title="Hapus dari riwayat"
            >
              <Icon name="close" size={13} />
            </button>
          </li>
        ))}
      </ul>

      {extra > 0 && (
        <div className="nk-hist__more">
          <button
            type="button"
            className={`nk-hist__toggle${expanded ? " is-open" : ""}`}
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Tampilkan lebih sedikit" : `Lihat semua (${history.length})`}
            <Icon name="chevron-down" size={15} />
          </button>
        </div>
      )}
    </section>
  );
}

export default HistoryRow;
