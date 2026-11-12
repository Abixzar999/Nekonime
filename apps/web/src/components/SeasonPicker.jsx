import "./SeasonPicker.css";

// Tombol pilihan season. Tidak tampil jika anime bukan bagian dari series.
function SeasonPicker({ seasons, currentId, isAvailable, onSelect }) {
  if (!seasons || seasons.length < 2) return null;

  return (
    <div className="season-picker" role="group" aria-label="Pilih season">
      {seasons.map((season) => {
        const active = season.id === currentId;
        return (
          <button
            key={season.id}
            type="button"
            className={`season-btn${active ? " active" : ""}`}
            aria-pressed={active}
            disabled={!isAvailable(season.id)}
            onClick={() => onSelect(season.id)}
          >
            {season.label}
          </button>
        );
      })}
    </div>
  );
}

export default SeasonPicker;
