import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useRemote } from "../hooks/useRemote";
import { find } from "../lib/eggs";
import { fetchAngelCount } from "../lib/remote";
import { setSound, useSound } from "../lib/sound";
import { timeOfDay } from "../lib/tod";
import { openUi } from "../lib/ui";
import Umbilical from "./Umbilical";

// Seal 5's "Anta baka?!" only loads when someone knocks five times.
const AsukaStamp = lazy(() => import("./eggs/Captions").then((m) => ({ default: m.AsukaStamp })));

const links = [
  { id: "magi", label: "MAGI" },
  { id: "files", label: "FILES" },
  { id: "comms", label: "COMMS" },
];

// The live clock ticks every second, so it re-renders on its own instead of
// taking the whole header with it.
function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="text-magi/80 tabular-nums" title={`Tokyo-3 // ${timeOfDay(now)}`}>
      {now.toLocaleTimeString("en-GB", { hour12: false })}
    </span>
  );
}

export default function Nav() {
  const [active, setActive] = useState("magi");
  const [tucked, setTucked] = useState(false); // phones: header slides away while scrolling down
  const barRef = useRef(null);
  const headerRef = useRef(null);
  const soundOn = useSound();
  // GoatCounter's visitor total, as "Angels repelled".
  const angels = useRemote(fetchAngelCount, "angels");
  const [asuka, setAsuka] = useState(false);
  const knocks = useRef([]);

  // Seal 5: knock on NERV's logo five times in quick succession.
  const knock = () => {
    const now = performance.now();
    knocks.current = [...knocks.current.filter((t) => now - t < 2500), now];
    if (knocks.current.length >= 5 && !asuka) {
      knocks.current = [];
      setAsuka(true);
      find("asuka");
    }
  };

  // Highlight whichever section is in the middle of the screen
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Scroll progress bar (updated directly, no re-render), and on phones,
  // tuck the header away while scrolling down / bring it back when scrolling up.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? y / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      const focusInHeader = headerRef.current?.contains(document.activeElement);
      if (y < 80 || focusInHeader) setTucked(false);
      else if (y > lastY + 6) setTucked(true);
      else if (y < lastY - 6) setTucked(false);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      onFocus={() => setTucked(false)}
      className={`sticky top-0 z-40 border-b-2 border-magi bg-void/90 backdrop-blur transition-transform duration-300 print:hidden ${
        tucked ? "max-md:-translate-y-full" : ""
      }`}
    >
      {/* From sm up, a three-column grid keeps the nav dead centre: the side
          columns are always equal, whatever is in them. Each side is kept
          narrower than half of what's left (status on the left, the visitor
          count and controls on the right, showing more as the screen widens).
          Phones keep a simple row, without the terminal button (it would
          overflow a 360px screen; the footer has one). */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
        <div className="flex items-center gap-3 sm:justify-self-start">
          <a
            href="#magi"
            onClick={knock}
            className="group relative flex items-baseline gap-2 before:absolute before:inset-x-0 before:-inset-y-2.5"
          >
            <span className="font-title text-2xl font-black tracking-tight text-nerv transition group-hover:animate-glitch">
              NERV
            </span>
            <span className="hidden text-xs tracking-[0.3em] text-magi/80 transition-colors group-hover:text-magi md:inline">
              MAGI SYSTEM
            </span>
          </a>
          <div className="hidden items-center gap-2 text-xs lg:flex" aria-hidden="true">
            <span className="size-2 animate-blink bg-sync" />
            <span className="text-sync">ONLINE</span>
            <Clock />
          </div>
        </div>

        <nav className="flex text-xs sm:gap-1 sm:justify-self-center sm:text-sm">
          {links.map((link, i) => {
            const isActive = active === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                aria-current={isActive ? "true" : undefined}
                aria-keyshortcuts={String(i + 1)}
                title={`${link.label} (press ${i + 1})`}
                className={`relative px-1.5 py-1 transition-colors before:absolute before:inset-x-0 before:-inset-y-2.5 after:absolute after:inset-x-1.5 after:bottom-0 after:h-0.5 after:origin-left after:bg-magi after:transition-transform after:duration-300 hover:text-paper hover:after:scale-x-100 sm:px-2 sm:after:inset-x-2 ${
                  isActive ? "text-paper after:scale-x-100" : "after:scale-x-0"
                }`}
              >
                <span className="hidden opacity-80 sm:inline">0{i + 1} </span>
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 text-xs sm:gap-3 sm:justify-self-end">
          {angels && (
            <span className="hidden text-magi/80 xl:inline" title="Visitors so far">
              {angels} ANGELS REPELLED
            </span>
          )}
          <Umbilical />
          <button
            type="button"
            onClick={() => openUi("terminal")}
            aria-label="MAGI terminal"
            aria-keyshortcuts="`"
            title="MAGI terminal (press `)"
            className="relative hidden items-center border border-magi/50 px-2 py-1 font-bold transition before:absolute before:-inset-x-1 before:-inset-y-2.5 hover:border-magi hover:bg-magi/10 active:scale-95 sm:flex"
          >
            <span aria-hidden="true">
              &gt;<span className="animate-blink">_</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSound(!soundOn)}
            aria-pressed={soundOn}
            title="Interface sounds"
            className="relative flex items-center gap-1.5 border border-magi/50 px-2 py-1 transition before:absolute before:-inset-x-1 before:-inset-y-2.5 hover:border-magi hover:bg-magi/10 active:scale-95"
          >
            <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
              {[0.45, 1, 0.7].map((h, i) => (
                <span
                  key={i}
                  className={`w-0.5 origin-bottom bg-current transition-transform duration-300 ${
                    soundOn ? "scale-y-100" : "scale-y-25"
                  }`}
                  style={{ height: `${h * 100}%`, transitionDelay: `${i * 60}ms` }}
                />
              ))}
            </span>
            <span className="sr-only md:not-sr-only">SND </span>
            {soundOn ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {asuka && (
        <Suspense fallback={null}>
          <AsukaStamp onDone={() => setAsuka(false)} />
        </Suspense>
      )}

      {/* Scroll progress */}
      <div
        ref={barRef}
        className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-nerv"
        style={{ transform: "scaleX(0)" }}
        aria-hidden="true"
      />
    </header>
  );
}
