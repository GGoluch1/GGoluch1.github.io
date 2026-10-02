import { useEffect, useState } from "react";
import { profile } from "../data/profile";
import { isUnlocked, sealCount, useSeele } from "../lib/eggs";
import { openUi } from "../lib/ui";
import PenPen from "./eggs/PenPen";
import SeeleEyes from "./eggs/SeeleEyes";
import Reveal from "./Reveal";

const YEAR = new Date().getFullYear();

// Shows up after the first egg is found: seven eyes, one per seal.
function SeeleTracker({ seele }) {
  if (seele.found.size === 0) return null;
  const unlocked = isUnlocked(seele);

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <SeeleEyes found={seele.found} />
      <p className="text-[10px] tracking-[0.3em] text-nerv/90">
        SEELE // {sealCount(seele)} OF 7 SEALS BROKEN{seele.found.has("penpen") ? " // + PEN PEN" : ""}
        {seele.ended ? " // おめでとう" : ""}
      </p>
      {unlocked && (
        <a href="#dogma" className="mt-2 animate-blink text-xs tracking-[0.4em] text-nerv hover:text-paper">
          ▼ DESCEND TO TERMINAL DOGMA ▼
        </a>
      )}
    </div>
  );
}

export default function Footer() {
  const seele = useSeele();
  const unlocked = isUnlocked(seele);
  const [door, setDoor] = useState(false);

  // Once every seal is broken, the motto keeps glitching into "HEAVEN'S DOOR".
  useEffect(() => {
    if (!unlocked) return;
    let off = 0;
    const id = setInterval(() => {
      setDoor(true);
      off = setTimeout(() => setDoor(false), 1100);
    }, 4200);
    return () => {
      clearInterval(id);
      clearTimeout(off);
    };
  }, [unlocked]);

  return (
    <footer>
      <div className="relative">
        <PenPen />
        <div className="hazard relative h-4" aria-hidden="true" />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <Reveal variant="wipe">
          <div className="mx-auto grid w-fit">
            <p
              className={`col-start-1 row-start-1 font-title text-2xl font-black text-paper transition hover:animate-glitch md:text-3xl ${
                door ? "opacity-0" : ""
              }`}
            >
              GABE&apos;S IN HIS HEAVEN.
              <br />
              ALL&apos;S RIGHT WITH THE WORLD.
            </p>
            {unlocked && (
              <p
                aria-hidden="true"
                className={`col-start-1 row-start-1 self-center font-title text-3xl font-black text-nerv md:text-5xl ${
                  door ? "animate-glitch" : "opacity-0"
                }`}
              >
                HEAVEN&apos;S DOOR
              </p>
            )}
          </div>
        </Reveal>
        <SeeleTracker seele={seele} />
        <Reveal variant="fade" delay={300}>
          <button
            type="button"
            onClick={() => openUi("terminal")}
            className="mt-6 border border-magi/50 px-3 py-1.5 text-xs tracking-[0.3em] text-magi/80 transition-colors hover:border-magi hover:text-magi"
          >
            &gt;_ MAGI TERMINAL
          </button>
          <p className="mt-6 hidden text-xs tracking-widest text-magi/80 md:block" aria-hidden="true">
            KEYS // [1] MAGI · [2] FILES · [3] COMMS · [`] TERMINAL
          </p>
          <p className="mt-6 text-xs text-magi/80">
            © {YEAR} {profile.firstName} {profile.lastName} // NERV HQ, TOKYO-3
          </p>
          <p className="mt-2 text-[10px] text-magi/80">
            Fan-made tribute. Neon Genesis Evangelion belongs to its respective owners.
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
