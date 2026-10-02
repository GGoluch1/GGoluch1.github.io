import { useEffect, useState } from "react";
import { sfx } from "../lib/sound";
import Overlay from "./Overlay";

// Click anywhere that isn't interactive (the background, plain text, empty
// space) and an A.T. Field ripples out from that point: concentric octagons.
// Links, buttons, inputs and anything with a pointer cursor are left alone.

const INTERACTIVE = "a, button, input, select, textarea, label, summary, canvas, dialog, [role='button'], [contenteditable]";
const LIFETIME = 900;

// A regular octagon, flat side up, centred in a 100 x 100 box.
const OCTAGON = Array.from({ length: 8 }, (_, i) => {
  const a = Math.PI / 8 + (i * Math.PI) / 4;
  return `${(50 + 46 * Math.cos(a)).toFixed(2)},${(50 + 46 * Math.sin(a)).toFixed(2)}`;
}).join(" ");

let nextId = 0;

export default function ATField() {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    const root = document.getElementById("root");
    const onClick = (e) => {
      const t = e.target;
      if (e.button !== 0 || !(t instanceof Element) || !root.contains(t)) return;
      if (t.closest(INTERACTIVE) || getComputedStyle(t).cursor === "pointer") return;
      if (window.getSelection()?.toString()) return;

      const id = nextId++;
      setFields((f) => [...f, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setFields((f) => f.filter((x) => x.id !== id)), LIFETIME);
      sfx.atField();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!fields.length) return null;

  return (
    <Overlay>
      <div className="pointer-events-none fixed inset-0 z-[64] overflow-hidden" aria-hidden="true">
        {fields.map(({ id, x, y }) => (
          <svg key={id} viewBox="0 0 100 100" className="absolute size-40 -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
            {[0, 1, 2].map((i) => (
              <polygon
                key={i}
                points={OCTAGON}
                fill="var(--color-magi)"
                fillOpacity="0.06"
                stroke="var(--color-magi)"
                strokeWidth="2"
                className="opacity-40 [transform-origin:center] [animation:at-field_0.7s_cubic-bezier(0.2,0.7,0.3,1)_both]"
                style={{ animationDelay: `${i * 90}ms` }}
              />
            ))}
          </svg>
        ))}
      </div>
    </Overlay>
  );
}
