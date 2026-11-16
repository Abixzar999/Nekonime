import { useState, useRef } from "react";
import Icon from "./Icon";
import Dialog from "./Dialog";
import "./HistoryRow.css";

const LIMIT = 4;
const HOLD_MS = 550;

const fmt = (s) => {
  const t = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = String(t % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};
const finished = (position, duration) => duration > 0 && position >= duration * 0.95;

// "Lanjutkan Menonton": daftar ringkas satu baris per anime.
// Tekan lama (atau klik kanan) sebuah baris untuk opsi "Hapus ini" / "Hapus semua".
function HistoryRow({ history, onWatch, onRemove, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const [dialog, setDialog] = useState(null);
  const press = useRef({ timer: 0, x: 0, y: 0, fired: false });

  const visible = expanded ? history : history.slice(0, LIMIT);
  const extra = history.length - LIMIT;
  const closeDialog = () => setDialog(null);

  const startPress = (e, item) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest(".nk-hist__remove")) return;
    const p = press.current;
    p.fired = false;
    p.x = e.clientX;
    p.y = e.clientY;
    clearTimeout(p.timer);
    p.timer = setTimeout(() => {
      p.fired = true;
      setDialog({ type: "menu", item });
    }, HOLD_MS);
  };

  const movePress = (e) => {
    const p = press.current;
    if (p.timer && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10) clearTimeout(p.timer);
  };

  const endPress = () => clearTimeout(press.current.timer);

  const openMenu = (e, item) => {
    e.preventDefault();
    endPress();
    press.current.fired = true;
    setDialog({ type: "menu", item });
  };

  const handleOpen = (item) => {
    if (press.current.fired) {
      press.current.fired = false; // klik yang menyusul tekan lama diabaikan
      return;
    }
    onWatch(item.animeId, item.episode);
  };

  const item = dialog?.item;

  return (
    <section className="watch-history nk-hist">
      <div className="nk-hist__head">
        <div>
          <p className="eyebrow">YOUR HISTORY</p>
          <h2>Lanjutkan Menonton</h2>
        </div>
      </div>
      <p className="nk-hist__hint">Tekan lama, klik kanan, atau tekan Delete pada sebuah riwayat untuk opsi hapus.</p>

      <ul className="nk-hist__list">
        {visible.map((entry) => (
          <li
            className="nk-hist__row"
            key={entry.animeId}
            onPointerDown={(e) => startPress(e, entry)}
            onPointerMove={movePress}
            onPointerUp={endPress}
            onPointerLeave={endPress}
            onPointerCancel={endPress}
            onContextMenu={(e) => openMenu(e, entry)}
          >
            <button
              type="button"
              className="nk-hist__open"
              onClick={() => handleOpen(entry)}
              onKeyDown={(e) => {
                if (e.key === "Delete" || e.key === "Backspace") {
                  e.preventDefault();
                  setDialog({ type: "menu", item: entry });
                }
              }}
            >
              <img
                src={entry.poster || `/images/anime/anime-${entry.animeId}.jpeg`}
                alt=""
                loading="lazy"
                draggable="false"
              />
              <span className="nk-hist__text">
                <span className="nk-hist__title" title={entry.title}>{entry.title}</span>
                <span className="nk-hist__line">
                  <span className="nk-hist__ep">Episode {entry.episode}</span>
                  <span className={`nk-hist__time${entry.duration > 0 ? "" : " is-empty"}`}>
                    {entry.duration > 0
                      ? finished(entry.position, entry.duration)
                        ? "Selesai ditonton"
                        : `Berhenti di ${fmt(entry.position)} / ${fmt(entry.duration)}`
                      : "Menit belum tercatat"}
                  </span>
                </span>
                {entry.duration > 0 && (
                  <span className="nk-hist__bar" aria-hidden="true">
                    <span style={{ width: `${Math.min(100, (entry.position / entry.duration) * 100)}%` }} />
                  </span>
                )}
              </span>
              <span className="nk-hist__play" aria-hidden="true">
                <Icon name="play" size={15} filled />
              </span>
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

      {dialog?.type === "one" && (
        <Dialog
          title="Hapus dari riwayat?"
          message={`“${item.title}” akan dihapus dari Lanjutkan Menonton.`}
          actions={[
            {
              label: "Hapus",
              tone: "danger",
              onClick: () => {
                onRemove(item.animeId);
                closeDialog();
              }
            }
          ]}
          onClose={closeDialog}
        />
      )}

      {dialog?.type === "all" && (
        <Dialog
          title="Hapus semua riwayat?"
          message={`Semua ${history.length} riwayat tontonan akan dihapus dan tidak bisa dikembalikan.`}
          actions={[
            {
              label: "Hapus semua",
              tone: "danger",
              onClick: () => {
                onClear();
                closeDialog();
              }
            }
          ]}
          onClose={closeDialog}
        />
      )}

      {dialog?.type === "menu" && (
        <Dialog
          title="Kelola riwayat"
          message={`“${item.title}” · Episode ${item.episode}`}
          actions={[
            {
              label: "Hapus ini",
              tone: "danger",
              onClick: () => {
                onRemove(item.animeId);
                closeDialog();
              }
            },
            {
              label: "Hapus semua",
              tone: "danger-outline",
              onClick: () => setDialog({ type: "all" })
            }
          ]}
          onClose={closeDialog}
        />
      )}
    </section>
  );
}

export default HistoryRow;
