import { useEffect, useRef, useState } from "react";
import { endScenario } from "../../lib/eggs";
import { sfx } from "../../lib/sound";
import Overlay from "../Overlay";

// Pulling the Lance starts Third Impact: LCL floods the screen and the page
// melts, everything goes white, the whole cast congratulates you (episode 26),
// and the final title card hands over the secret link.

// Kept encoded so it isn't sitting in the source as a plain URL.
const SECRET = atob("aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1vNnd0RFBWa0txSQ==");

const CAST = [
  "MISATO", "ASUKA", "REI", "TOJI", "KENSUKE", "HIKARI", "RITSUKO", "KAJI",
  "MAYA", "SHIGERU", "MAKOTO", "FUYUTSUKI", "KAWORU", "PEN PEN", "YUI", "GENDO",
];

// Where each "congratulations" pops up, in % of the screen, around the centre.
const SPOTS = [
  [12, 14], [42, 8], [72, 13], [88, 30], [8, 36], [90, 52], [14, 62], [86, 74],
  [30, 82], [60, 86], [6, 86], [46, 28], [24, 30], [70, 28], [36, 66], [62, 68],
];

const CARD = [
  ["父に、ありがとう", "TO MY FATHER, THANK YOU"],
  ["母に、さようなら", "TO MY MOTHER, FAREWELL"],
  ["そして、全ての子供達に", "AND TO ALL THE CHILDREN"],
  ["おめでとう", "CONGRATULATIONS"],
];

export default function ThirdImpact({ onReturn }) {
  const [phase, setPhase] = useState("flood"); // flood | lcl | white | congrats | card
  const cardRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add("instrumentality");
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sfx.flood();
    return () => {
      document.documentElement.classList.remove("instrumentality");
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    const next = { flood: ["lcl", 1900], lcl: ["white", 2600], white: ["congrats", 900], congrats: ["card", 5600] }[phase];
    if (phase === "congrats") sfx.applause();
    if (phase === "card") {
      endScenario();
      cardRef.current?.focus();
    }
    if (!next) return;
    const t = setTimeout(() => setPhase(next[0]), next[1]);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && phase === "card" && onReturn();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onReturn]);

  return (
    <Overlay>
      <div role="dialog" aria-modal="true" aria-label="Third Impact" className="fixed inset-0 z-[68] overflow-hidden font-mono">
        {(phase === "flood" || phase === "lcl") && (
          <div className="absolute inset-0 animate-flood bg-[linear-gradient(to_top,#8a2e00,var(--color-magi)_50%,#ffb347)]">
            {Array.from({ length: 22 }, (_, i) => (
              <span
                key={i}
                className="absolute bottom-0 animate-bubble rounded-full border border-paper/60"
                style={{
                  left: `${(i * 41) % 100}%`,
                  width: `${5 + ((i * 11) % 18)}px`,
                  height: `${5 + ((i * 11) % 18)}px`,
                  animationDelay: `${(i * 0.19) % 2.6}s`,
                }}
              />
            ))}
            {phase === "lcl" && (
              <div className="absolute inset-0 grid animate-fade-in place-items-center p-6 text-center text-void">
                <div>
                  <p className="text-sm tracking-[0.4em]">A.T. FIELD // 0%</p>
                  <p className="mt-4 font-title text-3xl font-black sm:text-6xl">人類補完計画</p>
                  <p className="mt-2 text-sm tracking-[0.3em]">HUMAN INSTRUMENTALITY PROJECT</p>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === "white" && <div className="absolute inset-0 animate-[fade-in_0.8s_ease-in_both] bg-white" />}

        {phase === "congrats" && (
          <div className="absolute inset-0 bg-[linear-gradient(#3f9fe4,#bfe6ff_62%,#f4fbff)]">
            {CAST.map((name, i) => (
              <div
                key={name}
                className="absolute -translate-x-1/2 animate-pop text-center text-void"
                style={{ left: `${SPOTS[i][0]}%`, top: `${SPOTS[i][1]}%`, animationDelay: `${0.2 + i * 0.28}s` }}
              >
                <p className="font-title text-lg font-black sm:text-2xl">おめでとう</p>
                <p className="text-[10px] tracking-[0.3em]">— {name}</p>
              </div>
            ))}
            <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 animate-pop text-center font-title text-4xl font-black text-paper [text-shadow:0_2px_0_#1d4f80] sm:text-7xl">
              CONGRATULATIONS!
            </p>
          </div>
        )}

        {phase === "card" && (
          <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-black p-6">
            <div ref={cardRef} tabIndex={-1} className="text-center outline-none">
              {CARD.map(([jp, en], i) => (
                <div key={jp} className="mb-6 animate-[fade-in_1.2s_ease-out_both]" style={{ animationDelay: `${0.3 + i * 1.1}s` }}>
                  <p className="font-title text-3xl font-black text-paper sm:text-5xl">{jp}</p>
                  <p className="mt-1 text-[11px] tracking-[0.4em] text-paper/60">{en}</p>
                </div>
              ))}
              <div className="mt-10 flex animate-[fade-in_1s_ease-out_both] flex-col items-center gap-4 [animation-delay:5s]">
                <a
                  href={SECRET}
                  target="_blank"
                  rel="noreferrer"
                  data-goatcounter-click="secret-thesis"
                  className="sheen bg-magi px-6 py-3 font-bold text-void shadow-[4px_4px_0_var(--color-nerv)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-nerv)]"
                >
                  <span className="block font-title text-xl font-black">▶ 残酷な天使のテーゼ</span>
                  <span className="block text-[10px] tracking-[0.3em]">A CRUEL ANGEL&apos;S THESIS</span>
                </a>
                <button
                  type="button"
                  onClick={onReturn}
                  className="border-2 border-paper/40 px-4 py-2 text-xs tracking-[0.3em] text-paper/80 transition-colors hover:border-paper hover:text-paper"
                >
                  ↺ RETURN TO THE WORLD
                </button>
                <p className="mt-6 font-title text-2xl font-black text-nerv">終劇</p>
              </div>
            </div>
          </div>
        )}

        {phase !== "card" && (
          <button
            type="button"
            onClick={() => setPhase("card")}
            className="absolute right-4 bottom-4 border border-current px-3 py-1 text-xs tracking-[0.3em] text-void/70 hover:text-void"
          >
            SKIP ▸▸
          </button>
        )}
      </div>
    </Overlay>
  );
}
