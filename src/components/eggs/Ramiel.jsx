import { useEffect, useRef, useState } from "react";
import { useLatest } from "../../hooks/useLatest";
import { find, useSeele } from "../../lib/eggs";
import { sfx } from "../../lib/sound";
import Overlay from "../Overlay";

// Seal 7. A tiny blue octahedron hides in the hero's hex grid. Clicking it
// runs Operation Yashima: Japan's power is cut block by block, everything is
// routed to the positron rifle, and the beam takes Ramiel out.

const COLS = 8;
const ROWS = 6;

// Random order for the blackout, then a different one for the lights coming back.
const DELAYS = Array.from({ length: COLS * ROWS }, () => ({ off: Math.random() * 1.1, on: Math.random() * 0.9 }));

function Octahedron({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 1 2 12h10z" fill="#7aa0ff" />
      <path d="M12 1l10 11H12z" fill="var(--color-ramiel)" />
      <path d="M2 12l10 11V12z" fill="#2a4fd6" />
      <path d="M22 12 12 23V12z" fill="#1c3aa8" />
      <path d="M12 1 2 12l10 11 10-11z" fill="none" stroke="#c4d4ff" strokeWidth="0.5" />
    </svg>
  );
}

function Yashima({ target, onDone }) {
  const [phase, setPhase] = useState("dark");
  const done = useLatest(onDone);

  useEffect(() => {
    sfx.powerDown();
    const timers = [
      setTimeout(() => {
        setPhase("charge");
        sfx.charge();
      }, 1700),
      setTimeout(() => {
        setPhase("fire");
        sfx.beam();
      }, 2700),
      setTimeout(() => setPhase("light"), 3300),
      setTimeout(() => done.current(), 4700),
    ];
    return () => timers.forEach(clearTimeout);
  }, [done]);

  // The beam fires from the bottom-left corner (Mt. Futago) at Ramiel.
  const from = { x: window.innerWidth * 0.04, y: window.innerHeight * 0.96 };
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = `${(Math.atan2(dy, dx) * 180) / Math.PI}deg`;
  const dark = phase === "dark" || phase === "charge" || phase === "fire";

  return (
    <Overlay>
      <div className="pointer-events-none fixed inset-0 z-[65]" aria-live="assertive">
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
          {DELAYS.map((d, i) => (
            <div
              key={i}
              className={`bg-black transition-opacity duration-300 ${dark ? "opacity-95" : "opacity-0"}`}
              style={{ transitionDelay: `${dark ? d.off : d.on}s` }}
            />
          ))}
        </div>

        {phase === "fire" && (
          <>
            <div
              className="absolute h-3 origin-left rounded-full bg-[linear-gradient(90deg,#fff,#ffe2a8_30%,var(--color-magi))] shadow-[0_0_30px_8px_rgb(255_138_31/0.7)] [animation:beam_0.25s_ease-out_both]"
              style={{
                left: from.x,
                top: from.y,
                width: length,
                "--a": angle,
                transform: `rotate(${angle})`,
              }}
            />
            <div className="absolute inset-0 animate-[fade-in_0.4s_ease-in_reverse_both] bg-white/80 motion-reduce:hidden" />
          </>
        )}

        <div className="absolute inset-x-0 top-20 text-center">
          <p className="font-title text-3xl font-black text-paper sm:text-5xl">ヤシマ作戦</p>
          <p className="mt-1 text-xs tracking-[0.4em] text-magi">OPERATION YASHIMA</p>
          <p key={phase} className="mt-4 animate-fade-in text-sm tracking-widest text-paper/90">
            {phase === "dark" && "ALL POWER IN JAPAN → POSITRON SNIPER RIFLE"}
            {phase === "charge" && "ENERGY 100% // 撃鉄起こせ"}
            {phase === "fire" && "発射 // FIRE"}
            {phase === "light" && "目標 殲滅 // TARGET DESTROYED"}
          </p>
        </div>
      </div>
    </Overlay>
  );
}

export default function Ramiel({ className = "" }) {
  const seele = useSeele();
  const ref = useRef(null);
  const [target, setTarget] = useState(null);

  if (seele.found.has("ramiel") && !target) return null;

  const fire = () => {
    const r = ref.current.getBoundingClientRect();
    setTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        tabIndex={-1}
        aria-label="Ramiel"
        onClick={fire}
        disabled={Boolean(target)}
        className={`absolute grid size-10 place-items-center [perspective:200px] ${className}`}
      >
        <Octahedron
          className={`size-5 animate-spin-y drop-shadow-[0_0_6px_var(--color-ramiel)] transition-opacity duration-300 ${
            target ? "opacity-0 delay-[3000ms]" : "opacity-50 hover:opacity-100"
          }`}
        />
      </button>
      {target && (
        <Yashima
          target={target}
          onDone={() => {
            setTarget(null);
            find("ramiel");
          }}
        />
      )}
    </>
  );
}
