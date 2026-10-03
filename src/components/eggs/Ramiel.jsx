import { Suspense, lazy, useRef, useState } from "react";
import { find, useSeele } from "../../lib/eggs";

// Seal 7. A tiny blue octahedron hides in the hero's hex grid. Clicking it
// runs Operation Yashima (Yashima.jsx, loaded only then).

const Yashima = lazy(() => import("./Yashima"));

function Octahedron({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 1 2 12h10z" fill="#7aa0ff" />
      <path d="M12 1l10 11H12z" fill="var(--color-ramiel)" />
      <path d="M2 12l10 11V12z" fill="#2a4fd6" />
      <path d="M22 12 12 23V12z" fill="#1c3aa8" />
      <path d="M12 1 2 12l10 11 10-11z" fill="none" stroke="#c4d4ff" strokeWidth="0.5" />
    </svg>
  );
}

export default function Ramiel({ className = "" }) {
  const seele = useSeele();
  const ref = useRef(null);
  const [target, setTarget] = useState(null);

  if (seele.found.has("ramiel") && !target) return null;

  const fire = () => {
    const r = ref.current.getBoundingClientRect();
    setTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        tabIndex={-1}
        aria-label="Ramiel"
        onClick={fire}
        disabled={Boolean(target)}
        className={`absolute grid size-10 place-items-center [perspective:200px] ${className}`}
      >
        <Octahedron
          className={`size-5 animate-spin-y drop-shadow-[0_0_6px_var(--color-ramiel)] transition-opacity duration-300 ${
            target ? "opacity-0 delay-[3000ms]" : "opacity-50 hover:opacity-100"
          }`}
        />
      </button>
      {target && (
        <Suspense fallback={null}>
          <Yashima
            target={target}
            onDone={() => {
              setTarget(null);
              find("ramiel");
            }}
          />
        </Suspense>
      )}
    </>
  );
}
