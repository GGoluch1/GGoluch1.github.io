import { useEffect, useRef } from "react";
import { plugIn, unplug, usePower } from "../lib/power";
import Overlay from "./Overlay";

// Nav control for the umbilical cable, the internal-battery countdown, and the
// "activity limit" screen when it runs out.

function Plug({ connected }) {
  return (
    <svg viewBox="0 0 28 14" className="h-3.5 w-7" aria-hidden="true">
      <path d="M0 7h9" stroke="currentColor" strokeWidth="2" />
      <rect x="9" y="3" width="6" height="8" fill="currentColor" />
      <g className="transition-transform duration-300" style={{ transform: connected ? "none" : "translateX(5px)" }}>
        <path d="M17 5h4M17 9h4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="21" y="2" width="7" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// The countdown is written straight into the DOM every frame (mm:ss:cc, like
// the show), without re-rendering React 60 times a second.
function Countdown({ deadline }) {
  const ref = useRef(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const left = Math.max(deadline - performance.now(), 0);
      const m = Math.floor(left / 60000);
      const s = Math.floor((left % 60000) / 1000);
      const cs = Math.floor((left % 1000) / 10);
      if (ref.current) {
        ref.current.textContent = [m, s, cs].map((n) => String(n).padStart(2, "0")).join(":");
      }
      if (left > 0) frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [deadline]);

  return (
    <Overlay>
      <div className="pointer-events-none fixed top-16 right-4 z-[61] border-2 border-nerv bg-black/90 px-3 py-2 text-right font-mono" role="timer">
        <p className="text-[10px] tracking-[0.3em] text-nerv">内部電源 // INTERNAL POWER</p>
        <p ref={ref} className="font-title text-3xl font-black text-nerv tabular-nums">
          05:00:00
        </p>
        <p className="text-[10px] tracking-[0.2em] text-nerv/70">活動限界まで // UNTIL ACTIVITY LIMIT</p>
      </div>
    </Overlay>
  );
}

function ActivityLimit() {
  useEffect(() => {
    document.documentElement.classList.add("powerless");
    return () => document.documentElement.classList.remove("powerless");
  }, []);

  return (
    <Overlay>
      <div role="alertdialog" aria-label="Activity limit reached" className="fixed inset-0 z-[67] grid place-items-center bg-black/40 p-6 font-mono">
        <div className="text-center">
          <p className="font-title text-6xl font-black text-nerv sm:text-8xl">活動限界</p>
          <p className="mt-2 text-sm tracking-[0.3em] text-nerv">ACTIVITY LIMIT REACHED</p>
          <p className="mt-1 text-xs tracking-[0.3em] text-paper/60">INTERNAL POWER DEPLETED // UNIT SHUT DOWN</p>
          <button
            type="button"
            onClick={plugIn}
            autoFocus
            className="mt-8 border-2 border-nerv px-5 py-2.5 text-sm font-bold tracking-[0.3em] text-nerv transition-colors hover:bg-nerv hover:text-void"
          >
            RECONNECT UMBILICAL CABLE
          </button>
        </div>
      </div>
    </Overlay>
  );
}

export default function Umbilical() {
  const { mode, deadline } = usePower();
  const connected = mode === "external";

  return (
    <>
      <button
        type="button"
        onClick={connected ? unplug : plugIn}
        aria-pressed={!connected}
        title={connected ? "Umbilical cable: connected. Click to unplug." : "Reconnect umbilical cable"}
        className={`relative flex items-center gap-1.5 border px-2 py-1 transition before:absolute before:-inset-y-2.5 before:-inset-x-1 active:scale-95 ${
          connected ? "border-magi/50 hover:border-magi hover:bg-magi/10" : "border-nerv text-nerv hover:bg-nerv/10"
        }`}
      >
        <Plug connected={connected} />
        <span className="sr-only lg:not-sr-only">{connected ? "EXT" : "INT"}</span>
      </button>
      {mode === "internal" && <Countdown deadline={deadline} />}
      {mode === "dead" && <ActivityLimit />}
    </>
  );
}
