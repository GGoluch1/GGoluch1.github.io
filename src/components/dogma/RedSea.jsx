import { useEffect, useState } from "react";
import { startWaves } from "../../lib/sound";

// The last scene of The End of Evangelion, drawn from scratch: a red sea under
// a dark sky with a streak of blood across it, Lilith's broken face on the
// horizon, grave markers on a white beach, and one line.

const STARS = Array.from({ length: 40 }, (_, i) => [(i * 397) % 1600, (i * 211) % 380, 0.6 + ((i * 7) % 10) / 10]);

export default function RedSea() {
  const [line, setLine] = useState(false);

  useEffect(() => startWaves(), []);
  useEffect(() => {
    const t = setTimeout(() => setLine(true), 4200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 animate-[fade-in_2.5s_ease-out_both] bg-black">
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-label="A red sea under a dark sky, Lilith's broken face on the horizon, grave markers on a white beach"
      >
        <defs>
          <linearGradient id="rs-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#030006" />
            <stop offset="0.6" stopColor="#14030a" />
            <stop offset="1" stopColor="#3d0812" />
          </linearGradient>
          <linearGradient id="rs-sea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8a0a16" />
            <stop offset="1" stopColor="#2a0006" />
          </linearGradient>
          <linearGradient id="rs-sand" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#e9e3da" />
            <stop offset="1" stopColor="#b9b0a6" />
          </linearGradient>
          <clipPath id="rs-half">
            <rect x="1020" y="300" width="170" height="260" />
          </clipPath>
        </defs>

        <rect width="1600" height="900" fill="url(#rs-sky)" />
        {STARS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#f4efe6" opacity="0.6" />
        ))}

        {/* The streak of blood across the sky */}
        <path d="M-40 380 C 380 120, 1100 60, 1680 250" stroke="#b0101f" strokeWidth="22" fill="none" opacity="0.75" />
        <path d="M-40 380 C 380 120, 1100 60, 1680 250" stroke="#ff4a5c" strokeWidth="4" fill="none" opacity="0.5" />

        {/* Lilith's broken face, half sunk on the horizon */}
        <g clipPath="url(#rs-half)" opacity="0.92">
          <ellipse cx="1190" cy="470" rx="150" ry="190" fill="#e9e3da" />
          <path d="M1080 430 Q1120 405 1165 428 Q1122 452 1080 430Z" fill="#2a0006" />
          <path d="M1190 280 L1170 380 L1186 460 L1168 560" stroke="#9a8f86" strokeWidth="6" fill="none" />
        </g>

        {/* The sea, with slow swells */}
        <rect y="540" width="1600" height="360" fill="url(#rs-sea)" />
        <path d="M0 540 H1600" stroke="#ff4a5c" strokeWidth="2" opacity="0.5" />
        {[580, 630, 700].map((y, i) => (
          <path
            key={y}
            d={`M-200 ${y} Q 0 ${y - 8}, 200 ${y} T 600 ${y} T 1000 ${y} T 1400 ${y} T 1800 ${y}`}
            stroke="#ff4a5c"
            strokeWidth="1.5"
            fill="none"
            opacity={0.25 - i * 0.05}
            className="animate-[drift_9s_ease-in-out_infinite_alternate]"
            style={{ animationDelay: `${i * -3}s` }}
          />
        ))}

        {/* The beach and its grave markers */}
        <path d="M0 760 C 300 700, 640 720, 900 790 C 1100 840, 1300 860, 1600 850 V900 H0Z" fill="url(#rs-sand)" />
        <g stroke="#3a3330" strokeWidth="5" strokeLinecap="round">
          <path d="M210 742 V650" />
          <path d="M300 734 V672" />
          <path d="M390 728 V640" />
        </g>
        <g stroke="#c9a227" strokeWidth="2.5" fill="none">
          <path d="M390 652 v26 M380 662 h20" />
          <path d="M390 640 v12" stroke="#5a504a" strokeWidth="1.5" />
        </g>
      </svg>

      <p className="absolute top-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.4em] whitespace-nowrap text-paper/60">
        THE END OF EVANGELION
      </p>
      {line && (
        <div className="absolute inset-x-0 bottom-16 animate-[fade-in_1.5s_ease-out_both] px-6 text-center sm:bottom-20">
          <p className="font-title text-3xl font-black text-paper sm:text-5xl">気持ち悪い。</p>
          <p className="mt-2 text-xs tracking-[0.4em] text-paper/70">I FEEL SICK.</p>
        </div>
      )}
    </div>
  );
}
