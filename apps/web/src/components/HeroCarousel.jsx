import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import "./HeroCarousel.css";

const AUTOPLAY_MS = 7000;
const SWIPE_THRESHOLD = 48;

const STATUS_LABEL = {
  RELEASING: "Sedang tayang",
  FINISHED: "Tamat",
  NOT_YET_RELEASED: "Belum tayang",
  HIATUS: "Hiatus",
  CANCELLED: "Dihentikan"
};

// Chips informasi yang benar-benar tersedia di data API.
function buildChips(anime) {
  const chips = [];
  if (anime.rating && anime.rating !== "-") {
    chips.push({ key: "rating", icon: "star", label: anime.rating });
  }
  if (anime.year && anime.year !== "-") chips.push({ key: "year", label: anime.year });
  if (anime.totalEpisodes) {
    chips.push({ key: "episodes", label: `${anime.totalEpisodes} episode` });
  }
  if (anime.status && STATUS_LABEL[anime.status]) {
    chips.push({ key: "status", label: STATUS_LABEL[anime.status] });
  }
  return chips;
}

// Hero utama beranda: satu panel besar berisi highlight anime populer.
// Bisa digeser (drag/swipe), punya panah, indikator, dan berhenti saat disorot.
function HeroCarousel({ items = [], loading = false, onSelect, onWatch, isPlayable }) {
  const list = items.slice(0, 5);
  const count = list.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef({ startX: null, pointerId: null });

  // Jaga indeks tetap valid ketika daftar berubah (mis. data API termuat).
  const safeIndex = count > 0 ? Math.min(index, count - 1) : 0;

  useEffect(() => {
    if (count <= 1 || paused) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (count === 0) {
    if (!loading) return null;
    return (
      <section className="nk-hero nk-hero--loading" aria-busy="true" aria-label="Memuat highlight anime">
        <div className="nk-hero__loading-panel">
          <span className="nk-hero__spinner" aria-hidden="true" />
          <p>Memuat highlight anime…</p>
        </div>
      </section>
    );
  }

  const current = list[safeIndex];
  const banner = current.bannerImage || "";
  const art = banner || current.poster || "";
  const chips = buildChips(current);
  const playable = Boolean(isPlayable && isPlayable(current.id));

  const goTo = (next) => setIndex(((next % count) + count) % count);

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = { startX: event.clientX, pointerId: event.pointerId };
  };

  const handlePointerUp = (event) => {
    const { startX } = dragRef.current;
    dragRef.current = { startX: null, pointerId: null };
    if (startX === null) return;
    const diff = event.clientX - startX;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;
    goTo(safeIndex + (diff < 0 ? 1 : -1));
  };

  const cancelDrag = () => {
    dragRef.current = { startX: null, pointerId: null };
  };

  return (
    <section
      className={`nk-hero${banner ? "" : " nk-hero--fallback"}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Highlight anime"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelDrag}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => {
        cancelDrag();
        setPaused(false);
      }}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {art && (
        <img
          className="nk-hero__media"
          src={art}
          alt=""
          decoding="async"
          fetchPriority="high"
        />
      )}
      <div className="nk-hero__scrim" aria-hidden="true" />
      <div className="nk-hero__glow" aria-hidden="true" />

      <div className="nk-hero__inner" key={current.id}>
        <div className="nk-hero__panel">
          <p className="nk-hero__eyebrow">
            HIGHLIGHT <span aria-hidden="true">·</span> {current.categoryLabel || "ANIME"}
          </p>
          <h1 className="nk-hero__title">{current.title}</h1>

          {(chips.length > 0 || current.genre) && (
            <div className="nk-hero__meta">
              {chips.map((chip) => (
                <span className="nk-hero__chip" key={chip.key}>
                  {chip.icon && <Icon name={chip.icon} size={12} filled className="icon-star" />}
                  {chip.label}
                </span>
              ))}
              {current.genre && current.genre !== "-" && (
                <span className="nk-hero__genres">{current.genre}</span>
              )}
            </div>
          )}

          {current.synopsis && (
            <p className="nk-hero__synopsis">{current.synopsis}</p>
          )}

          <div className="nk-hero__actions">
            <button
              type="button"
              className="watch-button"
              onClick={() => onSelect && onSelect(current)}
            >
              <Icon name="play" size={16} filled /> Lihat Detail
            </button>
            {playable && onWatch && (
              <button
                type="button"
                className="nk-hero__watch"
                onClick={() => onWatch(current)}
              >
                <Icon name="play" size={15} filled /> Tonton Sekarang
              </button>
            )}
          </div>
        </div>

        {current.poster && (
          <div className="nk-hero__poster" aria-hidden="true">
            <img src={current.poster} alt="" decoding="async" />
          </div>
        )}
      </div>

      {count > 1 && (
        <div className="nk-hero__bar">
          <p className="nk-hero__counter" aria-hidden="true">
            {String(safeIndex + 1).padStart(2, "0")}
            <span> / {String(count).padStart(2, "0")}</span>
          </p>

          <div className="nk-hero__dots">
            {list.map((anime, i) => (
              <button
                key={anime.id}
                type="button"
                aria-current={i === safeIndex ? "true" : undefined}
                aria-label={`Highlight ${i + 1}: ${anime.title}`}
                className={`nk-hero__dot${i === safeIndex ? " is-active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          <div className="nk-hero__nav">
            <button
              type="button"
              className="nk-hero__arrow"
              onClick={() => goTo(safeIndex - 1)}
              aria-label="Highlight sebelumnya"
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <button
              type="button"
              className="nk-hero__arrow"
              onClick={() => goTo(safeIndex + 1)}
              aria-label="Highlight berikutnya"
            >
              <Icon name="chevron-right" size={20} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default HeroCarousel;
