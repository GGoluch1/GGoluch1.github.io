import { Suspense, lazy, useState } from "react";
import { todaysEvent } from "../lib/calendar";
import { find } from "../lib/eggs";

// Seal 4's song only loads when Kaworu's entry is clicked.
const KaworuSong = lazy(() => import("./eggs/Captions").then((m) => ({ default: m.KaworuSong })));

// Scrolling NERV emergency banner. Content is duplicated so the loop is seamless.
// Hovering pauses it. One entry isn't like the others: Kaworu (seal 4).
// On Eva calendar dates (src/lib/calendar.js) the bar carries the event instead.
const TABRIS = "⚠ 第17使徒 // TABRIS // PATTERN BLUE // NOT AN EMERGENCY";

export default function AlertBar({ text }) {
  const [song, setSong] = useState(false);
  const [event] = useState(todaysEvent);
  const items = Array.from({ length: 6 }, (_, i) => (i === 3 ? TABRIS : (event?.text ?? text)));

  const sing = () => {
    if (song) return;
    setSong(true);
    find("tabris");
  };

  return (
    <div className="group overflow-hidden bg-nerv py-1.5 text-void print:hidden" aria-hidden="true">
      <div className="flex w-max animate-marquee font-title font-black tracking-widest whitespace-nowrap group-hover:[animation-play-state:paused]">
        {[...items, ...items].map((t, i) =>
          t === TABRIS ? (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={sing}
              className="px-6 font-black tracking-widest hover:text-paper"
            >
              {t}
            </button>
          ) : (
            <span key={i} className="px-6">
              {t}
            </span>
          ),
        )}
      </div>
      {song && (
        <Suspense fallback={null}>
          <KaworuSong onDone={() => setSong(false)} />
        </Suspense>
      )}
    </div>
  );
}
