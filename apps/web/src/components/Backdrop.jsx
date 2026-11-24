import "./Backdrop.css";

// Latar utama statis (aurora). Efek sorot kursor dihapus untuk mengurangi beban performa.
function Backdrop() {
  return (
    <div className="nk-backdrop" aria-hidden="true">
      <span className="nk-backdrop__glow" />
    </div>
  );
}

export default Backdrop;