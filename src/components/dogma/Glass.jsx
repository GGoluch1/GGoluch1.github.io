// The world around Shinji breaking like a mirror. One fixed set of shards
// (a jittered grid, cut into triangles around the centre of the screen):
// <Cracks> draws their edges, spreading out from the middle, then <Shatter>
// throws the pieces toward the camera. Both work in % of the screen.

const COLS = 6;
const ROWS = 4;

// Repeatable pseudo-random numbers, so the glass breaks the same way every time.
const rand = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// Grid points, nudged off the grid except along the edges and at the centre.
const POINTS = Array.from({ length: ROWS + 1 }, (_, r) =>
  Array.from({ length: COLS + 1 }, (_, c) => {
    const edgeX = c === 0 || c === COLS;
    const edgeY = r === 0 || r === ROWS;
    const centre = c === COLS / 2 && r === ROWS / 2;
    const jx = edgeX || centre ? 0 : (rand(r * 31 + c) - 0.5) * 9;
    const jy = edgeY || centre ? 0 : (rand(r * 17 + c * 7) - 0.5) * 14;
    return [(c / COLS) * 100 + jx, (r / ROWS) * 100 + jy];
  }),
);

const SHARDS = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const [a, b, d, e] = [POINTS[r][c], POINTS[r][c + 1], POINTS[r + 1][c], POINTS[r + 1][c + 1]];
    // Alternate the diagonal so the cracks don't all lean one way.
    const halves =
      (r + c) % 2
        ? [
            [a, b, e],
            [a, e, d],
          ]
        : [
            [a, b, d],
            [b, e, d],
          ];
    SHARDS.push(...halves);
  }
}

const centroid = (tri) => [0, 1].map((k) => (tri[0][k] + tri[1][k] + tri[2][k]) / 3);

// Every inner edge once, for the cracks.
const EDGES = (() => {
  const seen = new Map();
  for (const tri of SHARDS) {
    for (let i = 0; i < 3; i++) {
      const [p, q] = [tri[i], tri[(i + 1) % 3]];
      const onBorder = (k, v) => p[k] === v && q[k] === v;
      if (onBorder(0, 0) || onBorder(0, 100) || onBorder(1, 0) || onBorder(1, 100)) continue;
      const key = [p, q]
        .map((pt) => pt.map((n) => n.toFixed(2)).join(","))
        .sort()
        .join("|");
      seen.set(key, [p, q]);
    }
  }
  return [...seen.values()];
})();

const distance = ([x, y]) => Math.hypot(x - 50, y - 50);

// The dark, faintly lit "mirror" the void is painted on. Shards share it, so
// the break lines up with what was on screen.
export const VOID =
  "radial-gradient(ellipse 34% 60% at 50% 48%, rgb(150 170 210 / 0.22), transparent 70%), radial-gradient(ellipse at 50% 40%, #1d222c, #07080b 62%, #000)";

export function Cracks() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {EDGES.map(([p, q], i) => (
        <line
          key={i}
          x1={p[0]}
          y1={p[1]}
          x2={q[0]}
          y2={q[1]}
          stroke="#dfe9ff"
          strokeOpacity="0.75"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          className="animate-[fade-in_0.12s_ease-out_both]"
          style={{ animationDelay: `${(Math.min(distance(p), distance(q)) / 70) * 0.8}s` }}
        />
      ))}
    </svg>
  );
}

// Hidden with reduced motion: then the void simply gives way to the scene.
export function Shatter() {
  return (
    <div className="pointer-events-none absolute inset-0 motion-reduce:hidden" aria-hidden="true">
      {SHARDS.map((tri, i) => {
        const [cx, cy] = centroid(tri);
        const push = 0.9 + rand(i) * 0.8;
        return (
          <div
            key={i}
            className="absolute inset-0 animate-[shard_1.4s_cubic-bezier(0.25,0.1,0.5,1)_both]"
            style={{
              background: VOID,
              clipPath: `polygon(${tri.map(([x, y]) => `${x}% ${y}%`).join(", ")})`,
              transformOrigin: `${cx}% ${cy}%`,
              animationDelay: `${(distance([cx, cy]) / 70) * 0.12}s`,
              "--dx": `${(cx - 50) * push}vw`,
              "--dy": `${(cy - 50) * push}vh`,
              "--r": `${(rand(i + 99) - 0.5) * 120}deg`,
            }}
          />
        );
      })}
      <div className="absolute inset-0 animate-[fade-in_0.7s_ease-out_reverse_both] bg-white/80" />
    </div>
  );
}
