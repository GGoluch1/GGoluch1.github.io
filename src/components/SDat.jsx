import { useEffect, useRef, useState } from "react";
import { useHold } from "../hooks/useHold";
import { find } from "../lib/eggs";
import { TAPE, TRACK_27, sdat, useSdat } from "../lib/sdat";

// Shinji's S-DAT. Its display only ever shows tracks 25 and 26, whatever is
// actually playing. Tap ⏭ to skip; hold it long enough and it finally reaches
// track 27 (a bonus egg).

const HOLD_FOR_27 = 3;

function Reel({ spinning }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-7 text-magi ${spinning ? "animate-spin [animation-duration:3s]" : ""}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 3.5v5M4.6 16.3l4.3-2.5M19.4 16.3l-4.3-2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const button =
  "grid h-9 min-w-11 place-items-center border-2 border-magi/60 px-3 text-sm transition-colors hover:border-magi hover:bg-magi hover:text-void select-none touch-none";

export default function SDat() {
  const { playing, index, special } = useSdat();
  const [counter, setCounter] = useState(25);
  const [ff, setFf] = useState(0);
  const held = useRef(0);
  const fired = useRef(false);

  // The display flips between 25 and 26 while the tape runs.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setCounter((t) => (t === 25 ? 26 : 25)), 6000);
    return () => clearInterval(id);
  }, [playing]);

  // Tap ⏭ to skip; hold it to fast-forward until track 27.
  const skip = useHold((dt, holding) => {
    if (holding) {
      if (fired.current) return false;
      held.current += dt;
      setFf(held.current);
      if (held.current >= HOLD_FOR_27) {
        fired.current = true;
        setFf(0);
        sdat.track27();
        find("track27");
      }
      return true;
    }
    const tapped = held.current < 0.45 && !fired.current;
    held.current = 0;
    fired.current = false;
    setFf(0);
    if (tapped) sdat.next();
    return false;
  });

  const piece = special ? TRACK_27 : TAPE[index];
  const forwarding = ff > 0.45;
  const shown = special ? 27 : forwarding ? (Math.floor(ff * 10) % 2 ? 25 : 26) : counter;

  return (
    <div className={`relative border-2 bg-panel ${playing ? "z-[63] border-magi" : "border-magi/60"}`}>
      <div className="flex justify-between border-b border-magi/40 px-3 py-1 text-xs tracking-widest">
        <span>S-DAT // {playing ? "再生中" : "停止"}</span>
        <span className={playing ? "text-sync" : "text-magi/80"}>
          {forwarding ? "▶▶ FF" : playing ? "▶ PLAY" : "■ STOP"}
        </span>
      </div>
      <div className="flex items-center gap-4 p-3">
        <div className="hidden shrink-0 gap-2 border border-magi/50 px-2 py-4 sm:flex">
          <Reel spinning={playing || forwarding} />
          <Reel spinning={playing || forwarding} />
        </div>
        <div
          className={`min-w-0 flex-1 px-3 py-2 transition-colors duration-700 ${
            special ? "bg-[#1f1608] text-amber" : "bg-[#0b1408] text-sync"
          }`}
        >
          <p className="font-title text-xl font-black tabular-nums">TRACK {shown}</p>
          <p className="truncate text-xs opacity-80">
            {playing ? `${piece.title} — ${piece.composer}` : "REPEAT ALL // 25 ⇄ 26"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={playing ? sdat.stop : sdat.play}
            aria-label={playing ? "Stop" : "Play"}
            className={button}
          >
            {playing ? "■" : "▶"}
          </button>
          <button type="button" {...skip} aria-label="Next track (hold to fast-forward)" className={button}>
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
}
