import Icon from "./Icon";
import "./EmptyPanel.css";

// Keadaan kosong: karakter chibi di atas kartu kaca, judul, penjelasan, dan satu tombol aksi.
// variant "favorites": belum ada favorit. variant "search": hasil pencarian kosong.
function EmptyPanel({ variant, query, onAction }) {
  const isFav = variant === "favorites";

  return (
    <div
      className={`nk-empty nk-empty--${isFav ? "fav" : "search"}`}
      role="status"
      aria-live="polite"
    >
      <div className="nk-empty__char" aria-hidden="true">
        {isFav ? (
          <>
            <span className="nk-empty__zzz">
              <i>z</i>
              <i>z</i>
              <i>z</i>
            </span>
            <img src="/images/intro/chibi-tidur.webp" alt="" draggable="false" />
          </>
        ) : (
          <>
            <span className="nk-empty__ask">?</span>
            <img src="/images/intro/chibi-depan.webp" alt="" draggable="false" />
          </>
        )}
      </div>

      <h3 className="nk-empty__title">
        {isFav
          ? "Belum ada favorit"
          : query
            ? `Tidak menemukan “${query}”`
            : "Anime tidak ditemukan"}
      </h3>

      <p className="nk-empty__text">
        {isFav ? (
          <>
            Ketuk ikon{" "}
            <span className="nk-empty__heart">
              <Icon name="heart" size={14} />
            </span>{" "}
            di pojok kartu anime untuk menyimpannya di sini.
          </>
        ) : (
          "Coba kata kunci lain, atau hapus pencarian untuk melihat semua judul."
        )}
      </p>

      <button type="button" className="nk-empty__cta" onClick={onAction}>
        <Icon name={isFav ? "tv" : "close"} size={16} />
        {isFav ? "Jelajahi anime" : "Hapus pencarian"}
      </button>
    </div>
  );
}

export default EmptyPanel;
