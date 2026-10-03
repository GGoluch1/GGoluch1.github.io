import { useEffect, useRef, useState } from "react";
import { onAnnounce, sealCount, useSeele } from "../../lib/eggs";
import { sfx } from "../../lib/sound";
import Overlay from "../Overlay";
import SeeleEyes from "./SeeleEyes";

const SHOW_MS = 5200;

// A SEELE monolith ("SOUND ONLY") that appears whenever an egg is found.
// Several finds in a row queue up and play one after another.
export default function Monolith() {
  const seele = useSeele();
  const [queue, setQueue] = useState([]);
  const current = queue[0];
  const timer = useRef(0);

  useEffect(() => onAnnounce((msg) => setQueue((q) => [...q, msg])), []);

  useEffect(() => {
    if (!current) return;
    sfx.seal();
    timer.current = setTimeout(() => setQueue((q) => q.slice(1)), SHOW_MS);
    return () => clearTimeout(timer.current);
  }, [current]);

  if (!current) return null;

  return (
    <Overlay>
      <div
        role="status"
        className="pointer-events-none fixed right-4 bottom-4 left-4 z-[66] font-mono sm:left-auto sm:w-72"
      >
        <div
          key={current.key}
          className="animate-monolith-in border border-nerv/40 bg-black p-4 shadow-[0_0_50px_rgb(238_28_51/0.3)]"
        >
          <div className="flex items-baseline justify-between font-title font-black text-nerv">
            <span className="text-2xl tracking-[0.2em]">SEELE</span>
            <span className="text-4xl tabular-nums">{current.number}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-paper/90">{current.line}</p>
          <div className="mt-4 flex items-center justify-between">
            <SeeleEyes found={seele.found} />
            <span className="text-[10px] tracking-widest text-nerv">{sealCount(seele)}/7</span>
          </div>
          <p className="mt-3 text-[10px] tracking-[0.5em] text-nerv">SOUND ONLY</p>
        </div>
      </div>
    </Overlay>
  );
}
