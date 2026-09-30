import { useCallback, useEffect, useState } from "react";
import AlertBar from "./components/AlertBar";
import BootScreen from "./components/BootScreen";
import CaseFiles from "./components/CaseFiles";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Links from "./components/Links";
import Nav from "./components/Nav";
import { sfx } from "./lib/sound";

const BOOT_KEY = "magi-booted";

// The boot sequence plays once per browser tab session.
// Add ?boot to the URL to force it, e.g. localhost:5173/?boot
function skipBoot() {
  if (new URLSearchParams(window.location.search).has("boot")) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  try {
    return sessionStorage.getItem(BOOT_KEY) === "1";
  } catch {
    return false;
  }
}

export default function App() {
  const [booted, setBooted] = useState(skipBoot);

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
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
      {!booted && <BootScreen onDone={finishBoot} />}
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
