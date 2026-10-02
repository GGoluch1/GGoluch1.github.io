import { useEffect, useRef, useState } from "react";
import { find } from "../../lib/eggs";
import { sfx } from "../../lib/sound";
import { useHold } from "../../hooks/useHold";
import { useLatest } from "../../hooks/useLatest";
import Modal from "../Modal";
import Overlay from "../Overlay";

// Seals 1 and 2. Tapping the SIXTH CHILD tag summons the Commander:
// "Then get in. Or leave." Refusing to run away starts a sync test; holding
// pushes the ratio to 400%, and the pilot dissolves into LCL like Shinji.

const BASE = 41.3;

function syncStatus(ratio) {
  if (ratio < 100) return ["SYNCHRONIZING", "text-magi"];
  if (ratio < 200) return ["ABOVE PREDICTED VALUE", "text-sync"];
  if (ratio < 300) return ["WARNING // EGO BORDER DEGRADING", "text-amber"];
  return ["DANGER // PILOT CONTAMINATION", "text-nerv"];
}

function Offer({ onLeave, onAccept }) {
  return (
    <>
      <div className="flex justify-between bg-nerv px-4 py-1 text-xs tracking-widest text-void">
        <span>NERV // CAGE 7 // 第7ケイジ</span>
        <span>初号機</span>
      </div>
      <div className="p-6 sm:p-8">
        <p className="text-xs tracking-[0.3em] text-magi/80">碇ゲンドウ // COMMANDER IKARI</p>
        <p className="mt-4 font-title text-4xl leading-tight font-black text-paper sm:text-5xl">
          Then get in.
          <br />
          <span className="text-nerv">Or leave.</span>
        </p>
        <p className="mt-4 text-xs tracking-widest text-paper/60">EVANGELION UNIT-01 // AWAITING PILOT</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onLeave}
            className="border-2 border-magi/60 px-4 py-2 text-sm tracking-widest transition-colors hover:border-magi hover:text-paper"
          >
            LEAVE
          </button>
          <button
            type="button"
            onClick={onAccept}
            data-autofocus
            className="bg-magi px-4 py-2 text-sm font-bold tracking-widest text-void shadow-[4px_4px_0_var(--color-nerv)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-nerv)]"
          >
            I MUSTN&apos;T RUN AWAY ▸
          </button>
        </div>
      </div>
    </>
  );
}

function SyncTest({ onComplete }) {
  const [ratio, setRatio] = useState(BASE);
  const value = useRef(BASE);
  const lastTick = useRef(BASE);
  const done = useRef(false);

  const hold = useHold((dt, holding) => {
    if (done.current) return false;
    let r = value.current;
    if (holding) r += (r < 100 ? 45 : 70 + (r - 100) * 0.55) * dt;
    else r = Math.max(BASE, r - 90 * dt);
    value.current = r;
    setRatio(r);

    if (Math.floor(r / 20) !== Math.floor(lastTick.current / 20)) sfx.tick();
    lastTick.current = r;

    if (r >= 400) {
      done.current = true;
      onComplete();
      return false;
    }
    return r > BASE;
  });

  const [status, tone] = syncStatus(ratio);
  const shown = Math.min(ratio, 400);

  return (
    <>
      <div className="flex justify-between bg-magi px-4 py-1 text-xs tracking-widest text-void">
        <span>ENTRY PLUG // SYNC TEST</span>
        <span>シンクロテスト</span>
      </div>
      <div className="p-6 sm:p-8">
        <p className="text-xs tracking-[0.3em] text-magi/80">SYNCHRONIZATION RATIO // シンクロ率</p>
        <p className={`mt-2 font-title text-6xl font-black tabular-nums sm:text-7xl ${tone} ${ratio >= 300 ? "animate-shake" : ""}`}>
          {shown.toFixed(1)}%
        </p>
        <p className={`mt-2 text-xs tracking-widest ${tone}`} aria-live="polite">
          {status}
        </p>

        <div className="relative mt-6 h-3 border border-magi/50">
          <div
            className={`h-full origin-left ${ratio >= 300 ? "bg-nerv" : ratio >= 100 ? "bg-sync" : "bg-magi"}`}
            style={{ transform: `scaleX(${shown / 400})` }}
          />
          {[100, 200, 300].map((m) => (
            <span key={m} className="absolute inset-y-0 w-px bg-paper/40" style={{ left: `${m / 4}%` }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-magi/60">
          <span>0</span>
          <span>100</span>
          <span>200</span>
          <span>300</span>
          <span>400</span>
        </div>

        <button
          type="button"
          {...hold}
          autoFocus
          className="mt-8 w-full touch-none border-2 border-magi py-4 text-sm font-bold tracking-[0.3em] select-none transition-colors active:bg-magi active:text-void"
        >
          HOLD TO SYNCHRONIZE
        </button>
        <p className="mt-2 text-center text-[10px] tracking-widest text-magi/60">RELEASE TO ABORT</p>
      </div>
    </>
  );
}

// Shinji at 400%: the screen fills with LCL, then he's salvaged a month later.
function LclFlood({ onDone }) {
  const [step, setStep] = useState(0);
  const done = useLatest(onDone);

  useEffect(() => {
    sfx.flood();
    const timers = [
      setTimeout(() => setStep(1), 1600),
      setTimeout(() => setStep(2), 3300),
      setTimeout(() => done.current(), 4600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [done]);

  return (
    <Overlay>
      <div className="fixed inset-0 z-[65] overflow-hidden" aria-live="assertive">
        <div
          className={`absolute inset-0 animate-flood bg-[linear-gradient(to_top,#b34400,var(--color-magi)_55%,#ffb347)] transition-opacity duration-1000 ${
            step === 2 ? "opacity-0" : "opacity-95"
          }`}
        >
          {Array.from({ length: 16 }, (_, i) => (
            <span
              key={i}
              className="absolute bottom-0 animate-bubble rounded-full border border-paper/60"
              style={{
                left: `${(i * 37) % 100}%`,
                width: `${6 + ((i * 7) % 14)}px`,
                height: `${6 + ((i * 7) % 14)}px`,
                animationDelay: `${(i * 0.23) % 2.4}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          {step === 0 && (
            <p key="a" className="animate-fade-in font-title text-3xl font-black text-void sm:text-5xl">
              シンクロ率 400%
            </p>
          )}
          {step === 1 && (
            <div key="b" className="animate-fade-in text-void">
              <p className="font-title text-3xl font-black sm:text-5xl">PILOT ABSORBED</p>
              <p className="mt-2 text-sm tracking-[0.3em]">EGO BORDER LOST // 自我境界 喪失</p>
            </div>
          )}
          {step === 2 && (
            <div key="c" className="animate-fade-in text-paper">
              <p className="font-title text-3xl font-black sm:text-5xl">SALVAGE COMPLETE</p>
              <p className="mt-2 text-sm tracking-[0.3em]">31 DAYS LATER // サルベージ計画</p>
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}

// Lives inside the dialog, so it starts fresh on the offer every time it opens.
function Cage({ onClose, onComplete }) {
  const [screen, setScreen] = useState("offer");
  useEffect(() => {
    find("gendo");
  }, []);

  return screen === "offer" ? (
    <Offer onLeave={onClose} onAccept={() => setScreen("sync")} />
  ) : (
    <SyncTest onComplete={onComplete} />
  );
}

export default function GendoDialog({ open, onClose }) {
  const [flood, setFlood] = useState(false);

  const complete = () => {
    onClose();
    setFlood(true);
  };

  const floodDone = () => {
    setFlood(false);
    find("sync");
  };

  return (
    <>
      <Modal open={open} onClose={onClose} label="Commander Ikari" className="w-[34rem]">
        <Cage onClose={onClose} onComplete={complete} />
      </Modal>
      {flood && <LclFlood onDone={floodDone} />}
    </>
  );
}
