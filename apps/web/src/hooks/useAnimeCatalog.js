import { useState, useEffect } from "react";
import { getTopAnime, searchAnime } from "../services/animeApi";
import { animeList as localAnime } from "../data/anime";

const DEBOUNCE_MS = 500;
const REQUEST_TIMEOUT_MS = 8000;

// Mengurus pengambilan katalog: loading, error, debounce, dan fallback lokal.
// Mengembalikan: { items, loading, error, usingFallback }
export function useAnimeCatalog(query) {
  const [state, setState] = useState({
    items: localAnime,
    loading: true,
    error: null,
    usingFallback: false
  });

  useEffect(() => {
    // `cancelled` = true jika efek ini sudah digantikan query baru.
    let cancelled = false;
    const controller = new AbortController();
    const trimmed = query.trim();

    const debounceId = setTimeout(async () => {
      if (cancelled) return;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Batas waktu: jika server tidak membalas, batalkan permintaan.
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const items = trimmed
          ? await searchAnime(trimmed, controller.signal)
          : await getTopAnime(controller.signal);
        if (cancelled) return;
        setState({ items, loading: false, error: null, usingFallback: false });
      } catch {
        if (cancelled) return; // query sudah berganti, abaikan hasil lama
        const lower = trimmed.toLowerCase();
        const items = localAnime.filter((a) =>
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
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [query]);

  return state;
}
