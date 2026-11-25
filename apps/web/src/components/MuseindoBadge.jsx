import { useState, useEffect } from "react";
import { checkMuseindoAvailability, getMuseindoEpisodesForAnime } from "../utils/museindoMatch";
import Icon from "./Icon";
import "./AnioneasiaBadge.css";

export function MuseindoBadge({ animeTitle, animeId, onWatch }) {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [episodes, setEpisodes] = useState([]);
  const [showEpisodes, setShowEpisodes] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkMuseindoAvailability(animeTitle).then((avail) => {
      if (!cancelled) {
        setAvailable(avail);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [animeTitle]);

  const loadEpisodes = async () => {
    if (episodes.length > 0) {
      setShowEpisodes(true);
      return;
    }
    const eps = await getMuseindoEpisodesForAnime(animeId, animeTitle);
    setEpisodes(eps);
    setShowEpisodes(true);
  };

  const handleWatchEpisode = (episode) => {
    setShowEpisodes(false);
    if (onWatch) onWatch(episode);
  };

  if (loading || !available) return null;

  return (
    <div className="anioneasia-badge">
      <button
        type="button"
        className="anioneasia-badge__trigger"
        onClick={loadEpisodes}
        aria-expanded={showEpisodes}
        style={{ background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)", borderColor: "#e53935" }}
      >
        <Icon name="video" size={16} />
        <span>Tersedia di Muse Indonesia</span>
        <Icon name={showEpisodes ? "chevron-up" : "chevron-down"} size={14} />
      </button>

      {showEpisodes && episodes.length > 0 && (
        <div className="anioneasia-badge__episodes" role="list" aria-label={`Episode ${animeTitle} di Muse Indonesia`}>
          {episodes.slice(0, 20).map((ep) => (
            <button
              key={ep.videoId}
              type="button"
              className="anioneasia-badge__ep"
              role="listitem"
              onClick={() => handleWatchEpisode(ep.parsedEpisode)}
            >
              <span className="anioneasia-badge__ep-num">Ep {ep.parsedEpisode}</span>
              <span className="anioneasia-badge__ep-title">{ep.parsedTitle}</span>
              <Icon name="play" size={12} />
            </button>
          ))}
          {episodes.length > 20 && (
            <a
              href={`https://www.youtube.com/@MuseIndonesia/search?query=${encodeURIComponent(animeTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="anioneasia-badge__more"
            >
              Lihat {episodes.length - 20} episode lainnya di channel Muse Indonesia
              <Icon name="external" size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function MuseindoBadgeWrapper({ animeTitle, animeId, onWatch }) {
  return <MuseindoBadge animeTitle={animeTitle} animeId={animeId} onWatch={onWatch} />;
}