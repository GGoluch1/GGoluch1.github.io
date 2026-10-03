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
import { BOOTED_KEY, VISITED_KEY } from "./lib/boot";
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
    setBooted(true);
  }, []);

  // A boot sequence always lands on the top section. Without this, a leftover
  // #files / #comms in the URL or the browser's scroll restoration on reload
  // would leave the page mid-way down when the boot screen clears.
  // Without a boot (already booted in this tab, e.g. coming back from an
  // incident report to /#files), a #section in the URL is honored instead.
  useLayoutEffect(() => {
    if (mode === "none") {
      if (location.hash) goTo(location.hash.slice(1), { instant: true });
      return;
    }
    history.scrollRestoration = "manual";
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo(0, 0);
  }, [mode]);

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
