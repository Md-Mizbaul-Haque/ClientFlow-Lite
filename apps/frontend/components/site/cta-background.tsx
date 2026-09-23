"use client";

import { useEffect, useRef } from "react";

// Closing CTA backdrop — clean brand color at rest, subtle grid plus a soft
// white glow appears only around the cursor on hover. Mirrors
// hero-background.tsx: one rAF-throttled pointermove listener on the section
// writes --mx/--my, CSS does the rest. No state, no re-renders, off on touch
// and reduced-motion.
export function CtaBackground() {
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
      className="cta-canvas pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Grid lives only in the spotlight — nothing visible at rest. */}
      <div className="cta-spot absolute inset-0" />
    </div>
  );
}
