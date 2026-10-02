import { useState } from "react";
import { find } from "../lib/eggs";
import { KaworuSong } from "./eggs/Captions";

// Scrolling NERV emergency banner. Content is duplicated so the loop is seamless.
// Hovering pauses it. One entry isn't like the others: Kaworu (seal 4).
const TABRIS = "⚠ 第17使徒 // TABRIS // PATTERN BLUE // NOT AN EMERGENCY";

export default function AlertBar({ text }) {
  const [song, setSong] = useState(false);
  const items = Array.from({ length: 6 }, (_, i) => (i === 3 ? TABRIS : text));

  const sing = () => {
    if (song) return;
    setSong(true);
    find("tabris");
  };

  return (
    <div className="group overflow-hidden bg-nerv py-1.5 text-void" aria-hidden="true">
      <div className="flex w-max animate-marquee whitespace-nowrap font-title font-black tracking-widest group-hover:[animation-play-state:paused]">
        {[...items, ...items].map((t, i) =>
          t === TABRIS ? (
            <button key={i} type="button" tabIndex={-1} onClick={sing} className="px-6 font-black tracking-widest hover:text-paper">
              {t}
            </button>
          ) : (
            <span key={i} className="px-6">
              {t}
            </span>
          ),
        )}
      </div>
      {song && <KaworuSong onDone={() => setSong(false)} />}
    </div>
  );
}
