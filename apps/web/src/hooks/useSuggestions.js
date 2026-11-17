import { useState, useEffect } from "react";
import { getSuggestions } from "../services/animeApi";

const MIN_CHARS = 2;
const DELAY_MS = 250;
const TIMEOUT_MS = 8000;

// Saran judul untuk kolom cari. Permintaan ditahan sampai pengguna berhenti mengetik.
// Mengembalikan { items, status }: status "idle" | "loading" | "done" | "error".
export function useSuggestions(query, enabled) {
  const ready = enabled && query.length >= MIN_CHARS;
  const [state, setState] = useState({ query: "", items: [], status: "idle" });

  useEffect(() => {
    if (!ready) return undefined;
    let cancelled = false;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const items = await getSuggestions(query, controller.signal);
        if (!cancelled) setState({ query, items, status: "done" });
      } catch {
        if (!cancelled) setState({ query, items: [], status: "error" });
      } finally {
        clearTimeout(timeout);
      }
    }, DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, ready]);

  if (!ready) return { items: [], status: "idle" };
  // Selama menunggu hasil baru, hasil lama tetap tampil (diredupkan oleh CSS)
  if (state.query !== query) return { items: state.items, status: "loading" };
  return { items: state.items, status: state.status };
}
