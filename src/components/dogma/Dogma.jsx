import { useCallback, useEffect, useRef, useState } from "react";
import { useHold } from "../../hooks/useHold";
import { useInView } from "../../hooks/useInView";
import { useLatest } from "../../hooks/useLatest";
import { useSeele } from "../../lib/eggs";
import { sfx, startHum, useSound } from "../../lib/sound";
import Lilith, { LANCE_DIR } from "./Lilith";
import ThirdImpact from "./ThirdImpact";

// The hidden page under the footer, unlocked by breaking all seven seals.
// Loaded as its own chunk (see App.jsx), so regular visitors never download it.

const clamp = (v, lo = 0, hi = 1) => Math.min(Math.max(v, lo), hi);

// Writes how far the visitor has scrolled through `ref` (0 to 1) into a CSS
// variable on it, without re-rendering React on every scroll event.
function useScrollProgress(ref, name, onChange) {
  const changeRef = useLatest(onChange);

  useEffect(() => {
    const el = ref.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(r.height - window.innerHeight, 1));
      el.style.setProperty(name, p.toFixed(4));
      changeRef.current?.(p);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, name, changeRef]);
}

const STAGES = [
  [0, "ジオフロント // GEOFRONT"],
  [0.33, "セントラルドグマ // CENTRAL DOGMA"],
  [0.66, "ターミナルドグマ // TERMINAL DOGMA"],
];

function DoorHalf({ side }) {
  const left = side === "left";
  return (
    <div
      className={`relative h-full w-1/2 overflow-hidden border-magi/70 bg-[#121015] ${left ? "border-r-4" : "border-l-4"}`}
      style={{ transform: `translateX(calc(clamp(0, (var(--p) - 0.84) * 6.25, 1) * ${left ? -102 : 102}%))` }}
    >
      <div className="absolute inset-y-0 w-3 hazard" style={left ? { right: 0 } : { left: 0 }} />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0_46px,rgb(255_138_31/0.12)_46px_48px)]" />
      <div className={`absolute top-1/2 w-[200%] -translate-y-1/2 text-center ${left ? "left-0" : "right-0"}`}>
        <p className="font-title text-4xl font-black tracking-tight text-paper sm:text-6xl">HEAVEN&apos;S DOOR</p>
        <p className="mt-2 text-xs tracking-[0.5em] text-magi/80">ヘブンズドア // 最終隔壁</p>
      </div>
    </div>
  );
}

function Descent() {
  const ref = useRef(null);
  const depthRef = useRef(null);
  const stageRef = useRef(null);

  useScrollProgress(ref, "--p", (p) => {
    depthRef.current.textContent = `-${String(Math.round(700 + p * 1300)).padStart(4, "0")} m`;
    stageRef.current.textContent = STAGES.findLast(([at]) => p >= at)[1];
  });

  return (
    <div ref={ref} className="relative h-[320vh] [--p:0]">
      <div className="sticky top-0 h-svh overflow-hidden bg-[#050003]">
        {/* Shaft walls sliding past */}
        {["left-0", "right-0"].map((side) => (
          <div
            key={side}
            className={`absolute inset-y-0 ${side} w-[16%] border-magi/30 bg-[repeating-linear-gradient(to_bottom,transparent_0_150px,rgb(255_138_31/0.5)_150px_152px,transparent_152px_260px)] ${
              side === "left-0" ? "border-r" : "border-l"
            }`}
            style={{ backgroundPositionY: "calc(var(--p) * -3200px)" }}
          />
        ))}

        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 text-center"
          style={{ opacity: "calc(1 - var(--p) * 12)" }}
        >
          <p className="animate-blink text-xs tracking-[0.4em] text-magi">▼ DESCENDING ▼</p>
        </div>

        {/* Depth readout */}
        <div
          className="absolute top-1/2 left-[19%] -translate-y-1/2"
          style={{ opacity: "calc(1 - clamp(0, (var(--p) - 0.7) * 5, 1))" }}
        >
          <p className="text-[10px] tracking-[0.4em] text-magi/80">DEPTH // 深度</p>
          <p ref={depthRef} className="font-title text-4xl font-black text-paper tabular-nums sm:text-6xl">
            -0700 m
          </p>
          <p ref={stageRef} className="mt-2 text-xs tracking-[0.3em] text-magi">
            {STAGES[0][1]}
          </p>
        </div>

        {/* Heaven's Door: appears near the bottom, then slides open */}
        <div
          className="absolute inset-0 grid place-items-center"
          style={{
            opacity: "clamp(0, (var(--p) - 0.6) * 5, 1)",
            transform: "scale(calc(0.8 + clamp(0, (var(--p) - 0.6) * 2.5, 1) * 0.2))",
          }}
        >
          <div className="relative h-[min(70svh,620px)] w-[min(560px,84vw)] overflow-hidden border-4 border-magi/70">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgb(238_28_51/0.6),transparent_70%)]" />
            <div className="absolute inset-y-0 left-1/2 w-[10%] -translate-x-1/2 bg-nerv/50" />
            <div className="absolute inset-x-0 top-[18%] h-[6%] bg-nerv/50" />
            <div className="relative flex h-full">
              <DoorHalf side="left" />
              <DoorHalf side="right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PULL_SECONDS = 2.8;

const ENDINGS = [
  ["tv", "第26話 // TV"],
  ["eoe", "劇場版 // THE END OF EVANGELION"],
];

function Chamber() {
  const ref = useRef(null);
  const lanceRef = useRef(null);
  const cracksRef = useRef(null);
  const barRef = useRef(null);
  const pull = useRef(0);
  // Not latched: the hum stops when you scroll away, and the eyes re-open when you come back.
  const [inViewRef, inView] = useInView(0.35, { once: false });
  const [warning, setWarning] = useState(false);
  const [impact, setImpact] = useState(null); // the ending playing, fixed when the Lance comes out
  const sound = useSound();
  const seele = useSeele();
  // The TV ending comes first. After it, the next pull defaults to End of
  // Evangelion, and the visitor can pick either.
  const [choice, setChoice] = useState(null);
  const ending = choice ?? (seele.ended && !seele.eoe ? "eoe" : "tv");

  useScrollProgress(ref, "--q");

  useEffect(() => {
    if (!inView || !sound || impact) return;
    return startHum();
  }, [inView, sound, impact]);

  const draw = useCallback((p) => {
    const d = p * 280;
    const shake = p > 0.05 && p < 1 ? (Math.random() - 0.5) * 4 * p : 0;
    lanceRef.current?.setAttribute("transform", `translate(${LANCE_DIR.x * d + shake} ${LANCE_DIR.y * d + shake})`);
    cracksRef.current?.setAttribute("opacity", String(clamp((p - 0.45) * 2.2)));
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
  }, []);

  const hold = useHold((dt, holding) => {
    if (impact) return false;
    const before = pull.current;
    pull.current = clamp(before + (holding ? dt / PULL_SECONDS : -dt / 1.2));
    draw(pull.current);
    if (Math.floor(pull.current * 10) > Math.floor(before * 10)) sfx.tick();
    setWarning(pull.current > 0.55);
    if (pull.current >= 1) {
      setImpact(ending);
      return false;
    }
    return pull.current > 0;
  });

  const goHome = useCallback(() => {
    pull.current = 0;
    draw(0);
    setWarning(false);
    setImpact(null);
    setChoice(null);
  }, [draw]);

  return (
    <div ref={ref} className="relative h-[170vh] [--q:0]">
      <div ref={inViewRef} className="sticky top-0 h-svh overflow-hidden bg-[#050003]">
        <div
          className="absolute inset-0"
          style={{ transform: "scale(calc(1.14 - var(--q) * 0.14)) translateY(calc((1 - var(--q)) * 3%))" }}
        >
          <Lilith ref={lanceRef} cracksRef={cracksRef} eyesOpen={inView} />
        </div>

        <div className="absolute top-16 left-4 text-xs tracking-[0.3em] sm:left-6">
          <p className="text-magi">TERMINAL DOGMA // ターミナルドグマ</p>
          <p className="mt-1 text-magi/80">HEAVEN&apos;S DOOR // OPEN</p>
          <p className="mt-1 text-magi/80 sm:hidden">第2使徒 // LILITH</p>
        </div>

        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center px-4 text-center sm:bottom-8">
          <p className="font-title text-lg font-black text-paper sm:text-2xl">そうか、そういうことか。リリン。</p>
          <p className="mt-1 text-[10px] tracking-[0.3em] text-paper/60">I SEE. SO THAT&apos;S HOW IT IS, LILIN.</p>
          <button
            type="button"
            {...hold}
            className="relative mt-5 w-full max-w-sm touch-none overflow-hidden border-2 border-nerv bg-black/70 py-3 text-sm font-bold tracking-[0.3em] text-nerv select-none"
          >
            <span ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-nerv/40" aria-hidden="true" />
            <span className="relative">{warning ? "ANTI-A.T. FIELD DETECTED" : "HOLD TO PULL THE LANCE"}</span>
          </button>
          {seele.ended && (
            <div
              className="mt-3 flex flex-wrap justify-center gap-2 text-[10px] tracking-[0.2em]"
              role="group"
              aria-label="Ending"
            >
              {ENDINGS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setChoice(id)}
                  aria-pressed={ending === id}
                  className={`border px-2 py-1 transition-colors ${
                    ending === id ? "border-nerv bg-nerv/20 text-paper" : "border-nerv/50 text-nerv hover:border-nerv"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {impact && <ThirdImpact ending={impact} onReturn={goHome} />}
    </div>
  );
}

export default function Dogma() {
  return (
    <section id="dogma" tabIndex={-1} aria-label="Terminal Dogma" className="outline-none">
      <div className="h-4 hazard" aria-hidden="true" />
      <Descent />
      <Chamber />
    </section>
  );
}
