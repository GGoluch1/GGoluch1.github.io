import { SEALS } from "../../lib/eggs";

// One almond eye per seal, like the seven on SEELE's mask. Lit = found.
export function Eye({ lit, className = "" }) {
  return (
    <svg viewBox="0 0 16 10" className={`h-2.5 w-4 ${className}`} aria-hidden="true">
      <path
        d="M1 5 Q8 -1 15 5 Q8 11 1 5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className={lit ? "text-nerv" : "text-magi/30"}
      />
      {lit && <circle cx="8" cy="5" r="2.2" className="fill-nerv" />}
    </svg>
  );
}

export default function SeeleEyes({ found, className = "" }) {
  return (
    <div className={`flex gap-1.5 ${className}`} aria-hidden="true">
      {SEALS.map((s) => (
        <Eye key={s.id} lit={found.has(s.id)} className={found.has(s.id) ? "drop-shadow-[0_0_4px_var(--color-nerv)]" : ""} />
      ))}
    </div>
  );
}
