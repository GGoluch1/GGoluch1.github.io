import { useEffect, useState } from "react";
import { find, useSeele } from "../../lib/eggs";
import { dialogOpen } from "../../lib/ui";
import Overlay from "../Overlay";

// Seal 6. Leave the page alone for a minute and Rei quietly appears in the
// corner. Click her line before it fades.

const IDLE_MS = 60_000;
const SHOW_MS = 15_000;
const EVENTS = ["pointermove", "pointerdown", "keydown", "scroll", "wheel", "touchstart"];

export default function Rei() {
  const seele = useSeele();
  const [shown, setShown] = useState(false);
  const [caught, setCaught] = useState(false);
  const waiting = !seele.found.has("rei");

  useEffect(() => {
    if (!waiting || shown) return;
    let timer = 0;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (document.visibilityState === "visible" && !dialogOpen()) setShown(true);
        else arm();
      }, IDLE_MS);
    };
    arm();
    EVENTS.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    return () => {
      clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, arm));
    };
  }, [waiting, shown]);

  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => {
      setShown(false);
      setCaught(false);
    }, caught ? 2500 : SHOW_MS);
    return () => clearTimeout(t);
  }, [shown, caught]);

  if (!shown) return null;

  const catchHer = () => {
    setCaught(true);
    find("rei");
  };

  return (
    <Overlay>
      <button
        type="button"
        onClick={catchHer}
        disabled={caught}
        className={`fixed bottom-6 left-4 z-[64] max-w-xs animate-[fade-in_2.5s_ease-out_both] text-left text-rei drop-shadow-[0_0_12px_var(--color-rei)] transition-opacity duration-[2000ms] sm:left-6 ${
          caught ? "opacity-0" : "opacity-90 hover:opacity-100"
        }`}
      >
        <span className="block font-title text-lg font-bold">あなたは死なないわ。私が守るもの。</span>
        <span className="mt-1 block text-xs tracking-widest">YOU WON&apos;T DIE. I&apos;LL PROTECT YOU.</span>
      </button>
    </Overlay>
  );
}
