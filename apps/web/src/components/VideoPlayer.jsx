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

// Menormalkan satu sumber. Sumber lokal lama memakai `id` untuk ID YouTube.
// Validasi ketat: tolak data malformed, tipe tidak didukung, atau field wajib hilang.
// URL scheme validation: hanya izinkan https:, http:, dan relative paths.
function normalizeSource(source, index) {
  if (!source || typeof source !== "object") return null;

  // Provider ID wajib untuk identitas lintas-provider. Default "local" untuk kompatibilitas lama.
  const provider = source.provider || "local";

  // Tipe pemutaran yang didukung.
  const supportedTypes = new Set(["youtube", "file", "embed"]);
  const type = source.type;
  if (!type || !supportedTypes.has(type)) return null;

  // Normalisasi ID YouTube: prioritas youtubeId, fallback ke id lama untuk type youtube.
  let youtubeId = null;
  if (type === "youtube") {
    youtubeId = source.youtubeId || source.id || null;
    if (!youtubeId) return null; // YouTube tanpa ID tidak valid.
  }

  // URL untuk type file/embed.
  let url = null;
  if (type === "file" || type === "embed") {
    url = source.url || null;
    if (!url) return null; // File/embed tanpa URL tidak valid.

    // Validasi URL scheme: hanya https:, http:, dan relative paths (dimulai dengan / atau ./ atau ../)
    try {
      const parsed = new URL(url, window.location.href);
      if (!["https:", "http:"].includes(parsed.protocol)) {
        return null; // Tolak javascript:, data:, file:, dll.
      }
    } catch {
      // Relative URL (misal /videos/ep1.mp4) - diperbolehkan
      if (!url.startsWith("/") && !url.startsWith("./") && !url.startsWith("../")) {
        return null; // Bukan relative path yang valid
      }
    }
  }

  // Source ID unik per provider. Gunakan id eksplisit, atau bangun dari provider+type+identifier.
  const identifier = youtubeId || url || source.id || `idx-${index}`;
  const sourceId = source.id ? String(source.id) : `${provider}:${type}:${identifier}`;

  // Credit wajib untuk atribusi hukum. Default ke provider label jika tidak ada.
  const credit = source.credit || source.provider || provider;

  // License field: "verified" | "unverified" | undefined. Jangan asumsikan URL valid = berizin.
  const license = source.license || undefined;

  return {
    ...source,
    provider,
    id: sourceId,
    type,
    youtubeId,
    url,
    title: source.title || `Episode ${source.episode || index}`,
    credit,
    license,
    key: `${provider}:${sourceId}:${index}`,
  };
}

// Menampilkan video sesuai jenis sumbernya. Tanpa sumber: pesan "belum tersedia".
// Menerima `sources` (array) atau `source` (tunggal, kompatibel dengan pemanggilan lama).
// startAt: detik awal. onProgress(posisi, durasi): dipanggil berkala untuk menyimpan progres.
function VideoPlayer({ source, sources, title, poster, startAt = 0, onProgress }) {
  const [cinema, setCinema] = useState(() => loadJSON("nekonime-cinema", false));
  const [failedYoutubeId, setFailedYoutubeId] = useState(null);
  const [selection, setSelection] = useState({ key: "", index: 0 });
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const stageRef = useRef(null);
  const mountRef = useRef(null);
  const progressRef = useRef(onProgress);
  const startRef = useRef(startAt);
  const lastSaveRef = useRef(0);

  const rawSources = Array.isArray(sources)
    ? sources
    : sources
      ? [sources]
      : source
        ? [source]
        : [];
  const sourceList = rawSources.map(normalizeSource).filter(Boolean);
  const sourceKey = sourceList.map((item) => item.key).join("|");
  // Pilihan server otomatis kembali ke sumber pertama saat daftar berubah,
  // tanpa setState di dalam effect.
  const selectedSourceIndex = selection.key === sourceKey ? selection.index : 0;
  const safeIndex = Math.min(selectedSourceIndex, Math.max(0, sourceList.length - 1));
  const activeSource = sourceList[safeIndex] || null;
  const youtubeId = activeSource?.youtubeId || null;
  const apiFailed = Boolean(youtubeId) && failedYoutubeId === youtubeId;
  const hasSource = Boolean(activeSource);
  const active = cinema && hasSource;

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

  const retryPlayer = () => {
    setFailedYoutubeId(null);
    setPlayerError(null);
    setPlayerLoading(true);
    setRetryNonce((n) => n + 1);
  };

  // Mode bioskop: kelas di <html> meredupkan halaman di luar pemutar.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("cinema-mode", active);
    return () => root.classList.remove("cinema-mode");
  }, [active]);

  // Pintasan: B = nyala/mati, Esc = keluar (tidak aktif saat mengetik).
  useEffect(() => {
    if (!hasSource) return undefined;
    const apply = (on) => {
      setCinema(on);
      saveJSON("nekonime-cinema", on);
    };
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Escape" && cinema) apply(false);
      else if (e.key.toLowerCase() === "b") apply(!cinema);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cinema, hasSource]);

  // Pemutar YouTube lewat IFrame Player API, untuk membaca posisi dan durasi.
  useEffect(() => {
    if (!youtubeId || apiFailed) return undefined;
    const parent = mountRef.current;
    if (!parent) return undefined;

    let cancelled = false;
    let player = null;
    let timer = null;
    setPlayerLoading(true);
    setPlayerError(null);
    // Ikat callback ke episode saat pemutar dibuat. Cleanup saat pindah episode
    // tidak boleh menyimpan posisi lama ke episode baru.
    const reportProgress = progressRef.current;

    const report = () => {
      try {
        const position = player.getCurrentTime();
        const duration = player.getDuration();
        if (duration > 0 && reportProgress) reportProgress(position, duration);
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
          width: "100%",
          height: "100%",
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
              if (!cancelled) setPlayerLoading(false);
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
      .catch((err) => {
        if (!cancelled) {
          setFailedYoutubeId(youtubeId);
          setPlayerError(err?.message || "Gagal memuat pemutar YouTube");
          setPlayerLoading(false);
        }
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
      if (!cancelled) setPlayerLoading(false);
    };
  }, [youtubeId, apiFailed, retryNonce]);

  if (!activeSource) {
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

  const isYoutube = activeSource.type === "youtube";
  const isFile = activeSource.type === "file" && Boolean(activeSource.url);
  const isEmbed = activeSource.type === "embed" && Boolean(activeSource.url);

  let player;
  if (isYoutube && !apiFailed) {
    player = (
      <div className="video-player" ref={mountRef}>
        {playerLoading && (
          <div className="video-player__loading" role="status" aria-live="polite">
            <span className="video-player__spinner" aria-hidden="true" />
            <span>Memuat pemutar…</span>
          </div>
        )}
        {playerError && !playerLoading && (
          <div className="video-player__error" role="alert">
            <p>{playerError}</p>
            <button type="button" onClick={retryPlayer}>Coba lagi</button>
          </div>
        )}
      </div>
    );
  } else if (isYoutube) {
    player = (
      <div className="video-player">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${activeSource.youtubeId}?rel=0&color=white&playsinline=1`}
          title="Pemutar video"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <button type="button" className="video-player__retry" onClick={retryPlayer}>
          Coba lagi (player API)
        </button>
      </div>
    );
  } else if (isFile) {
    player = (
      <div className="video-player">
        <video
          controls
          preload="metadata"
          src={activeSource.url}
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
  } else if (isEmbed) {
    player = (
      <div className="video-player">
        <iframe
          src={activeSource.url}
          title="Pemutar video"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="no-referrer"
        />
      </div>
    );
  } else {
    player = (
      <div className="video-player">
        <div className="video-placeholder">
          <span>⚠</span>
          <p>Tipe sumber tidak didukung</p>
        </div>
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
        {sourceList.length > 1 && (
          <label className="source-selector">
            <span>Server</span>
            <select
              value={safeIndex}
              onChange={(e) => setSelection({ key: sourceKey, index: Number(e.target.value) })}
            >
              {sourceList.map((item, index) => (
                <option key={item.key} value={index}>
                  {item.title || item.provider || `Sumber ${index + 1}`}
                  {item.credit ? ` — ${item.credit}` : ""}
                </option>
              ))}
            </select>
          </label>
        )}
        {activeSource.credit && <p className="video-credit">Sumber: {activeSource.credit}</p>}
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
            href={`https://www.youtube.com/watch?v=${activeSource.youtubeId}`}
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
