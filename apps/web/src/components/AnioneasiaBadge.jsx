import { useState, useEffect } from "react";
import { checkAnioneasiaAvailability, getAnioneasiaEpisodesForAnime } from "../utils/anioneasiaMatch";
import Icon from "./Icon";
import "./AnioneasiaBadge.css";

export function AnioneasiaBadge({ animeTitle, animeId }) {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [episodes, setEpisodes] = useState([]);
  const [showEpisodes, setShowEpisodes] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkAnioneasiaAvailability(animeTitle).then((avail) => {
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
    const eps = await getAnioneasiaEpisodesForAnime(animeId, animeTitle);
    setEpisodes(eps);
    setShowEpisodes(true);
  };

  if (loading || !available) return null;

  return (
    <div className="anioneasia-badge">
      <button
        type="button"
        className="anioneasia-badge__trigger"
        onClick={loadEpisodes}
        aria-expanded={showEpisodes}
      >
        <Icon name="video" size={16} />
        <span>Tersedia di AniOne Asia</span>
        <Icon name={showEpisodes ? "chevron-up" : "chevron-down"} size={14} />
      </button>

      {showEpisodes && episodes.length > 0 && (
        <div className="anioneasia-badge__episodes" role="list" aria-label={`Episode ${animeTitle} di AniOneAsia`}>
          {episodes.slice(0, 20).map((ep) => (
            <a
              key={ep.videoId}
              href={`https://www.youtube.com/watch?v=${ep.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="anioneasia-badge__ep"
              role="listitem"
            >
              <span className="anioneasia-badge__ep-num">Ep {ep.parsedEpisode}</span>
              <span className="anioneasia-badge__ep-title">{ep.parsedTitle}</span>
              <Icon name="external" size={12} />
            </a>
          ))}
          {episodes.length > 20 && (
            <a
              href={`https://www.youtube.com/@AniOneAsia/search?query=${encodeURIComponent(animeTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="anioneasia-badge__more"
            >
              Lihat {episodes.length - 20} episode lainnya di channel AniOneAsia
              <Icon name="external" size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnioneasiaBadgeWrapper({ animeTitle, animeId }) {
  return <AnioneasiaBadge animeTitle={animeTitle} animeId={animeId} />;
}