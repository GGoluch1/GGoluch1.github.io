import { useEffect, useState } from "react";

// Shinji's S-DAT, which only ever shows tracks 25 and 26.

function Reel() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 animate-spin text-magi [animation-duration:3s]" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 3.5v5M4.6 16.3l4.3-2.5M19.4 16.3l-4.3-2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function SDat() {
  const [track, setTrack] = useState(25);

  useEffect(() => {
    const id = setInterval(() => setTrack((t) => (t === 25 ? 26 : 25)), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border-2 border-magi/60 bg-panel">
      <div className="flex justify-between border-b border-magi/40 px-3 py-1 text-xs tracking-widest">
        <span>S-DAT // 再生中</span>
        <span className="text-sync">▶ REPEAT</span>
      </div>
      <div className="flex items-center gap-4 p-3">
        <div className="flex shrink-0 gap-2 border border-magi/50 px-2 py-4">
          <Reel />
          <Reel />
        </div>
        <div className="min-w-0 flex-1 bg-[#0b1408] px-3 py-2 text-sync">
          <p className="font-title text-xl font-black tabular-nums">TRACK {track}</p>
          <p className="text-xs text-sync/80">REPEAT ALL // 25 ⇄ 26</p>
        </div>
      </div>
    </div>
  );
}
