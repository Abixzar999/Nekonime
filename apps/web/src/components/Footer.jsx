import { useState } from "react";
import Icon from "./Icon";
import DisclaimerDialog from "./DisclaimerDialog";
import "./Footer.css";

// Footer di semua halaman: ringkasan singkat dan tombol untuk membuka disclaimer lengkap.
function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="nk-footer">
      <p className="nk-footer__text">
        NEKONIME tidak menyimpan video. Video disematkan dari kanal resmi, dan info anime
        berasal dari AniList. Seluruh hak milik pemegang masing-masing.
      </p>
      <button type="button" className="nk-footer__link" onClick={() => setOpen(true)}>
        <Icon name="info" size={14} /> Disclaimer
      </button>
      {open && <DisclaimerDialog onClose={() => setOpen(false)} />}
    </footer>
  );
}

export default Footer;
