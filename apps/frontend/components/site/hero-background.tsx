"use client";

import { useEffect, useRef } from "react";

// Hero backdrop — structural, not decorative. One directional wash from the
// top-left plus a single radial glow behind the product dashboard. A faint
// dot grid fades in at the edges; a cursor spotlight deepens the dots and
// adds a soft brand glow where the pointer is.
//
// Client JS is limited to pointer tracking: one rAF-throttled listener on
// the hero section writes --mx/--my, CSS does the rest. No state updates,
// no re-renders, off on touch and reduced-motion.
export function HeroBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const host = el.closest("section") ?? el.parentElement;
    if (!host) return;

    let raf = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      raf = 0;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.classList.add("has-spot");
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      el.classList.remove("has-spot");
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="hero-canvas pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Dot grid lives at the edges only — the mask clears the middle. */}
      <div className="hero-grid absolute inset-0" />
      {/* Spotlight bolds the dots and warms the wash around the cursor. */}
      <div className="hero-spot absolute inset-0" />
      {/* Grain dithers the large soft gradients so they do not band on 8-bit displays. */}
      <div className="hero-grain absolute inset-0" />
    </div>
  );
}
