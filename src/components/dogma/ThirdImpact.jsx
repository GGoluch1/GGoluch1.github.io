import { useEffect, useRef, useState } from "react";
import { useLatest } from "../../hooks/useLatest";
import { endScenario } from "../../lib/eggs";
import { sdat } from "../../lib/sdat";
import { sfx } from "../../lib/sound";
import { startThesis } from "../../lib/thesis";
import Lcl from "../Lcl";
import Overlay from "../Overlay";
import Congratulations, { SHATTER_AT } from "./Congratulations";
import RedSea from "./RedSea";

// Pulling the Lance starts Third Impact: LCL floods the screen and the page
// melts. Then one of two endings:
//   tv  - the end of episode 26: the world shatters and the whole cast
//         congratulates Shinji to a piano "Cruel Angel's Thesis"
//         (Congratulations.jsx), then the final title card hands over the
//         secret link. The music keeps playing under the card.
//   eoe - the red sea and the beach from The End of Evangelion.
// It's a native modal <dialog>, so focus moves into it, Escape skips ahead,
// and the page's keyboard shortcuts stay quiet while it runs.

// Kept encoded so it isn't sitting in the source as a plain URL.
const SECRET = atob("aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1vNnd0RFBWa0txSQ==");

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

// Each phase, and how long it lasts before the next one (ms). The
// congratulations scene moves on to the card by itself when it ends.
const STEPS = {
  tv: { flood: ["lcl", 1900], lcl: ["scene", 2600] },
  eoe: { flood: ["lcl", 1900], lcl: ["sea", 2600], sea: ["card", 11000] },
};

export default function ThirdImpact({ ending = "tv", onReturn }) {
  const [phase, setPhase] = useState("flood"); // flood | lcl | scene | sea | card
  const dialogRef = useRef(null);
  const cardRef = useRef(null);
  const returnRef = useLatest(onReturn);
  const phaseRef = useLatest(phase);

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

  // The piano starts when the glass breaks, or right away if the scene was
  // skipped, and plays on under the card until the visitor returns.
  const music = ending === "tv" && (phase === "scene" || phase === "card");
  useEffect(() => {
    if (!music) return;
    return startThesis(phaseRef.current === "scene" ? SHATTER_AT : 0.3);
  }, [music, phaseRef]);

  useEffect(() => {
    const next = STEPS[ending][phase];
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

        {phase === "scene" && <Congratulations onDone={() => setPhase("card")} />}

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
            className={`absolute right-4 bottom-4 z-10 border border-current px-3 py-1 text-xs tracking-[0.3em] ${
              phase === "sea"
                ? "text-paper/70 hover:text-paper"
                : phase === "scene"
                  ? "bg-black/40 text-paper/80 hover:text-paper"
                  : "text-void/70 hover:text-void"
            }`}
          >
            SKIP ▸▸
          </button>
        )}
      </dialog>
    </Overlay>
  );
}
