import "./VideoPlayer.css";

// Menampilkan video sesuai jenis sumbernya. Tanpa sumber: pesan "belum tersedia".
function VideoPlayer({ source }) {
  if (!source) {
    return (
      <div className="video-player">
        <div className="video-placeholder">
          <span>▶</span>
          <p>Pemutar video NEKONIME</p>
          <small>Video belum tersedia</small>
        </div>
      </div>
    );
  }

  const isYoutube = source.type === "youtube";

  return (
    <>
      <div className="video-player">
        {isYoutube ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${source.id}`}
            title="Pemutar video"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <video controls preload="metadata" src={source.url} />
        )}
      </div>

      <div className="video-meta">
        {source.credit && <p className="video-credit">Sumber: {source.credit}</p>}
        {isYoutube && (
          <a
            className="video-fallback-link"
            href={`https://www.youtube.com/watch?v=${source.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Video tidak muncul? Tonton di YouTube ↗
          </a>
        )}
      </div>
    </>
  );
}

export default VideoPlayer;
