import { useState, useEffect, useRef } from "react";
import "./VideoPlayer.css";
import Icon from "./Icon";
import OfficialLinks from "./OfficialLinks";
import { loadJSON, saveJSON } from "../utils/storage";

// Menampilkan video sesuai jenis sumbernya. Tanpa sumber: pesan "belum tersedia".
function VideoPlayer({ source, title, poster }) {
  const [cinema, setCinema] = useState(() => loadJSON("nekonime-cinema", false));
  const stageRef = useRef(null);
  const active = cinema && Boolean(source);

  const setMode = (on) => {
    setCinema(on);
    saveJSON("nekonime-cinema", on);
    if (on) stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Mode bioskop: kelas di <html> meredupkan halaman di luar pemutar.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("cinema-mode", active);
    return () => root.classList.remove("cinema-mode");
  }, [active]);

  // Pintasan: B = nyala/mati, Esc = keluar (tidak aktif saat mengetik).
  useEffect(() => {
    if (!source) return undefined;
    const apply = (on) => {
      setCinema(on);
      saveJSON("nekonime-cinema", on);
    };
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape" && cinema) apply(false);
      else if (e.key.toLowerCase() === "b") apply(!cinema);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cinema, source]);

  if (!source) {
    return (
      <div className="video-player">
        <div className="video-placeholder">
          <span>▶</span>
          <p>Pemutar video NEKONIME</p>
          <small>Video belum tersedia</small>
          {title && <OfficialLinks title={title} />}
        </div>
      </div>
    );
  }

  const isYoutube = source.type === "youtube";

  return (
    <>
      <div className="video-stage" ref={stageRef}>
        {poster && (
          <div
            className="cinema-glow"
            style={{ backgroundImage: `url("${poster}")` }}
            aria-hidden="true"
          />
        )}
        <div className="video-player">
          {isYoutube ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${source.id}?rel=0&color=white&playsinline=1`}
              title="Pemutar video"
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <video controls preload="metadata" src={source.url} />
          )}
        </div>
      </div>

      <div className="video-meta">
        {source.credit && <p className="video-credit">Sumber: {source.credit}</p>}
        <button
          type="button"
          className="cinema-toggle"
          aria-pressed={cinema}
          title="Pintasan: tekan B"
          onClick={() => setMode(!cinema)}
        >
          <Icon name="film" size={15} />
          {cinema ? "Mode bioskop: nyala" : "Mode bioskop"}
        </button>
        {isYoutube && (
          <a
            className="video-fallback-link"
            href={`https://www.youtube.com/watch?v=${source.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Video tidak muncul? Tonton di YouTube <Icon name="external" size={14} />
          </a>
        )}
      </div>
    </>
  );
}

export default VideoPlayer;
