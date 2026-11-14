import { useState, useEffect } from "react";
import { getTopAnime, searchAnime } from "../services/animeApi";
import { animeList as localAnime } from "../data/anime";

const DEBOUNCE_MS = 500;
const REQUEST_TIMEOUT_MS = 8000;

// Mengurus pengambilan katalog: loading, error, debounce, dan fallback lokal.
// page: "home", "anime", "donghua", dst. Hanya anime/donghua yang menyaring kategori.
export function useAnimeCatalog(query, page) {
  const category = page === "anime" || page === "donghua" ? page : "";

  const [state, setState] = useState({
    items: localAnime,
    loading: true,
    error: null,
    usingFallback: false
  });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const trimmed = query.trim();
    // Jeda ketik hanya untuk pencarian; pindah tab langsung memuat.
    const delay = trimmed ? DEBOUNCE_MS : 0;

    const debounceId = setTimeout(async () => {
      if (cancelled) return;
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const items = trimmed
          ? await searchAnime(trimmed, category, controller.signal)
          : await getTopAnime(category, controller.signal);
        if (cancelled) return;
        setState({ items, loading: false, error: null, usingFallback: false });
      } catch {
        if (cancelled) return;
        const lower = trimmed.toLowerCase();
        const items = localAnime.filter(
          (a) =>
            (!category || a.category === category) &&
            `${a.title} ${a.genre}`.toLowerCase().includes(lower)
        );
        setState({
          items,
          loading: false,
          error: "Tidak bisa terhubung ke server anime. Menampilkan data contoh.",
          usingFallback: true
        });
      } finally {
        clearTimeout(timeoutId);
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [query, category]);

  return state;
}
