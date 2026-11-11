import { useRef } from "react";

// Baris "Lanjutkan Menonton": bisa digeser, punya panah kiri/kanan dan tombol hapus.
function HistoryRow({ history, onWatch, onClear }) {
  const listRef = useRef(null);

  const scrollByPage = (direction) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: "smooth" });
  };

  const confirmClear = () => {
    if (window.confirm("Hapus semua riwayat tontonan?")) onClear();
  };

  return (
    <section className="watch-history">
      <div className="history-head">
        <div>
          <p className="eyebrow">YOUR HISTORY</p>
          <h2>Lanjutkan Menonton</h2>
        </div>
        <div className="history-controls">
          <button
            type="button"
            className="history-clear"
            onClick={confirmClear}
          >
            Hapus riwayat
          </button>
          <button
            type="button"
            className="history-arrow"
            onClick={() => scrollByPage(-1)}
            aria-label="Geser ke kiri"
          >
            ◀
          </button>
          <button
            type="button"
            className="history-arrow"
            onClick={() => scrollByPage(1)}
            aria-label="Geser ke kanan"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="history-list" ref={listRef}>
        {history.map((item) => (
          <button
            className="history-item"
            key={item.animeId}
            onClick={() => onWatch(item.animeId, item.episode)}
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
  );
}

export default HistoryRow;
