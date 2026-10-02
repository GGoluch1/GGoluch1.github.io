import { useInView } from "../hooks/useInView";

const HIDDEN = {
  up: "translate-y-8 opacity-0",
  wipe: "[clip-path:inset(0_100%_0_0)]",
  fade: "opacity-0",
};

// Only the wipe needs a clip once shown; on the others it would cut off
// anything that overflows, like the case-file folder tabs.
const SHOWN = {
  up: "",
  wipe: "[clip-path:inset(0_0_0_0)]",
  fade: "",
};

// Wraps content so it animates in when scrolled into view.
// The outer div is what's observed and the inner one is what animates:
// Chrome's IntersectionObserver counts an element's own clip-path, so a
// fully clipped "wipe" element would never report itself as visible.
export default function Reveal({ variant = "up", delay = 0, className = "", children }) {
  const [ref, inView] = useInView();

  return (
    <div ref={ref} className={className}>
      <div
        style={{ transitionDelay: `${delay}ms` }}
        className={`h-full transition-[opacity,translate,clip-path] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          inView ? SHOWN[variant] : HIDDEN[variant]
        }`}
      >
        {children}
      </div>
    </div>
  );
}
