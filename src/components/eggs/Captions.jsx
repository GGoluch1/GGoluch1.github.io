import { useEffect } from "react";
import { useLatest } from "../../hooks/useLatest";
import { sfx, soundOn } from "../../lib/sound";
import Overlay from "../Overlay";

// Short full-screen moments for the Asuka and Kaworu seals.

function useTimeout(ms, onDone) {
  const done = useLatest(onDone);
  useEffect(() => {
    const t = setTimeout(() => done.current(), ms);
    return () => clearTimeout(t);
  }, [ms, done]);
}

// Seal 5: "Anta baka?!" stamped across the screen in Unit-02 red.
export function AsukaStamp({ onDone }) {
  useTimeout(2600, onDone);
  useEffect(() => sfx.asuka(), []);

  return (
    <Overlay>
      <div
        className="pointer-events-none fixed inset-0 z-[65] grid place-items-center overflow-hidden bg-nerv/15"
        aria-live="assertive"
      >
        <div className="animate-pop text-center">
          <p className="rotate-[-7deg] animate-shake font-title text-6xl font-black text-nerv [-webkit-text-stroke:2px_var(--color-paper)] sm:text-9xl">
            あんたバカぁ？！
          </p>
          <p className="mt-6 inline-block rotate-[-3deg] bg-nerv px-3 py-1 text-sm tracking-[0.3em] text-void">
            ANTA BAKA?! // ARE YOU STUPID?!
          </p>
        </div>
      </div>
    </Overlay>
  );
}

const NOTES = ["♪", "♫", "♪", "♬", "♩", "♫", "♪", "♬"];

// Seal 4: Kaworu hums Ode to Joy.
export function KaworuSong({ onDone }) {
  useTimeout(8000, onDone);
  const quiet = !soundOn();
  useEffect(() => sfx.ode(), []);

  return (
    <Overlay>
      <div
        className="pointer-events-none fixed inset-0 z-[65] grid animate-fade-in place-items-center bg-black/60 p-6"
        aria-live="assertive"
      >
        {NOTES.map((n, i) => (
          <span
            key={i}
            className="absolute bottom-1/4 animate-rise text-3xl text-paper/80"
            style={{ left: `${10 + i * 11}%`, animationDelay: `${i * 0.6}s`, animationIterationCount: 2 }}
          >
            {n}
          </span>
        ))}
        <div className="text-center">
          <p className="text-xs tracking-[0.4em] text-paper/60">渚カヲル // THE FIFTH CHILD</p>
          <p className="mt-4 font-title text-5xl font-black text-paper sm:text-7xl">歌はいいね。</p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-paper/85">
            Song is good. It&apos;s the greatest thing Lilin culture has made.
          </p>
          {quiet && <p className="mt-6 text-[10px] tracking-[0.3em] text-magi/80">♪ TURN SOUND ON TO HEAR HIM HUM</p>}
        </div>
      </div>
    </Overlay>
  );
}
