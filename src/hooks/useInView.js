import { useEffect, useRef, useState } from "react";

// Returns [ref, inView]. inView flips to true the first time the element
// scrolls into view and stays true, so entrance animations only play once.
// With once: false it also turns back off when the element leaves the screen.
export function useInView(threshold = 0.15, { once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!once) setInView(entry.isIntersecting);
        else if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return [ref, inView];
}
