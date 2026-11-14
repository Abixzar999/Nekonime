import { useState, useEffect } from "react";
import { getTopAnime, searchAnime } from "../services/animeApi";
import { animeList as localAnime } from "../data/anime";

const DEBOUNCE_MS = 500;
const REQUEST_TIMEOUT_MS = 8000;
const PAGE_SIZE = 12;

// Mengurus katalog: loading, error, debounce, fallback lokal, dan "muat lebih banyak".
// page: "home", "anime", "donghua", dst. Hanya anime/donghua yang menyaring kategori.
export function useAnimeCatalog(query, activePage) {
  const category = activePage === "anime" || activePage === "donghua" ? activePage : "";
  const trimmed = query.trim();
  const key = `${category}|${trimmed}`;

  const [state, setState] = useState({
    items: localAnime,
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: false
  });

  // Nomor halaman kembali ke 1 setiap tab atau kata kunci berganti.
  const [pageState, setPageState] = useState({ key, page: 1 });
  if (pageState.key !== key) {
    setPageState({ key, page: 1 });
  }
  const page = pageState.key === key ? pageState.page : 1;

  const loadMore = () => setPageState({ key, page: page + 1 });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    // Jeda ketik hanya untuk pencarian baru; pindah tab dan muat lebih banyak langsung jalan.
    const delay = trimmed && page === 1 ? DEBOUNCE_MS : 0;

    const timerId = setTimeout(async () => {
      if (cancelled) return;
      setState((prev) =>
        page === 1
          ? { ...prev, loading: true, loadingMore: false, error: null }
          : { ...prev, loadingMore: true, error: null }
      );
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const batch = trimmed
          ? await searchAnime(trimmed, category, page, controller.signal)
          : await getTopAnime(category, page, controller.signal);
        if (cancelled) return;
        setState((prev) => {
          const seen = new Set(page === 1 ? [] : prev.items.map((a) => a.id));
          const fresh = batch.filter((a) => !seen.has(a.id));
          return {
            items: page === 1 ? batch : [...prev.items, ...fresh],
            loading: false,
            loadingMore: false,
            error: null,
            hasMore: batch.length >= PAGE_SIZE
          };
        });
      } catch {
        if (cancelled) return;
        if (page > 1) {
          setState((prev) => ({
            ...prev,
            loadingMore: false,
            hasMore: false,
            error: "Gagal memuat anime lainnya."
          }));
          return;
        }
        const lower = trimmed.toLowerCase();
        const items = localAnime.filter(
          (a) =>
            (!category || a.category === category) &&
            `${a.title} ${a.genre}`.toLowerCase().includes(lower)
        );
        setState({
          items,
          loading: false,
          loadingMore: false,
          error: "Tidak bisa terhubung ke server anime. Menampilkan data contoh.",
          hasMore: false
        });
      } finally {
        clearTimeout(timeoutId);
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
      controller.abort();
    };
  }, [trimmed, category, page]);

  return { ...state, loadMore };
}
