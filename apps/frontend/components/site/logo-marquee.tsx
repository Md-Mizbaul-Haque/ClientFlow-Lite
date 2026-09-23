/* Wordmark-style placeholder logotypes for the trusted-by strip. Swappable
   for real SVG brand marks later without touching the marquee mechanics. */
const logos = [
  "Northwind Studio",
  "Bright&Co",
  "Pixelcraft",
  "Halo Digital",
  "Mono Creative",
  "Vela Agency",
  "Fieldnote",
  "Kindred Labs",
];

export function LogoMarquee() {
  return (
    <div
      className="relative w-full overflow-hidden py-4"
      // Gradient mask fades logos out at both edges, like ManyRequests.
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
      role="region"
      aria-label="Agencies using ClientFlow Lite"
    >
      {/* Two identical logo lists side by side; the -50% keyframe lands on the seam */}
      <div className="animate-marquee flex w-max items-center gap-16 pr-16">
        {[...logos, ...logos].map((name, index) => (
          <span
            key={`${name}-${index}`}
            aria-hidden={index >= logos.length}
            className="whitespace-nowrap text-lg font-bold tracking-tight text-neutral-400"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
