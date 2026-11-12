"use client";

import { useEffect, useRef } from "react";

/** Shows `value`, and counts up to it the first time it scrolls into view. */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = String(value);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || played.current || value === 0 || !("IntersectionObserver" in window)) return;
    let raf = 0;
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      played.current = true;
      let t0 = 0;
      const step = (t: number) => {
        if (!t0) t0 = t;
        const k = Math.min(1, (t - t0) / 900);
        el.textContent = String(Math.round(value * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(step);
        else el.textContent = String(value);
      };
      el.textContent = "0";
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return <b ref={ref}>{value}</b>;
}
