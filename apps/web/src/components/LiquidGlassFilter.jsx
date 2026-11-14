import { useEffect, useState } from "react";

const FILTER_ID = "nk-liquid-glass";
const BEZEL = 20; // lebar tepi tempat cahaya dibelokkan (px)
const MAX_SHIFT = 26; // pergeseran maksimum di tepi (px)

// Peta pergeseran: R = geser horizontal, G = geser vertikal, 128 = tidak bergeser.
// Di dekat tepi pil, isi di belakang ditarik dari arah dalam, seperti lensa cembung.
function buildMap(w, h, radius) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(w, h);
  const data = image.data;
  const cx = w / 2;
  const cy = h / 2;
  const halfX = w / 2 - radius;
  const halfY = h / 2 - radius;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const px = Math.abs(dx) - halfX;
      const py = Math.abs(dy) - halfY;
      const qx = Math.max(px, 0);
      const qy = Math.max(py, 0);
      const depth = radius - (Math.hypot(qx, qy) + Math.min(Math.max(px, py), 0));

      let r = 128;
      let g = 128;
      if (depth >= 0 && depth < BEZEL) {
        const t = depth / BEZEL;
        const strength = (1 - t) * (1 - t);
        const sx = dx < 0 ? -1 : 1;
        const sy = dy < 0 ? -1 : 1;
        let nx;
        let ny;
        if (qx > 0 || qy > 0) {
          const len = Math.hypot(qx, qy) || 1;
          nx = (sx * qx) / len;
          ny = (sy * qy) / len;
        } else if (px > py) {
          nx = sx;
          ny = 0;
        } else {
          nx = 0;
          ny = sy;
        }
        r = 128 - nx * strength * 127;
        g = 128 - ny * strength * 127;
      }

      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

// Filter SVG untuk refraksi. Hanya aktif di Chromium; browser lain memakai kaca bening biasa.
function LiquidGlassFilter({ targetRef }) {
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el || !/Chrome\/\d+/.test(navigator.userAgent)) return undefined;

    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const w = Math.round(el.offsetWidth);
        const h = Math.round(el.offsetHeight);
        if (!w || !h) return;
        const cssRadius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || h / 2;
        const radius = Math.min(cssRadius, h / 2, w / 2);
        setFilter({ w, h, map: buildMap(w, h, radius) });
        root.classList.add("lg-refract");
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.classList.remove("lg-refract");
    };
  }, [targetRef]);

  if (!filter) return null;

  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter
          id={FILTER_ID}
          filterUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={filter.w}
          height={filter.h}
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.7" result="soft" />
          <feImage
            href={filter.map}
            x="0"
            y="0"
            width={filter.w}
            height={filter.h}
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            in="soft"
            in2="map"
            scale={MAX_SHIFT * 2}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default LiquidGlassFilter;
