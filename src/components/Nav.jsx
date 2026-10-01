import { useEffect, useRef, useState } from "react";
import { setSound, useSound } from "../lib/sound";

const links = [
  { id: "magi", label: "MAGI" },
  { id: "files", label: "FILES" },
  { id: "comms", label: "COMMS" },
];

export default function Nav() {
  const [now, setNow] = useState(() => new Date());
  const [active, setActive] = useState("magi");
  const barRef = useRef(null);
  const soundOn = useSound();

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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

  // Scroll progress bar (updated directly, no re-render)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const time = now.toLocaleTimeString("en-GB", { hour12: false });

  return (
    <header className="sticky top-0 z-40 border-b-2 border-magi bg-void/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2 sm:gap-3">
        <a href="#magi" className="group flex items-baseline gap-2">
          <span className="font-title text-2xl font-black tracking-tight text-nerv transition group-hover:animate-glitch">
            NERV
          </span>
          <span className="hidden text-xs tracking-[0.3em] text-magi/80 transition-colors group-hover:text-magi sm:inline">
            MAGI SYSTEM
          </span>
        </a>

        <nav className="flex text-xs sm:gap-1 sm:text-sm">
          {links.map((link, i) => {
            const isActive = active === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`relative px-1.5 py-1 transition-colors after:absolute after:inset-x-1.5 after:bottom-0 sm:px-2 sm:after:inset-x-2 after:h-0.5 after:origin-left after:bg-magi after:transition-transform after:duration-300 hover:text-paper hover:after:scale-x-100 ${
                  isActive ? "text-paper after:scale-x-100" : "after:scale-x-0"
                }`}
              >
                <span className="hidden opacity-80 sm:inline">0{i + 1} </span>
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden items-center gap-2 md:flex" aria-hidden="true">
            <span className="size-2 animate-blink bg-sync" />
            <span className="text-sync">ONLINE</span>
            <span className="tabular-nums text-magi/80">{time}</span>
          </div>
          <button
            type="button"
            onClick={() => setSound(!soundOn)}
            aria-pressed={soundOn}
            title="Interface sounds"
            className="flex items-center gap-1.5 border border-magi/50 px-2 py-1 transition hover:border-magi hover:bg-magi/10 active:scale-95"
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
            <span className="sr-only sm:not-sr-only">SND </span>
            {soundOn ? "ON" : "OFF"}
          </button>
        </div>
      </div>

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
