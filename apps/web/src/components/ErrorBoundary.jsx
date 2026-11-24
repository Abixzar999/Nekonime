import { Component } from "react";
import "./ErrorBoundary.css";

// Menangkap error render agar pengguna tidak berakhir di halaman kosong.
// Data di localStorage tidak disentuh saat pemulihan.
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("NEKONIME gagal merender halaman:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="error-boundary">
        <div className="error-boundary__card" role="alert">
          <img
            className="error-boundary__mascot"
            src="/images/nekonime-mascot.png"
            alt=""
            aria-hidden="true"
          />
          <p className="error-boundary__eyebrow">NEKONIME</p>
          <h1>Ada yang tidak beres</h1>
          <p className="error-boundary__text">
            Halaman ini gagal dimuat. Daftar favorit dan riwayatmu tetap tersimpan.
          </p>
          <div className="error-boundary__actions">
            <button
              type="button"
              className="error-boundary__button"
              onClick={() => this.setState({ hasError: false })}
            >
              Coba lagi
            </button>
            <button
              type="button"
              className="error-boundary__button is-ghost"
              onClick={() => window.location.reload()}
            >
              Muat ulang
            </button>
          </div>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
