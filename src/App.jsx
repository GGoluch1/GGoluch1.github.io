import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useState } from "react";
import AlertBar from "./components/AlertBar";
import BootScreen from "./components/BootScreen";
import CaseFiles from "./components/CaseFiles";
import Berserk from "./components/eggs/Berserk";
import Monolith from "./components/eggs/Monolith";
import Rei from "./components/eggs/Rei";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import ATField from "./components/ATField";
import Isolation from "./components/Isolation";
import Links from "./components/Links";
import Nav from "./components/Nav";
import { BOOTED_KEY, SECTION_KEY, VISITED_KEY } from "./lib/boot";
import { isUnlocked, useSeele } from "./lib/eggs";
import { SECTIONS, goTo } from "./lib/navigate";
import { sfx } from "./lib/sound";
import { local, session } from "./lib/storage";
import { dialogOpen, onUi } from "./lib/ui";

// Loaded on demand, so first-time visitors don't download them up front.
// Terminal Dogma in particular only ever loads once all seven seals are broken.
const Terminal = lazy(() => import("./components/Terminal"));
const IdCard = lazy(() => import("./components/IdCard"));
const Dogma = lazy(() => import("./components/dogma/Dogma"));

// Instant, not smooth: <html> has scroll-behavior: smooth, and a smooth scroll
// can be cut short while the boot screen holds the page still.
const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });

// "full" for first-time visitors, "fast" for returning ones,
// "none" when it already played in this tab. Add ?boot to the URL to force "full".
// Visitors who prefer reduced motion still get the boot, just without movement.
function bootMode() {
  if (typeof window === "undefined") return "full"; // build-time prerender
  if (new URLSearchParams(window.location.search).has("boot")) return "full";
  if (session.get(BOOTED_KEY) === "1") return "none";
  if (local.get(VISITED_KEY) === "1") return "fast";
  return "full";
}

export default function App() {
  const [mode] = useState(bootMode);
  // A section asked for by the previous page (an incident report's back link).
  const [section] = useState(() => session.get(SECTION_KEY));
  const [booted, setBooted] = useState(mode === "none");
  const [panel, setPanel] = useState(null); // "terminal" | "idcard" | null
  const unlocked = isUnlocked(useSeele());
  const closePanel = useCallback(() => setPanel(null), []);

  useEffect(() => {
    const offs = ["terminal", "idcard"].map((name) => onUi(name, () => setPanel(name)));
    return () => offs.forEach((off) => off());
  }, []);

  const finishBoot = useCallback(() => {
    session.set(BOOTED_KEY, "1");
    local.set(VISITED_KEY, "1");
    // The browser may have scrolled behind the boot screen (to a #section it
    // found in the URL, say), so the site is revealed at the top, on the name.
    toTop();
    setBooted(true);
  }, []);

  // The site always opens at the top, on the name. A #files / #comms in the
  // address (an old link, the address bar's autocomplete, a reloaded or
  // restored tab) is dropped rather than followed. The one exception is an
  // incident report's back link, which asks for the case files through
  // sessionStorage, once. Scroll restoration is switched off in main.jsx.
  useLayoutEffect(() => {
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    session.remove(SECTION_KEY);
    if (mode === "none" && section && goTo(section, { instant: true })) return;
    toTop();
  }, [mode, section]);

  // One delegated listener for: soft UI sounds on links/buttons, and smooth
  // in-page navigation for every "#section" link (no back-button history spam).
  useEffect(() => {
    const selector = "a, button";
    const onOver = (e) => {
      const el = e.target.closest?.(selector);
      if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) sfx.hover();
    };
    const onClick = (e) => {
      if (e.target.closest?.(selector)) sfx.click();

      const link = e.target.closest?.('a[href^="#"]');
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const id = link.getAttribute("href").slice(1);
      if (id && goTo(id)) e.preventDefault();
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Keyboard shortcuts: 1 / 2 / 3 jump to MAGI / FILES / COMMS, ` opens the terminal.
  useEffect(() => {
    if (!booted) return;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.("input, textarea, select, [contenteditable]") || dialogOpen()) return;
      if (e.key === "`") {
        e.preventDefault();
        setPanel("terminal");
        return;
      }
      const index = ["1", "2", "3"].indexOf(e.key);
      if (index < 0) return;
      e.preventDefault();
      sfx.click();
      goTo(SECTIONS[index]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booted]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[80] bg-magi px-4 py-2 font-bold text-void focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        SKIP TO CONTENT
      </a>
      {!booted && <BootScreen fast={mode === "fast"} onDone={finishBoot} />}
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero active={booted} />
        <AlertBar text="⚠ 緊急事態 // EMERGENCY // PATTERN BLUE // NEW CASE FILES DETECTED" />
        <CaseFiles />
        <Links />
      </main>
      <Footer />
      {unlocked && (
        <Suspense fallback={null}>
          <Dogma />
        </Suspense>
      )}

      <Monolith />
      <Berserk />
      <Isolation />
      <ATField />
      {booted && <Rei />}
      <Suspense fallback={null}>
        {panel === "terminal" && <Terminal onClose={closePanel} />}
        {panel === "idcard" && <IdCard onClose={closePanel} />}
      </Suspense>

      {/* CRT scanline overlay across the whole page */}
      <div className="pointer-events-none fixed inset-0 z-[70] crt print:hidden" aria-hidden="true" />
    </>
  );
}
