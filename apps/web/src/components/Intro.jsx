import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Intro.css";

const SEEN_KEY = "nekonime-intro-seen";

// Tampil sekali per sesi browser. Tambahkan ?intro di alamat untuk memaksa tampil.
function wantsIntro() {
  try {
    if (new URLSearchParams(window.location.search).has("intro")) return true;
    return sessionStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Intro saat masuk: maskot, logo, dan keluar dengan liquid wipe.
function Intro() {
  const [phase, setPhase] = useState(() => (wantsIntro() ? "show" : "gone"));
  // Durasi (ms): lama tampil dan lama keluar. Ubah angka "show" untuk memperpanjang atau memperpendek.
  const [timing] = useState(() =>
    prefersReducedMotion() ? { show: 900, leave: 300 } : { show: 3200, leave: 850 }
  );
  const skipRef = useRef(null);
  const active = phase !== "gone";

  // Kunci halaman di belakang intro (tidak bisa diklik atau difokuskan).
  useEffect(() => {
    if (!active) return undefined;
    const root = document.getElementById("root");
    document.documentElement.classList.add("intro-open");
    if (root) root.inert = true;
    skipRef.current?.focus();
    return () => {
      document.documentElement.classList.remove("intro-open");
      if (root) root.inert = false;
    };
  }, [active]);

  // Alur waktu: tampil, lalu keluar, lalu selesai.
  useEffect(() => {
    if (phase === "show") {
      const id = setTimeout(() => setPhase("leaving"), timing.show);
      return () => clearTimeout(id);
    }
    if (phase === "leaving") {
      const id = setTimeout(() => {
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {
          // penyimpanan diblokir, abaikan
        }
        setPhase("gone");
      }, timing.leave);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [phase, timing]);

  // Pintasan lewati: Esc, Enter, atau Spasi.
  useEffect(() => {
    if (phase !== "show") return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setPhase("leaving");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  if (!active) return null;

  const skip = () => setPhase((p) => (p === "show" ? "leaving" : p));

  return createPortal(
    <div
      className={`nk-intro${phase === "leaving" ? " is-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Selamat datang di NEKONIME"
      style={{ "--show": `${timing.show}ms`, "--leave": `${timing.leave}ms` }}
      onClick={skip}
    >
      <div className="nk-intro__aurora" aria-hidden="true" />

      <div className="nk-intro__stage">
        <div className="nk-intro__mascot" aria-hidden="true">
          <img src="/images/nekonime-mascot.png" alt="" draggable="false" />
        </div>
        <div className="nk-intro__logo">
          <img src="/images/nekonime-logo.png" alt="NEKONIME" draggable="false" />
        </div>
        <p className="nk-intro__tag">YOUR ANIME UNIVERSE</p>
        <div className="nk-intro__bar" aria-hidden="true">
          <span />
        </div>
      </div>

      <div className="nk-intro__friend" aria-hidden="true">
        <span className="nk-intro__plate" />
        <img src="/images/intro/chibi-depan.png" alt="" draggable="false" />
      </div>

      <div className="nk-intro__sleeper" aria-hidden="true">
        <span className="nk-intro__zzz">
          <i>z</i>
          <i>z</i>
          <i>z</i>
        </span>
        <img src="/images/intro/chibi-tidur.png" alt="" draggable="false" />
      </div>

      <button
        type="button"
        ref={skipRef}
        className="nk-intro__skip"
        onClick={(e) => {
          e.stopPropagation();
          skip();
        }}
      >
        Lewati <kbd>Esc</kbd>
      </button>
    </div>,
    document.body
  );
}

export default Intro;
