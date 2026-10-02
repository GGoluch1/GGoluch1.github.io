import { forwardRef } from "react";

// Terminal Dogma, drawn from scratch: the red cross, Lilith with her seven-eyed
// mask, the Lance of Longinus in her chest, and the LCL lake reflecting it all.
// viewBox is 800 x 1000; the LCL surface sits at y = 830.

const SURFACE = 830;

// The Lance runs from its twin prongs (in Lilith's chest) down-right to the handle.
const TIP = { x: 406, y: 372 };
const DIR = { x: 0.6395, y: 0.7688 };
const NORMAL = { x: -DIR.y, y: DIR.x };
const LENGTH = 560;
export const LANCE_DIR = DIR;

// Two red strands twisted around each other, splitting into two prongs at the tip.
function strand(sign) {
  const points = [];
  for (let i = 0; i <= 140; i++) {
    const t = i / 140;
    const offset = t < 0.14 ? 4 + ((0.14 - t) / 0.14) * 13 : 5.5 * Math.sin((t - 0.14) * Math.PI * 2 * 11);
    const x = TIP.x + DIR.x * LENGTH * t + NORMAL.x * offset * sign;
    const y = TIP.y + DIR.y * LENGTH * t + NORMAL.y * offset * sign;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}
const STRANDS = [strand(1), strand(-1)];

// Small, uneven legs hanging from Lilith's lower body: [x, length, lean].
const LEGS = [
  [356, 58, -6], [368, 96, -3], [380, 72, 2], [392, 124, -2],
  [406, 108, 3], [418, 80, 5], [430, 100, 4], [442, 62, 8],
];

const EYES = [
  [382, 236], [378, 256], [383, 276],
  [418, 236], [422, 256], [417, 276],
  [400, 294],
];

function Arm({ flip }) {
  const d = "M346 246 C300 222 220 196 112 168 L104 186 C214 214 296 246 350 284 Z";
  return (
    <g transform={flip ? "translate(800 0) scale(-1 1)" : undefined}>
      <path d={d} fill="url(#dg-skin)" />
      <ellipse cx="96" cy="177" rx="17" ry="11" fill="#efe8e1" transform="rotate(-14 96 177)" />
      <path d="M84 170l-16-8M83 177l-18-2M86 184l-15 6" stroke="#efe8e1" strokeWidth="5" strokeLinecap="round" />
      <circle cx="97" cy="177" r="5" fill="#5a0710" />
      <path d="M97 182v26" stroke="#8a0a14" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

const Lilith = forwardRef(function Lilith({ eyesOpen, cracksRef }, lanceRef) {
  return (
    <svg viewBox="0 0 800 1000" className="h-full w-full" role="img" aria-label="Lilith crucified on a red cross above a lake of LCL, the Lance of Longinus in her chest">
      <defs>
        <radialGradient id="dg-glow" cx="50%" cy="36%" r="62%">
          <stop offset="0" stopColor="#ee1c33" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#6b0612" stopOpacity="0.25" />
          <stop offset="1" stopColor="#050003" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dg-cross" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#d81a2e" />
          <stop offset="0.5" stopColor="#b0101f" />
          <stop offset="1" stopColor="#6d0711" />
        </linearGradient>
        <linearGradient id="dg-cross-h" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#d81a2e" />
          <stop offset="1" stopColor="#7d0814" />
        </linearGradient>
        <linearGradient id="dg-skin" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f8f3ec" />
          <stop offset="1" stopColor="#cfc5bc" />
        </linearGradient>
        <linearGradient id="dg-lcl" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffb347" />
          <stop offset="0.2" stopColor="#ff8a1f" />
          <stop offset="0.65" stopColor="#a63f00" />
          <stop offset="1" stopColor="#2a0b00" />
        </linearGradient>
        <clipPath id="dg-pool">
          <rect x="0" y={SURFACE} width="800" height={1000 - SURFACE} />
        </clipPath>
        <filter id="dg-ripple" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.07" numOctaves="2" seed="4">
            <animate attributeName="baseFrequency" dur="9s" values="0.01 0.07;0.014 0.09;0.01 0.07" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="16" />
        </filter>
        <filter id="dg-eye-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Chamber */}
      <rect width="800" height="1000" fill="#050003" />
      <rect width="800" height="1000" fill="url(#dg-glow)" />
      <path d="M60 0v830M120 0v830M680 0v830M740 0v830" stroke="#ff8a1f" strokeOpacity="0.08" />

      <g id="dg-figure">
        {/* The cross */}
        <rect x="372" y="10" width="56" height={SURFACE} fill="url(#dg-cross)" />
        <rect x="60" y="148" width="680" height="54" fill="url(#dg-cross-h)" />
        <rect x="372" y="10" width="7" height={SURFACE} fill="#ff4a5c" opacity="0.35" />
        <rect x="60" y="148" width="680" height="6" fill="#ff4a5c" opacity="0.35" />

        {/* Lilith */}
        <Arm />
        <Arm flip />
        <path
          d="M338 262C326 300 334 344 350 384C362 420 362 462 354 500L446 500C438 462 438 420 450 384C466 344 474 300 462 262C430 286 370 286 338 262Z"
          fill="url(#dg-skin)"
        />
        <path d="M400 292v104M360 330q40 14 80 0M362 352q38 14 76 0M364 374q36 12 72 0" stroke="#c6bab0" strokeWidth="2" fill="none" />
        <path d="M350 496C340 520 344 548 360 560C372 572 392 566 400 572C410 566 430 572 442 560C458 546 460 520 450 496Z" fill="url(#dg-skin)" />
        {LEGS.map(([x, len, lean], i) => (
          <path key={i} d={`M${x - 6} 550 L${x + 6} 550 L${x + lean} ${550 + len} Z`} fill={i % 2 ? "#ded5cd" : "#ece5de"} />
        ))}
        <ellipse cx="400" cy="553" rx="50" ry="9" fill="#7a0a12" opacity="0.7" />
        <ellipse cx={TIP.x} cy={TIP.y} rx="11" ry="7" fill="#5a0710" />

        {/* Head and the seven-eyed mask */}
        <ellipse cx="400" cy="258" rx="38" ry="42" fill="#efe8e1" />
        <path d="M360 230Q400 206 440 230Q450 268 400 312Q350 268 360 230Z" fill="var(--color-lilith)" stroke="#2e1250" strokeWidth="2" />
        <path d="M366 230Q400 214 434 230" stroke="#8b5cc9" strokeWidth="2" fill="none" opacity="0.6" />
        {EYES.map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx="7" ry="3.6" fill="#1d0a33" />
            {eyesOpen && (
              <ellipse
                cx={x}
                cy={y}
                rx="6"
                ry="3"
                fill="#ff2a3a"
                filter="url(#dg-eye-glow)"
                className="animate-eye-open [transform-box:fill-box] [transform-origin:center]"
                style={{ animationDelay: `${0.4 + i * 0.35}s` }}
              />
            )}
          </g>
        ))}
        <g ref={cracksRef} opacity="0">
          <path d="M398 212L392 236L402 252L394 274L401 302M392 236L370 244M402 252L428 246L438 236M394 274L368 266" stroke="#12051f" strokeWidth="2.4" fill="none" />
          <path d="M398 212L392 236L402 252L394 274L401 302M402 252L428 246" stroke="#ff8a1f" strokeWidth="0.8" fill="none" />
        </g>

        {/* The Lance of Longinus */}
        <g ref={lanceRef}>
          {STRANDS.map((pts, i) => (
            <polyline key={`s${i}`} points={pts} fill="none" stroke="#2a0006" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {STRANDS.map((pts, i) => (
            <polyline key={i} points={pts} fill="none" stroke={i ? "#a50c1f" : "#e01a33"} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
          ))}
        </g>
      </g>

      {/* The LCL lake and its rippling reflection */}
      <rect y={SURFACE} width="800" height={1000 - SURFACE} fill="url(#dg-lcl)" />
      <g clipPath="url(#dg-pool)" opacity="0.3">
        <g filter="url(#dg-ripple)">
          <use href="#dg-figure" transform={`translate(0 ${SURFACE * 2}) scale(1 -1)`} />
        </g>
      </g>
      <path d={`M0 ${SURFACE} H800`} stroke="#ffd08a" strokeWidth="2" opacity="0.7" />

      {/* Drops falling from Lilith into the lake */}
      {LEGS.filter((_, i) => i % 2).map(([x, len, lean], i) => (
        <circle
          key={i}
          cx={x + lean}
          cy={550 + len}
          r="3.5"
          fill="#f2ebe4"
          className="animate-drip"
          style={{ "--d": `${SURFACE - 550 - len}px`, animationDelay: `${i * 0.7}s` }}
        />
      ))}

      {/* HUD annotations (hidden on phones, where they'd be too small to read) */}
      <g className="max-sm:hidden" fill="#ff8a1f" stroke="#ff8a1f" fontFamily="Share Tech Mono, monospace">
        <path d="M344 214v-16h16M456 214v-16h-16M344 306v16h16M456 306v16h-16" fill="none" strokeWidth="2" />
        <path d="M456 206L560 120H740" fill="none" strokeWidth="1" />
        <text x="566" y="110" fontSize="20" stroke="none">第2使徒 // LILITH</text>
        <text x="566" y="142" fontSize="13" stroke="none" opacity="0.7">ADAM? // NEGATIVE</text>
        <path d="M607 614L650 668H780" fill="none" strokeWidth="1" />
        <text x="780" y="660" fontSize="16" stroke="none" textAnchor="end">ロンギヌスの槍 // LANCE OF LONGINUS</text>
        <text x="40" y="900" fontSize="16" stroke="none" fill="#2a0b00">LCL // 生命のスープ</text>
      </g>
    </svg>
  );
});

export default Lilith;
