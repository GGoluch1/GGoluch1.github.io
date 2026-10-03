import { useEffect, useRef, useState } from "react";
import { useLatest } from "../../hooks/useLatest";
import { endScenario } from "../../lib/eggs";
import { sdat } from "../../lib/sdat";
import { sfx } from "../../lib/sound";
import Lcl from "../Lcl";
import Overlay from "../Overlay";
import RedSea from "./RedSea";

// Pulling the Lance starts Third Impact: LCL floods the screen and the page
// melts. Then one of two endings:
//   tv  - everything goes white, the whole cast congratulates you (episode 26),
//         and the final title card hands over the secret link.
//   eoe - the red sea and the beach from The End of Evangelion.
// It's a native modal <dialog>, so focus moves into it, Escape skips ahead,
// and the page's keyboard shortcuts stay quiet while it runs.

// Kept encoded so it isn't sitting in the source as a plain URL.
const SECRET = atob("aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1vNnd0RFBWa0txSQ==");

// prettier-ignore
const CAST = [
  "MISATO", "ASUKA", "REI", "TOJI", "KENSUKE", "HIKARI", "RITSUKO", "KAJI",
  "MAYA", "SHIGERU", "MAKOTO", "FUYUTSUKI", "KAWORU", "PEN PEN", "YUI", "GENDO",
];

// Where each "congratulations" pops up, in % of the screen, around the centre.
// prettier-ignore
const SPOTS = [
  [12, 14], [42, 8], [72, 13], [88, 30], [8, 36], [90, 52], [14, 62], [86, 74],
  [30, 82], [60, 86], [6, 86], [46, 28], [24, 30], [70, 28], [36, 66], [62, 68],
];

const CARDS = {
  tv: [
    ["父に、ありがとう", "TO MY FATHER, THANK YOU"],
    ["母に、さようなら", "TO MY MOTHER, FAREWELL"],
    ["そして、全ての子供達に", "AND TO ALL THE CHILDREN"],
    ["おめでとう", "CONGRATULATIONS"],
  ],
  eoe: [
    ["Air", "EPISODE 25'"],
    ["まごころを、君に", "EPISODE 26' // MY PUREST HEART FOR YOU"],
  ],
};

// Each phase, and how long it lasts before the next one (ms).
const STEPS = {
  tv: { flood: ["lcl", 1900], lcl: ["white", 2600], white: ["congrats", 900], congrats: ["card", 5600] },
  eoe: { flood: ["lcl", 1900], lcl: ["sea", 2600], sea: ["card", 11000] },
};

export default function ThirdImpact({ ending = "tv", onReturn }) {
  const [phase, setPhase] = useState("flood"); // flood | lcl | white | congrats | sea | card
  const dialogRef = useRef(null);
  const cardRef = useRef(null);
  const returnRef = useLatest(onReturn);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add("instrumentality");
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sdat.stop(); // the earphones come out: a playing S-DAT mutes every other sound
    sfx.flood();
    return () => {
      document.documentElement.classList.remove("instrumentality");
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    const next = STEPS[ending][phase];
    if (phase === "congrats") sfx.applause();
    if (phase === "card") {
      endScenario(ending);
      cardRef.current?.focus();
    }
    if (!next) return;
    const t = setTimeout(() => setPhase(next[0]), next[1]);
    return () => clearTimeout(t);
  }, [phase, ending]);

  // Escape skips to the final card, then returns to the world.
  const onCancel = (e) => {
    e.preventDefault();
    if (phase === "card") onReturn();
    else setPhase("card");
  };

  return (
    <Overlay>
      <dialog
        ref={dialogRef}
        aria-label={ending === "eoe" ? "The End of Evangelion" : "Third Impact"}
        onCancel={onCancel}
        // Browsers can close a dialog on their own (a second Escape, for one).
        onClose={() => returnRef.current()}
        className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 font-mono backdrop:bg-transparent"
      >
        {(phase === "flood" || phase === "lcl") && (
          <Lcl bubbles={22}>
            {phase === "lcl" && (
              <div className="absolute inset-0 grid animate-fade-in place-items-center p-6 text-center text-void">
                <div>
                  <p className="text-sm tracking-[0.4em]">A.T. FIELD // 0%</p>
                  <p className="mt-4 font-title text-3xl font-black sm:text-6xl">人類補完計画</p>
                  <p className="mt-2 text-sm tracking-[0.3em]">HUMAN INSTRUMENTALITY PROJECT</p>
                </div>
              </div>
            )}
          </Lcl>
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

        {phase === "sea" && <RedSea />}

        {phase === "card" && (
          <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-black p-6">
            <div ref={cardRef} tabIndex={-1} className="text-center outline-none">
              {CARDS[ending].map(([jp, en], i) => (
                <div
                  key={jp}
                  className="mb-6 animate-[fade-in_1.2s_ease-out_both]"
                  style={{ animationDelay: `${0.3 + i * 1.1}s` }}
                >
                  <p className="font-title text-3xl font-black text-paper sm:text-5xl">{jp}</p>
                  <p className="mt-1 text-[11px] tracking-[0.4em] text-paper/60">{en}</p>
                </div>
              ))}
              <div
                className="mt-10 flex animate-[fade-in_1s_ease-out_both] flex-col items-center gap-4"
                style={{ animationDelay: `${CARDS[ending].length + 0.6}s` }}
              >
                {ending === "tv" && (
                  <a
                    href={SECRET}
                    target="_blank"
                    rel="noreferrer"
                    data-goatcounter-click="secret-thesis"
                    className="sheen btn-primary px-6 py-3"
                  >
                    <span className="block font-title text-xl font-black">▶ 残酷な天使のテーゼ</span>
                    <span className="block text-[10px] tracking-[0.3em]">A CRUEL ANGEL&apos;S THESIS</span>
                  </a>
                )}
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
            className={`absolute right-4 bottom-4 border border-current px-3 py-1 text-xs tracking-[0.3em] ${
              phase === "sea" ? "text-paper/70 hover:text-paper" : "text-void/70 hover:text-void"
            }`}
          >
            SKIP ▸▸
          </button>
        )}
      </dialog>
    </Overlay>
  );
}
