import { useEffect, useState } from "react";
import { useLatest } from "../../hooks/useLatest";
import { sfx } from "../../lib/sound";
import Overlay from "../Overlay";

// Seal 7's payoff, Operation Yashima: Japan's power is cut block by block,
// everything is routed to the positron rifle, and the beam takes Ramiel out.
// Loaded on demand by Ramiel.jsx.

const COLS = 8;
const ROWS = 6;

// Random order for the blackout, then a different one for the lights coming back.
const DELAYS = Array.from({ length: COLS * ROWS }, () => ({ off: Math.random() * 1.1, on: Math.random() * 0.9 }));

export default function Yashima({ target, onDone }) {
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
        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
        >
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
              className="absolute h-3 origin-left [animation:beam_0.25s_ease-out_both] rounded-full bg-[linear-gradient(90deg,#fff,#ffe2a8_30%,var(--color-magi))] shadow-[0_0_30px_8px_rgb(255_138_31/0.7)]"
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
