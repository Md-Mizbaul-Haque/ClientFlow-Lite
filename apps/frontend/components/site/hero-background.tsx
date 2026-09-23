// Hero backdrop — structural, not decorative. One directional wash from the
// top-left plus a single radial glow positioned behind the product dashboard
// that sits in the right column of the split hero. A faint dot grid fades in
// at the edges for texture without touching readability in the middle.
//
// Deliberately a server component. The previous version shipped pointer
// parallax to every visitor: motion with no meaning, and the only client-side
// JavaScript anywhere in the hero. The hero now ships zero client JS.
export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="hero-canvas pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Dot grid lives at the edges only — the mask clears the middle. */}
      <div className="hero-grid absolute inset-0" />
      {/* Grain dithers the large soft gradients so they do not band on 8-bit displays. */}
      <div className="hero-grain absolute inset-0" />
    </div>
  );
}
