import { useEffect, useState } from "react";
import { find, useSeele } from "../../lib/eggs";
import { sfx } from "../../lib/sound";

// Bonus egg. Pen Pen lives behind the hazard tape above the footer and peeks
// out every so often. Click him and he waddles off.

function Penguin() {
  return (
    <svg viewBox="0 0 48 56" className="h-14 w-12" aria-hidden="true">
      <path d="M17 5q4-6 7-1 3-5 7 1-3 1-7 3-4-2-7-3z" fill="var(--color-nerv)" />
      <ellipse cx="24" cy="35" rx="16" ry="19" fill="#1d2238" />
      <ellipse cx="9" cy="35" rx="4" ry="10" fill="#1d2238" transform="rotate(18 9 35)" />
      <ellipse cx="39" cy="35" rx="4" ry="10" fill="#1d2238" transform="rotate(-18 39 35)" />
      <ellipse cx="24" cy="39" rx="10" ry="13" fill="var(--color-paper)" />
      <circle cx="24" cy="17" r="12" fill="#1d2238" />
      <ellipse cx="24" cy="19" rx="8" ry="6" fill="var(--color-paper)" />
      <circle cx="20" cy="16" r="2.6" fill="#ffd34a" />
      <circle cx="28" cy="16" r="2.6" fill="#ffd34a" />
      <circle cx="20" cy="16" r="1.3" fill="#000" />
      <circle cx="28" cy="16" r="1.3" fill="#000" />
      <path d="M20 21q4 5 8 0z" fill="var(--color-magi)" />
      <ellipse cx="18" cy="54" rx="5" ry="2" fill="var(--color-magi)" />
      <ellipse cx="30" cy="54" rx="5" ry="2" fill="var(--color-magi)" />
    </svg>
  );
}

export default function PenPen() {
  const seele = useSeele();
  const [state, setState] = useState("hidden"); // hidden | peek | jump | waddle | gone

  // Peek every 15 seconds or so.
  useEffect(() => {
    if (state !== "hidden") return;
    const t = setTimeout(() => setState("peek"), 9000 + Math.random() * 9000);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (state === "peek") {
      const t = setTimeout(() => setState("hidden"), 2600);
      return () => clearTimeout(t);
    }
    if (state === "jump") {
      const t = setTimeout(() => setState("waddle"), 900);
      return () => clearTimeout(t);
    }
    if (state === "waddle") {
      const t = setTimeout(() => setState("gone"), 2400);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (state === "gone" || (seele.found.has("penpen") && state === "hidden")) return null;

  const onClick = () => {
    sfx.quack();
    setState("jump");
    find("penpen");
  };

  const offset = {
    hidden: "translate-y-full",
    peek: "translate-y-[45%]",
    jump: "translate-y-0",
    waddle: "translate-x-[70vw] translate-y-0",
  }[state];

  return (
    <div
      className="absolute right-0 bottom-full h-16 w-[60%] overflow-hidden"
      onPointerEnter={() => state === "hidden" && setState("peek")}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Pen Pen"
        onClick={onClick}
        disabled={state === "jump" || state === "waddle"}
        className={`absolute bottom-0 left-[30%] transition-transform ${
          state === "waddle" ? "duration-[2400ms] ease-linear" : "duration-300 ease-out"
        } ${offset}`}
      >
        <span className={`block ${state === "waddle" ? "animate-[waddle_0.3s_linear_infinite]" : ""}`}>
          <Penguin />
        </span>
        {(state === "jump" || state === "waddle") && (
          <span className="absolute -top-1 left-full animate-pop bg-paper px-1.5 py-0.5 font-title text-xs font-black whitespace-nowrap text-void">
            クワッ！
          </span>
        )}
      </button>
    </div>
  );
}
