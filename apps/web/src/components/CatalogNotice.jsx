import "./CatalogNotice.css";

// Menampilkan status katalog: sedang memuat, atau pesan saat memakai data cadangan.
function CatalogNotice({ loading, error }) {
  if (loading) {
    return (
      <div className="catalog-notice" role="status">
        <span className="catalog-notice__spinner" aria-hidden="true" />
        <span>Memuat anime...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-notice catalog-notice--warning" role="status">
        <span aria-hidden="true">⚠</span>
        <span>{error}</span>
      </div>
    );
  }

  return null;
}

export default CatalogNotice;
