import { useEffect, useRef } from "react";
import { useLatest } from "./useLatest";

// Press-and-hold driver for the sync test and the Lance.
// Calls step(dt, holding) every frame while held, and keeps calling it after
// release until step returns false (so values can decay back down).
// Returns props to spread on the element that's held: works with mouse,
// touch, and Space/Enter on the keyboard.
export function useHold(step) {
  const holding = useRef(false);
  const frame = useRef(0);
  const stepRef = useLatest(step);

  const loop = (last) => {
    frame.current = requestAnimationFrame((now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      const more = stepRef.current(dt, holding.current);
      if (more || holding.current) loop(now);
      else frame.current = 0;
    });
  };

  const start = () => {
    holding.current = true;
    if (!frame.current) loop(performance.now());
  };
  const stop = () => {
    holding.current = false;
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return {
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      start();
    },
    onPointerUp: stop,
    onPointerCancel: stop,
    onLostPointerCapture: stop,
    onKeyDown: (e) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) {
        e.preventDefault();
        start();
      }
    },
    onKeyUp: (e) => {
      if (e.key === " " || e.key === "Enter") stop();
    },
    onBlur: stop,
    onContextMenu: (e) => e.preventDefault(),
  };
}
