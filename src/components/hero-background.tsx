export function HeroBackground() {
  return (
    <div aria-hidden className="hero-bg">
      <div className="hero-bg__base" />
      <div className="hero-bg__dots" />
      <div className="hero-bg__pattern hero-bg__pattern--mesh" />
      <div className="hero-bg__pattern hero-bg__pattern--nodes" />
      <div className="hero-bg__accents" />
      <div className="hero-bg__glow hero-bg__glow--primary" />
      <div className="hero-bg__glow hero-bg__glow--secondary" />
      <div className="hero-bg__glow hero-bg__glow--tertiary" />
      <div className="hero-bg__vignette" />
    </div>
  );
}