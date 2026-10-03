import { useEffect, useState } from "react";
import { useLatest } from "../../hooks/useLatest";
import { find } from "../../lib/eggs";
import { sfx } from "../../lib/sound";
import { dialogOpen } from "../../lib/ui";
import Overlay from "../Overlay";

// Bonus egg. The Konami code sends Unit-01 berserk: the site takes Unit-01's
// purple and green whatever theme is picked, the page shakes, and it roars.
// The colors come from [data-berserk] in index.css.

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
const SHOW_MS = 4500;

export default function Berserk() {
  const [on, setOn] = useState(false);
  const onRef = useLatest(on);

  useEffect(() => {
    let progress = 0;
    const onKey = (e) => {
      if (onRef.current || e.target.closest?.("input, textarea, select, [contenteditable]") || dialogOpen()) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === CODE[progress]) progress += 1;
      else progress = key === CODE[0] ? 1 : 0;
      if (progress < CODE.length) return;
      progress = 0;
      setOn(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onRef]);

  useEffect(() => {
    if (!on) return;
    document.documentElement.dataset.berserk = "";
    sfx.roar();
    find("berserk");
    const t = setTimeout(() => setOn(false), SHOW_MS);
    return () => {
      clearTimeout(t);
      delete document.documentElement.dataset.berserk;
    };
  }, [on]);

  if (!on) return null;

  return (
    <Overlay>
      <div
        className="pointer-events-none fixed inset-0 z-[65] grid animate-fade-in place-items-center bg-[radial-gradient(ellipse_at_center,rgb(140_255_58/0.18),rgb(40_10_70/0.7))] p-6"
        aria-live="assertive"
      >
        <div className="text-center">
          <p className="animate-shake font-title text-7xl font-black text-sync [-webkit-text-stroke:2px_#2e1250] sm:text-9xl">
            暴走
          </p>
          <p className="mt-4 text-sm tracking-[0.4em] text-paper">UNIT-01 // BERSERK</p>
          <p className="mt-1 text-xs tracking-[0.3em] text-sync">SYNC RATIO // UNMEASURABLE // PILOT NOT IN CONTROL</p>
        </div>
      </div>
    </Overlay>
  );
}
