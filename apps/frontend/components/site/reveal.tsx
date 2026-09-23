"use client";

import * as React from "react";

// Scroll reveals, the documented standard way: one IntersectionObserver flips
// a class once per element, CSS transitions do the motion. Resting (hidden)
// styles live behind a `.js` flag set pre-paint in layout, so SSR and no-JS
// render fully visible content. No scroll listeners, no animation library.

const DURATION_MS = 550;

type RevealHelpers = {
  register: (index: number) => (node: HTMLElement | null) => void;
  classNameFor: (index: number, base: string) => string;
  styleFor: (
    index: number,
    extraDelay: number,
    base: React.CSSProperties | undefined,
  ) => React.CSSProperties | undefined;
};

function useReveal(count: number, step: number): RevealHelpers {
  const [shown, setShown] = React.useState<boolean[]>(() => Array(count).fill(false));
  const [settled, setSettled] = React.useState<boolean[]>(() => Array(count).fill(false));
  const nodes = React.useRef<(HTMLElement | null)[]>([]);

  React.useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      setShown(Array(count).fill(true));
      setSettled(Array(count).fill(true));
      return;
    }
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.revealIndex);
          if (!entry.isIntersecting || Number.isNaN(index)) continue;
          observer.unobserve(entry.target);
          setShown((prev) => {
            if (prev[index]) return prev;
            const next = [...prev];
            next[index] = true;
            return next;
          });
          // Clear the cascade delay after the reveal finishes so it never
          // slows hover transitions on the same element.
          timers.push(
            window.setTimeout(() => {
              setSettled((prev) => {
                const next = [...prev];
                next[index] = true;
                return next;
              });
            }, DURATION_MS + index * step + 50),
          );
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    nodes.current.forEach((node) => {
      if (node) observer.observe(node);
    });
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [count, step]);

  return {
    register:
      (index: number) =>
      (node: HTMLElement | null): void => {
        nodes.current[index] = node;
      },
    classNameFor: (index: number, base: string) =>
      `${base} reveal-item${shown[index] ? " is-visible" : ""}`,
    styleFor: (index: number, extraDelay: number, base: React.CSSProperties | undefined) =>
      shown[index] && !settled[index]
        ? { ...base, transitionDelay: `${index * step + extraDelay}ms` }
        : base,
  };
}

function applyReveal(
  child: React.ReactNode,
  index: number,
  extraDelay: number,
  helpers: RevealHelpers,
): React.ReactNode {
  if (!React.isValidElement(child)) return child;
  const element = child as React.ReactElement<Record<string, unknown>>;
  const baseClass = typeof element.props.className === "string" ? element.props.className : "";
  const baseStyle = element.props.style as React.CSSProperties | undefined;
  return React.cloneElement(element, {
    ref: helpers.register(index),
    "data-reveal-index": index,
    className: helpers.classNameFor(index, baseClass),
    style: helpers.styleFor(index, extraDelay, baseStyle),
  });
}

// Single block reveal, with an optional entrance delay in ms.
export function Reveal({
  delay = 0,
  children,
}: {
  delay?: number;
  children: React.ReactElement;
}) {
  const helpers = useReveal(1, 0);
  return <>{applyReveal(children, 0, delay, helpers)}</>;
}

// Cascade: children reveal one after another, `step` ms apart.
export function RevealGroup({
  className = "",
  step = 90,
  children,
}: {
  className?: string;
  step?: number;
  children: React.ReactNode;
}) {
  const items = React.Children.toArray(children);
  const helpers = useReveal(items.length, step);
  return (
    <div className={className}>
      {items.map((child, index) => applyReveal(child, index, 0, helpers))}
    </div>
  );
}
