import { useInView } from "../hooks/useInView";

const HIDDEN = {
  up: "translate-y-8 opacity-0",
  wipe: "[clip-path:inset(0_100%_0_0)]",
  fade: "opacity-0",
};

// Wraps content so it animates in when scrolled into view.
export default function Reveal({ variant = "up", delay = 0, className = "", children }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,translate,clip-path] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        inView ? "[clip-path:inset(0_0_0_0)]" : HIDDEN[variant]
      } ${className}`}
    >
      {children}
    </div>
  );
}
