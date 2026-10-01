import { useCallback, useEffect, useState } from "react";
import AlertBar from "./components/AlertBar";
import BootScreen from "./components/BootScreen";
import CaseFiles from "./components/CaseFiles";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Links from "./components/Links";
import Nav from "./components/Nav";
import { sfx } from "./lib/sound";

const SESSION_KEY = "magi-booted"; // booted in this tab already
const VISITED_KEY = "magi-visited"; // has ever seen the full boot

// "full" for first-time visitors, "fast" for returning ones,
// "none" when it already played in this tab. Add ?boot to the URL to force "full".
// Visitors who prefer reduced motion still get the boot, just without movement.
function bootMode() {
  if (new URLSearchParams(window.location.search).has("boot")) return "full";
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return "none";
    if (localStorage.getItem(VISITED_KEY) === "1") return "fast";
  } catch {
    // storage blocked: fall through to the full boot
  }
  return "full";
}

export default function App() {
  const [mode] = useState(bootMode);
  const [booted, setBooted] = useState(mode === "none");

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
      localStorage.setItem(VISITED_KEY, "1");
    } catch {
      // storage blocked: boot will just replay next load
    }
    setBooted(true);
  }, []);

  // Soft interface sounds for every link and button, via one delegated listener.
  useEffect(() => {
    const selector = "a, button";
    const onOver = (e) => {
      const el = e.target.closest?.(selector);
      if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) sfx.hover();
    };
    const onClick = (e) => {
      if (e.target.closest?.(selector)) sfx.click();
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      {!booted && <BootScreen fast={mode === "fast"} onDone={finishBoot} />}
      <Nav />
      <main>
        <Hero active={booted} />
        <AlertBar text="⚠ 緊急事態 // EMERGENCY // PATTERN BLUE // NEW CASE FILES DETECTED" />
        <CaseFiles />
        <Links />
      </main>
      <Footer />

      {/* CRT scanline overlay across the whole page */}
      <div className="crt pointer-events-none fixed inset-0 z-[70]" aria-hidden="true" />
    </>
  );
}
