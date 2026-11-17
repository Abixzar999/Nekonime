import { useState, useRef, useEffect, useLayoutEffect, useId } from "react";
import Icon from "./Icon";
import LiquidGlassFilter from "./LiquidGlassFilter";
import { useSuggestions } from "../hooks/useSuggestions";
import "./Navbar.css";
import "./SearchSuggest.css";

const LINKS = [
  { page: "home", label: "Beranda", icon: "home" },
  { page: "anime", label: "Anime", icon: "tv" },
  { page: "donghua", label: "Donghua", icon: "sparkles" },
  { page: "favorites", label: "Daftar Saya", icon: "heart" }
];

// Menyorot huruf yang cocok dengan kata kunci di dalam judul
function highlight(text, query) {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

// Bilah atas: logo, menu halaman (pil meluncur), dan pencarian dengan saran judul.
function Navbar({ activePage, onNavigate, search, onSearchChange, onPickSuggestion }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const barRef = useRef(null);
  const linksRef = useRef(null);
  const searchRef = useRef(null);
  const listId = useId();

  const query = search.trim();
  const { items, status, matched } = useSuggestions(query, suggestOpen);
  const showPanel = suggestOpen && query.length >= 2;
  const active = showPanel ? Math.min(activeIndex, items.length - 1) : -1;

  // Di layar sempit kolom cari tersembunyi; saat dibuka, langsung fokus.
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Pintasan: tekan "/" untuk mencari (tidak aktif saat sedang mengetik).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      setSearchOpen(true);
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Klik di luar kolom cari menutup daftar saran.
  useEffect(() => {
    const onDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  // Pil penanda halaman aktif: posisinya diukur dari tombol aktif dan dipasang lewat
  // variabel CSS, jadi perpindahannya bisa dianimasikan (meluncur) oleh CSS.
  useLayoutEffect(() => {
    const nav = linksRef.current;
    if (!nav) return undefined;
    let frame = 0;

    const place = () => {
      const el = nav.querySelector(".topbar__link.is-active");
      if (!el) return;
      nav.style.setProperty("--pill-x", `${el.offsetLeft}px`);
      nav.style.setProperty("--pill-y", `${el.offsetTop}px`);
      nav.style.setProperty("--pill-w", `${el.offsetWidth}px`);
      nav.style.setProperty("--pill-h", `${el.offsetHeight}px`);
    };

    place();
    if (!nav.hasAttribute("data-ready")) {
      // Aktifkan transisi setelah posisi awal terpasang, supaya tidak meluncur dari pojok.
      frame = requestAnimationFrame(() => nav.setAttribute("data-ready", ""));
    }

    const observer = new ResizeObserver(place);
    observer.observe(nav);
    nav.querySelectorAll(".topbar__link").forEach((el) => observer.observe(el));

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activePage]);

  const pick = (item) => {
    setSuggestOpen(false);
    setActiveIndex(-1);
    setSearchOpen(false);
    inputRef.current?.blur();
    if (onPickSuggestion) onPickSuggestion(item);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!suggestOpen) setSuggestOpen(true);
      else if (items.length) setActiveIndex(Math.min(active + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (items.length) setActiveIndex(Math.max(active - 1, 0));
    } else if (e.key === "Enter") {
      if (showPanel && status === "done" && active >= 0 && items[active]) {
        e.preventDefault();
        pick(items[active]);
      } else {
        setSuggestOpen(false);
      }
    } else if (e.key === "Escape") {
      if (showPanel) {
        setSuggestOpen(false); // Esc pertama: tutup daftar saja
      } else {
        onSearchChange(""); // Esc kedua: kosongkan pencarian
        setSearchOpen(false);
        e.currentTarget.blur();
      }
    }
  };

  return (
    <header className="topbar" ref={barRef}>
      <LiquidGlassFilter targetRef={barRef} />
      <div className="topbar__row">
        <button
          type="button"
          className="topbar__brand"
          onClick={() => onNavigate("home")}
          aria-label="NEKONIME, ke Beranda"
        >
          <img src="/images/nekonime-logo.png" alt="" className="topbar__logo" />
        </button>

        <nav className="topbar__links" aria-label="Menu utama" ref={linksRef}>
          <span className="topbar__pill" aria-hidden="true" />
          {LINKS.map(({ page, label, icon }) => {
            const isActive = activePage === page;
            return (
              <button
                key={page}
                type="button"
                className={`topbar__link${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onNavigate(page)}
              >
                <Icon name={icon} size={16} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="topbar__search-toggle"
          aria-expanded={searchOpen}
          aria-label={searchOpen ? "Tutup pencarian" : "Buka pencarian"}
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Icon name={searchOpen ? "close" : "search"} size={18} />
        </button>

        <div
          className={`topbar__search${searchOpen ? " is-open" : ""}`}
          role="search"
          ref={searchRef}
        >
          <Icon name="search" size={16} className="topbar__search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setSuggestOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setSuggestOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Cari anime atau donghua..."
            aria-label="Cari anime atau donghua"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              active >= 0 && items[active] ? `${listId}-${items[active].id}` : undefined
            }
            autoComplete="off"
          />
          {search ? (
            <button
              type="button"
              className="topbar__clear"
              aria-label="Hapus pencarian"
              onClick={() => {
                onSearchChange("");
                inputRef.current?.focus();
              }}
            >
              <Icon name="close" size={12} />
            </button>
          ) : (
            <kbd className="topbar__kbd" aria-hidden="true">/</kbd>
          )}

          {showPanel && (
            <div
              className="nk-suggest"
              id={listId}
              role="listbox"
              aria-label="Saran judul"
              onMouseDown={(e) => e.preventDefault()}
            >
              {status === "loading" && items.length === 0 && (
                <div className="nk-suggest__skeletons" aria-hidden="true">
                  {[0, 1, 2].map((n) => (
                    <div className="nk-suggest__skeleton" key={n} />
                  ))}
                </div>
              )}

              {status === "error" && (
                <p className="nk-suggest__note" role="status">
                  Saran tidak tersedia sekarang. Hasil pencarian tetap tampil di katalog.
                </p>
              )}

              {status === "done" && items.length === 0 && (
                <p className="nk-suggest__note" role="status">
                  Tidak ada judul yang cocok dengan “{query}”.
                </p>
              )}

              {status === "done" && items.length > 0 && matched && matched.toLowerCase() !== query.toLowerCase() && (
                <p className="nk-suggest__note nk-suggest__note--approx" role="status">
                  Tidak ada yang persis “{query}”. Judul yang mengandung “{matched}”:
                </p>
              )}

              {items.length > 0 && (
                <div className={`nk-suggest__list${status === "loading" ? " is-stale" : ""}`}>
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      id={`${listId}-${item.id}`}
                      role="option"
                      aria-selected={index === active}
                      className={`nk-suggest__item${index === active ? " is-active" : ""}`}
                      style={{ "--i": index }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => pick(item)}
                    >
                      {item.poster ? (
                        <img src={item.poster} alt="" loading="lazy" draggable="false" />
                      ) : (
                        <span className="nk-suggest__noimg" />
                      )}
                      <span className="nk-suggest__text">
                        <span className="nk-suggest__title">{highlight(item.title, matched || query)}</span>
                        <span className="nk-suggest__meta">
                          <span className="nk-suggest__tag">{item.categoryLabel}</span>
                          {item.year !== "-" && <span>{item.year}</span>}
                          {item.rating !== "-" && (
                            <span className="nk-suggest__rate">
                              <Icon name="star" size={11} filled className="icon-star" /> {item.rating}
                            </span>
                          )}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
