import Icon from "./Icon";
import "./OfficialLinks.css";

// Tautan pencarian judul di layanan resmi. NEKONIME tidak memutar video dari layanan ini.
const SERVICES = [
  { name: "JustWatch", hint: "cek ketersediaan", url: (q) => `https://www.justwatch.com/id/search?q=${q}` },
  { name: "Crunchyroll", url: (q) => `https://www.crunchyroll.com/search?q=${q}` },
  { name: "Netflix", url: (q) => `https://www.netflix.com/search?q=${q}` }
];

function OfficialLinks({ title }) {
  const query = encodeURIComponent(title);

  return (
    <div className="official-links">
      <p className="official-links__label">Tonton di layanan resmi</p>
      <div className="official-links__list">
        {SERVICES.map((service) => (
          <a
            key={service.name}
            className="official-link"
            href={service.url(query)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {service.name}
            {service.hint && <small>{service.hint}</small>}
            <Icon name="external" size={13} />
          </a>
        ))}
      </div>
    </div>
  );
}

export default OfficialLinks;
