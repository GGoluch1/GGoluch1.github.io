// In-page navigation shared by nav links, buttons, keyboard shortcuts and deep links.

export const SECTIONS = ["magi", "files", "comms"];

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scrolls to the element with this id and moves keyboard focus there.
// The URL hash is replaced rather than pushed, so the back button leaves the
// site instead of stepping through every section visited.
// Returns false if there's no such element (so callers can fall back).
export function goTo(id, { instant = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;

  el.scrollIntoView({ behavior: instant || prefersReducedMotion() ? "instant" : "smooth", block: "start" });
  if (location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`);
  el.focus({ preventScroll: true });
  return true;
}
