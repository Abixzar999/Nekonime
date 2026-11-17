import { useEffect, useRef } from "react";
import "./Backdrop.css";

// Latar utama (aurora + sorot kursor) dan spotlight saat layar ditekan.
// Keduanya hanya dekorasi: tidak menerima klik dan disembunyikan dari pembaca layar.
function Backdrop() {
  const bgRef = useRef(null);
  const spotRef = useRef(null);

  useEffect(() => {
    const bg = bgRef.current;
    const spot = spotRef.current;
    if (!bg || !spot) return undefined;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let frame = 0;
    let x = 0;
    let y = 0;
    let pressed = false;

    const paint = () => {
      frame = 0;
      if (fine) {
        bg.style.setProperty("--mx", `${x}px`);
        bg.style.setProperty("--my", `${y}px`);
      }
      if (pressed) {
        spot.style.setProperty("--px", `${x}px`);
        spot.style.setProperty("--py", `${y}px`);
      }
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (fine) bg.classList.add("has-pointer");
      if (fine || pressed) queue();
    };
    const onDown = (e) => {
      if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
      x = e.clientX;
      y = e.clientY;
      pressed = true;
      spot.style.setProperty("--px", `${x}px`);
      spot.style.setProperty("--py", `${y}px`);
      spot.classList.add("is-pressed");
    };
    const onUp = () => {
      pressed = false;
      spot.classList.remove("is-pressed");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", onUp);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, []);

  return (
    <>
      <div className="nk-backdrop" ref={bgRef} aria-hidden="true">
        <span className="nk-backdrop__glow" />
      </div>
      <div className="nk-spot" ref={spotRef} aria-hidden="true" />
    </>
  );
}

export default Backdrop;
