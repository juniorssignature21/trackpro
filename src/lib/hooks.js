import { useEffect, useRef, useState } from 'react';

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} – TrackPro` : 'TrackPro – Send, Track & Pay for Parcels in Real Time';
  }, [title]);
}

/** Adds a class to <body> while the component is mounted. */
export function useBodyClass(cls) {
  useEffect(() => {
    if (!cls) return undefined;
    document.body.classList.add(cls);
    return () => document.body.classList.remove(cls);
  }, [cls]);
}

/** Animated counter that starts when the element scrolls into view (swing easing, like the original). */
export function useCountUp(to, { duration = 1800, decimals } = {}) {
  const ref = useRef(null);
  const dec = decimals ?? (String(to).split('.')[1] || '').length;
  const [value, setValue] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf;
    const run = () => {
      const start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 0.5 - Math.cos(p * Math.PI) / 2;
        setValue(to * eased);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { setValue(to); return undefined; }
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { io.disconnect(); run(); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  const text = value === to
    ? to.toLocaleString('en-GB', { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : value.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return [ref, text];
}

/** Re-runs `fn` every `ms` while the tab is visible. */
export function useInterval(fn, ms) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    if (!ms) return undefined;
    const id = setInterval(() => { if (document.visibilityState === 'visible') saved.current(); }, ms);
    return () => clearInterval(id);
  }, [ms]);
}
