import "./HeroCollage.css";

const COLS = 7;
const ROWS = 3;

// Kolase poster di belakang hero. Hanya dekorasi, jadi disembunyikan dari pembaca layar.
function HeroCollage({ posters }) {
  const base = [...new Set(posters.filter(Boolean))].slice(0, 14);
  if (base.length < 3) return null;

  const columns = Array.from({ length: COLS }, (_, c) =>
    Array.from({ length: ROWS }, (_, r) => base[(c * 4 + r) % base.length])
  );

  return (
    <div className="hero-collage" aria-hidden="true">
      {columns.map((col, c) => (
        <div className="hero-collage__col" key={c}>
          {/* Dua rangkap supaya gerakan bisa berulang tanpa putus */}
          {[...col, ...col].map((src, i) => (
            <img key={i} src={src} alt="" loading="lazy" decoding="async" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default HeroCollage;
