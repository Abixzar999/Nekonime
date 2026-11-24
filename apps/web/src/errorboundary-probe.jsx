/* eslint-disable react-refresh/only-export-components */
// Halaman probe sementara untuk memastikan ErrorBoundary benar-benar menangkap
// error render dan tombol pemulihannya bekerja. File ini dihapus setelah uji.
import { createRoot } from "react-dom/client";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Selalu gagal sampai penguji mematikan flag ini. Dengan begitu retry sinkron
// React 19 pun tetap menghasilkan error, bukan diam-diam pulih.
function Thrower() {
  if (window.__probeThrow !== false) {
    throw new Error("uji error boundary");
  }
  return <p id="recovered">Pemulihan berhasil</p>;
}

const loads = Number(sessionStorage.getItem("probe-loads") || "0") + 1;
sessionStorage.setItem("probe-loads", String(loads));

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <Thrower />
  </ErrorBoundary>
);
