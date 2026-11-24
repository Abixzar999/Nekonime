import { useState, useEffect } from "react";
import { getTopAnime, searchAnime } from "../services/animeApi";

const DEBOUNCE_MS = 500;
const REQUEST_TIMEOUT_MS = 8000;
const PAGE_SIZE = 12;

// Mengurus katalog: loading, error, debounce, dan "muat lebih banyak".
// Katalog tidak pernah diisi data contoh: bila API gagal, tampilkan pesan jujur.
// page: "home", "anime", "donghua", dst. Hanya anime/donghua yang menyaring kategori.
export function useAnimeCatalog(query, activePage, filters) {
  const category = activePage === "anime" || activePage === "donghua" ? activePage : "";
  const trimmed = query.trim();
  const f = filters || {};
  const filterKey = `${f.genre || ""}|${f.year || ""}|${f.status || ""}|${f.sort || ""}`;
  const key = `${category}|${trimmed}|${filterKey}`;

  const [state, setState] = useState({
    items: [],
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
          ? await searchAnime(trimmed, category, page, f, controller.signal)
          : await getTopAnime(category, page, f, controller.signal);
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
        setState({
          items: [],
          loading: false,
          loadingMore: false,
          error: "Tidak bisa terhubung ke server anime. Coba lagi beberapa saat lagi.",
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, category, page, filterKey]);

  return { ...state, loadMore };
}
