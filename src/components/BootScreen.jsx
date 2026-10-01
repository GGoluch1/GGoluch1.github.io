import { useCallback, useEffect, useState } from "react";
import { profile } from "../data/profile";
import { sfx } from "../lib/sound";

const LOG = [
  ["MAGI SYSTEM BOOT SEQUENCE", "INIT"],
  ["第7世代有機コンピュータ // 7TH GEN ORGANIC COMPUTER", "OK"],
  ["LOADING 人格移植OS // PERSONALITY TRANSPLANT OS", "OK"],
  ["MELCHIOR-1 ....... SCIENTIST CORE", "ONLINE"],
  ["BALTHASAR-2 ...... GUARDIAN CORE", "ONLINE"],
  ["CASPER-3 ......... PERSON CORE", "ONLINE"],
  ["CROSS-CHECKING DECISION MATRIX", "OK"],
  ["CENTRAL DOGMA UPLINK", "LINKED"],
  [`LOADING PERSONNEL FILE: ${profile.lastName}, ${profile.firstName[0]}.`, "OK"],
  ["ALL SYSTEMS NOMINAL", "READY"],
];

// How many log lines must be printed before each core lights up.
const CORES = [
  { name: "BALTHASAR·2", at: 5, pos: "col-span-2 mx-auto w-1/2" },
  { name: "CASPER·3", at: 6, pos: "" },
  { name: "MELCHIOR·1", at: 4, pos: "" },
];

// Timings in ms. Returning visitors get the fast version (about a second).
const TIMING = {
  full: { line: 230, settle: 300, hold: 900 },
  fast: { line: 55, settle: 100, hold: 350 },
};

// Random hex dump, generated once when the module loads.
const HEX = Array.from({ length: 24 }, (_, i) => {
  const addr = (0x7f00 + i * 16).toString(16).toUpperCase();
  const bytes = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0").toUpperCase(),
  ).join(" ");
  return `${addr}: ${bytes}`;
});

const METERS = Array.from({ length: 14 }, (_, i) => ({
  delay: `${(i * 137) % 900}ms`,
  duration: `${700 + ((i * 211) % 500)}ms`,
}));

function wavePath(width, period, amp, mid) {
  let d = `M0 ${mid}`;
  for (let x = 2; x <= width; x += 2) {
    d += ` L${x} ${(mid + Math.sin((x / period) * Math.PI * 2) * amp).toFixed(2)}`;
  }
  return d;
}

const WAVES = [
  { period: 60, amp: 14, color: "var(--color-magi)", speed: "1.6s" },
  { period: 40, amp: 9, color: "var(--color-sync)", speed: "1.1s" },
  { period: 90, amp: 18, color: "var(--color-cyan)", speed: "2.4s" },
].map((w) => ({ ...w, d: wavePath(420, w.period, w.amp, 30) }));

function Frame({ label, jp, children, className = "" }) {
  return (
    <div className={`border border-magi/60 bg-panel/80 ${className}`}>
      <div className="flex justify-between border-b border-magi/40 px-2 py-0.5 text-[10px] tracking-widest">
        <span>{label}</span>
        <span className="text-magi/80">{jp}</span>
      </div>
      {children}
    </div>
  );
}

export default function BootScreen({ fast = false, onDone }) {
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState("log"); // log -> ready -> exit
  const timing = fast ? TIMING.fast : TIMING.full;

  // Print log lines one at a time.
  useEffect(() => {
    if (phase !== "log") return;
    if (shown >= LOG.length) {
      const t = setTimeout(() => {
        setPhase("ready");
        sfx.boot();
      }, timing.settle);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setShown((s) => s + 1);
      if (!fast) sfx.tick();
    }, timing.line);
    return () => clearTimeout(t);
  }, [shown, phase, fast, timing]);

  // Hold on "online", then play the CRT switch-off and hand over to the site.
  useEffect(() => {
    if (phase === "ready") {
      const t = setTimeout(() => setPhase("exit"), timing.hold);
      return () => clearTimeout(t);
    }
    if (phase === "exit") {
      const t = setTimeout(onDone, 550);
      return () => clearTimeout(t);
    }
  }, [phase, onDone, timing]);

  const skip = useCallback(() => setPhase("exit"), []);

  useEffect(() => {
    window.addEventListener("keydown", skip);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", skip);
      document.body.style.overflow = prev;
    };
  }, [skip]);

  const progress = Math.round((shown / LOG.length) * 100);
  const amp = 0.15 + 0.85 * (shown / LOG.length);

  return (
    <div
      role="status"
      aria-label="MAGI system booting. Press any key to skip."
      onClick={skip}
      className={`hex-grid fixed inset-0 z-[60] flex cursor-pointer flex-col bg-void ${
        phase === "exit" ? "animate-crt-off" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b-2 border-magi px-4 py-2 text-xs tracking-[0.3em]">
        <span className="font-title font-black text-nerv">NERV</span>
        <span>MAGI SYSTEM // BOOT</span>
        <span className="hidden text-magi/80 sm:inline">人格移植OS</span>
      </div>
      <div className="hazard h-1.5" aria-hidden="true" />

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-4 overflow-hidden p-4 md:grid-cols-[1.3fr_1fr]">
        {/* Boot log */}
        <Frame label="SYSTEM LOG" jp="起動記録" className="flex flex-col">
          <ul className="flex-1 space-y-1.5 p-3 text-xs sm:text-sm">
            {LOG.slice(0, shown).map(([text, status]) => (
              <li key={text} className="flex animate-line-in justify-between gap-4">
                <span className="text-paper/85">&gt; {text}</span>
                <span className={status === "INIT" ? "text-magi" : "text-sync"}>[{status}]</span>
              </li>
            ))}
            {phase === "log" && <li className="animate-blink">█</li>}
          </ul>
          <div className="border-t border-magi/40 p-3">
            <div className="flex justify-between text-[11px] tracking-widest">
              <span>INITIALIZATION</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="mt-1 h-2 border border-magi/50">
              <div
                className="h-full origin-left bg-magi transition-transform duration-200"
                style={{ transform: `scaleX(${progress / 100})` }}
              />
            </div>
          </div>
        </Frame>

        {/* Right column: animated MAGI monitor visuals */}
        <div className="hidden flex-col gap-4 md:flex">
          <Frame label="MAGI CORES" jp="三賢者">
            <div className="grid grid-cols-2 gap-2 p-3">
              {CORES.map((core) => {
                const on = shown >= core.at;
                return (
                  <div
                    key={core.name}
                    className={`clip-panel p-px transition-colors duration-300 ${core.pos} ${
                      on ? "bg-sync" : "bg-magi/50"
                    }`}
                  >
                    <div
                      className={`clip-panel px-2 py-2 text-center text-xs transition-colors duration-300 ${
                        on ? "bg-[#0b1a06] text-sync" : "bg-panel text-magi/80"
                      }`}
                    >
                      <div className="font-title font-black">{core.name}</div>
                      <div className={on ? "animate-stamp" : "animate-blink"} key={String(on)}>
                        {on ? "起動" : "待機"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Frame>

          <Frame label="HARMONICS" jp="波形パターン">
            <svg viewBox="0 0 300 60" className="h-20 w-full overflow-hidden" aria-hidden="true">
              <g
                style={{
                  transform: `scaleY(${amp})`,
                  transformOrigin: "50% 50%",
                  transition: "transform 0.3s",
                }}
              >
                {WAVES.map((w) => (
                  <g key={w.period} className="animate-wave" style={{ "--p": `-${w.period}px`, animationDuration: w.speed }}>
                    <path d={w.d} fill="none" stroke={w.color} strokeWidth="1.2" opacity="0.85" />
                  </g>
                ))}
              </g>
            </svg>
          </Frame>

          <div className="grid flex-1 grid-cols-[1.4fr_1fr] gap-4">
            <Frame label="MEMORY" jp="記憶領域" className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-6 bottom-0 overflow-hidden px-2">
                <div className="animate-scroll-up text-[10px] leading-snug text-magi/80">
                  {[...HEX, ...HEX].map((row, i) => (
                    <div key={i}>{row}</div>
                  ))}
                </div>
              </div>
            </Frame>
            <Frame label="LOAD" jp="負荷" className="flex flex-col">
              <div className="flex flex-1 items-end gap-1 p-2">
                {METERS.map((m, i) => (
                  <span
                    key={i}
                    className="h-full flex-1 origin-bottom animate-meter bg-magi/80"
                    style={{ animationDelay: m.delay, animationDuration: m.duration }}
                  />
                ))}
              </div>
            </Frame>
          </div>
        </div>
      </div>

      <div className="flex min-h-24 flex-col items-center justify-center gap-1 border-t-2 border-magi px-4 py-3">
        {phase === "log" ? (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={skip}
              autoFocus
              className="wipe-fill group border-2 border-magi px-4 py-1.5 text-sm tracking-[0.3em] transition-colors hover:text-void focus-visible:text-void"
            >
              SKIP <span className="inline-block transition-transform group-hover:translate-x-1">▸▸</span>
            </button>
            <span className="hidden text-xs tracking-[0.3em] text-magi/80 sm:inline">OR PRESS ANY KEY</span>
          </div>
        ) : (
          <div className="animate-stamp text-center">
            <div className="font-title text-4xl font-black text-sync glow">起動</div>
            <div className="text-xs tracking-[0.4em] text-sync">MAGI SYSTEM ONLINE</div>
          </div>
        )}
      </div>
    </div>
  );
}
