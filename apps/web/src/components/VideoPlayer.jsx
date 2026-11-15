import { useState, useEffect, useRef } from "react";
import "./VideoPlayer.css";
import Icon from "./Icon";
import OfficialLinks from "./OfficialLinks";
import { loadJSON, saveJSON } from "../utils/storage";

let youtubeApi = null;

// Memuat YouTube IFrame Player API (resmi) satu kali saja.
function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (!youtubeApi) {
    youtubeApi = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previous) previous();
        resolve(window.YT);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        youtubeApi = null;
        reject(new Error("API YouTube gagal dimuat"));
      };
      document.head.appendChild(script);
    });
  }
  return youtubeApi;
}

// Menampilkan video sesuai jenis sumbernya. Tanpa sumber: pesan "belum tersedia".
// startAt: detik awal. onProgress(posisi, durasi): dipanggil berkala untuk menyimpan progres.
function VideoPlayer({ source, title, poster, startAt = 0, onProgress }) {
  const [cinema, setCinema] = useState(() => loadJSON("nekonime-cinema", false));
  const [apiFailed, setApiFailed] = useState(false);
  const stageRef = useRef(null);
  const mountRef = useRef(null);
  const progressRef = useRef(onProgress);
  const startRef = useRef(startAt);
  const lastSaveRef = useRef(0);
  const active = cinema && Boolean(source);
  const youtubeId = source && source.type === "youtube" ? source.id : null;

  // Simpan versi terbaru callback dan detik awal tanpa membuat ulang pemutar.
  useEffect(() => {
    progressRef.current = onProgress;
    startRef.current = startAt;
  });

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

  // Pemutar YouTube lewat IFrame Player API, untuk membaca posisi dan durasi.
  useEffect(() => {
    if (!youtubeId || apiFailed) return undefined;
    const parent = mountRef.current;
    if (!parent) return undefined;

    let cancelled = false;
    let player = null;
    let timer = null;

    const report = () => {
      try {
        const position = player.getCurrentTime();
        const duration = player.getDuration();
        if (duration > 0 && progressRef.current) progressRef.current(position, duration);
      } catch {
        // pemutar belum siap, abaikan
      }
    };

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        const holder = document.createElement("div");
        parent.appendChild(holder);
        player = new YT.Player(holder, {
          videoId: youtubeId,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            rel: 0,
            color: "white",
            playsinline: 1,
            start: Math.floor(startRef.current || 0),
            origin: window.location.origin
          },
          events: {
            onReady: (e) => {
              e.target.getIframe().title = "Pemutar video";
            },
            onStateChange: (e) => {
              clearInterval(timer);
              if (e.data === YT.PlayerState.PLAYING) {
                timer = setInterval(report, 10000);
              } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
                report();
              }
            }
          }
        });
      })
      .catch(() => {
        if (!cancelled) setApiFailed(true);
      });

    return () => {
      cancelled = true;
      clearInterval(timer);
      if (player) {
        report();
        try {
          player.destroy();
        } catch {
          // sudah dihapus, abaikan
        }
      }
      parent.innerHTML = "";
    };
  }, [youtubeId, apiFailed]);

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

  let player;
  if (isYoutube && !apiFailed) {
    player = <div className="video-player" ref={mountRef} />;
  } else if (isYoutube) {
    player = (
      <div className="video-player">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${source.id}?rel=0&color=white&playsinline=1`}
          title="Pemutar video"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  } else {
    player = (
      <div className="video-player">
        <video
          controls
          preload="metadata"
          src={source.url}
          onLoadedMetadata={(e) => {
            if (startAt > 0) e.currentTarget.currentTime = startAt;
          }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            const now = Date.now();
            if (v.duration && now - lastSaveRef.current > 10000) {
              lastSaveRef.current = now;
              if (onProgress) onProgress(v.currentTime, v.duration);
            }
          }}
          onPause={(e) => {
            const v = e.currentTarget;
            if (v.duration && onProgress) onProgress(v.currentTime, v.duration);
          }}
        />
      </div>
    );
  }

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
        {player}
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
