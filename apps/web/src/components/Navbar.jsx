import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import LiquidGlassFilter from "./LiquidGlassFilter";
import "./Navbar.css";

const LINKS = [
  { page: "home", label: "Beranda", icon: "home" },
  { page: "anime", label: "Anime", icon: "tv" },
  { page: "donghua", label: "Donghua", icon: "sparkles" },
  { page: "favorites", label: "Daftar Saya", icon: "heart" }
];

// Bilah atas: logo, menu halaman, dan pencarian.
function Navbar({ activePage, onNavigate, search, onSearchChange }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef(null);
  const barRef = useRef(null);

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

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onSearchChange("");
      setSearchOpen(false);
      e.currentTarget.blur();
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

        <nav className="topbar__links" aria-label="Menu utama">
          {LINKS.map(({ page, label, icon }) => {
            const active = activePage === page;
            return (
              <button
                key={page}
                type="button"
                className={`topbar__link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
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

        <div className={`topbar__search${searchOpen ? " is-open" : ""}`} role="search">
          <Icon name="search" size={16} className="topbar__search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari anime..."
            aria-label="Cari anime"
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
        </div>
      </div>
    </header>
  );
}

export default Navbar;
