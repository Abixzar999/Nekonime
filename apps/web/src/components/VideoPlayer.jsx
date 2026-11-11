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

  return (
    <>
      <div className="video-player">
        {source.type === "youtube" ? (
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
      {source.credit && <p className="video-credit">Sumber: {source.credit}</p>}
    </>
  );
}

export default VideoPlayer;
