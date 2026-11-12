import { useState, useEffect } from "react";
import { getAnimeByIds } from "../services/animeApi";
import { getSeries } from "../data/series";

// Mengambil data semua season dari series anime yang sedang dipilih.
// Mengembalikan daftar kosong jika anime itu bukan bagian dari series.
export function useSeasonAnime(animeId) {
  const seriesInfo = getSeries(animeId);
  const key = seriesInfo ? seriesInfo.title : null;
  const [loaded, setLoaded] = useState({});

  useEffect(() => {
    if (!seriesInfo || loaded[key]) return;
    let cancelled = false;
    const controller = new AbortController();
    getAnimeByIds(seriesInfo.seasons.map((s) => s.id), controller.signal)
      .then((list) => {
        if (!cancelled) setLoaded((prev) => ({ ...prev, [key]: list }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [seriesInfo, key, loaded]);

  return key ? loaded[key] || [] : [];
}
