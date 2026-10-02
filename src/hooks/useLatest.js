import { useLayoutEffect, useRef } from "react";

// A ref that always holds the latest value, for callbacks that timers,
// animation frames or event listeners call later.
export function useLatest(value) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
