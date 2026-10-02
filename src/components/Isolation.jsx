import { sdat, useSdat } from "../lib/sdat";
import Overlay from "./Overlay";

// While the S-DAT plays, the earphones are in: the rest of the page goes
// grey and quiet, the way Shinji tunes everyone out. The S-DAT itself sits
// above this layer (z-[63]) so it stays in colour.
export default function Isolation() {
  const { playing } = useSdat();
  if (!playing) return null;

  return (
    <Overlay>
      <div
        className="pointer-events-none fixed inset-0 z-[62] animate-fade-in bg-[radial-gradient(ellipse_at_center,transparent_35%,rgb(0_0_0/0.55))] backdrop-brightness-75 backdrop-grayscale-90"
        aria-hidden="true"
      />
      <div className="fixed bottom-4 left-1/2 z-[63] sm:top-16 sm:bottom-auto flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 animate-fade-in items-center gap-3 border border-magi/50 bg-black/85 px-3 py-2 text-xs">
        <span className="text-paper/70">
          聞きたくない <span className="hidden sm:inline">// I DON&apos;T WANT TO HEAR IT.</span>
        </span>
        <button type="button" onClick={sdat.stop} className="shrink-0 text-magi hover:text-paper">
          ■ EARPHONES OUT
        </button>
      </div>
    </Overlay>
  );
}
