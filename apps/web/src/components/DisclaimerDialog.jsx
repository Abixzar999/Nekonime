import { useEffect, useId, useRef } from "react";
import Icon from "./Icon";
import { SITE } from "../data/site";
import "./Dialog.css";
import "./Footer.css";

const SECTIONS = [
  {
    title: "Tentang NEKONIME",
    body: "NEKONIME adalah proyek katalog dan pemutar anime buatan pribadi yang dikembangkan sebagai bahan belajar. NEKONIME bukan layanan streaming resmi dan tidak berafiliasi dengan studio, penerbit, AniList, YouTube, maupun layanan streaming mana pun."
  },
  {
    title: "Video",
    body: "NEKONIME tidak menyimpan, mengunggah, atau menyediakan berkas video di servernya. Video yang bisa diputar disematkan (embed) dari kanal resmi di YouTube, misalnya Ani-One Indonesia, lewat pemutar resmi YouTube. Seluruh hak atas video, nama, dan logo tetap milik pemegang haknya masing-masing. Jika pemilik menghapus video atau mematikan penyematan, video itu tidak akan tampil di sini."
  },
  {
    title: "Informasi anime",
    body: "Judul, poster, sinopsis, dan rating berasal dari AniList. Hak atas materi itu milik pemiliknya masing-masing. Informasinya bisa tidak lengkap atau berubah sewaktu-waktu."
  },
  {
    title: "Tautan layanan resmi",
    body: "Untuk judul yang belum punya video di NEKONIME, tersedia tautan pencarian ke JustWatch, Crunchyroll, Netflix, dan YouTube. Ketersediaan judul berbeda di tiap negara dan di luar kendali NEKONIME."
  },
  {
    title: "Data dan privasi",
    body: "Riwayat tontonan, favorit, dan pengaturan tampilan hanya disimpan di peramban pada perangkatmu, dan tidak dikirim ke server NEKONIME. Pemutar YouTube dimuat langsung dari YouTube dan tunduk pada ketentuan serta kebijakan privasi YouTube."
  }
];

// Dialog disclaimer: dialog modal bawaan browser (fokus terkunci, Esc menutup, latar mengabur).
function DisclaimerDialog({ onClose }) {
  const ref = useRef(null);
  const closeRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add("dialog-open");
    closeRef.current?.focus();
    return () => {
      document.documentElement.classList.remove("dialog-open");
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="nk-dialog nk-dialog--wide"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="nk-dialog__box">
        <span className="nk-dialog__icon" aria-hidden="true">
          <Icon name="info" size={20} />
        </span>
        <h2 className="nk-dialog__title" id={titleId}>Disclaimer</h2>

        <div className="nk-disclaimer">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}

          {SITE.contactEmail && (
            <section>
              <h3>Permintaan penghapusan</h3>
              <p>
                Jika kamu pemegang hak dan keberatan atas sebuah tautan atau tampilan di sini,
                hubungi <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. Item
                yang dimaksud akan segera dihapus dari daftar.
              </p>
            </section>
          )}
        </div>

        <div className="nk-dialog__actions">
          <button
            type="button"
            ref={closeRef}
            className="nk-dialog__btn nk-dialog__btn--primary"
            onClick={onClose}
          >
            Mengerti
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default DisclaimerDialog;
