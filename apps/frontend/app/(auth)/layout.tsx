export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        {/* Left — Onboarding (720) — Figma assets: onboarding-photo.png 720x679, logo.png */}
        <div className="hidden lg:flex w-[720px] flex-col bg-primary overflow-hidden">
          <div className="flex flex-1 flex-col">
            {/* Photo from Figma: Vector Photo 720x679 */}
            <div className="relative h-[679px] w-full overflow-hidden">
              <img
                src="/onboarding-photo.png"
                alt="Onboarding"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/10" />
            </div>
            <div className="flex flex-col gap-4 p-8 bg-primary">
              {/* Brand — ClientFlow Lite (replaces Figma community logo-uc2) */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary font-bold text-sm">
                  CF
                </div>
                <span className="text-lg font-bold tracking-tight text-white">ClientFlow Lite</span>
                <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-medium text-white">Portal</span>
              </div>
              <div className="max-w-[620px] space-y-2">
                <h2 className="text-xl font-semibold leading-tight text-white">
                  Onboard clients, manage requests, and get paid — from your own branded portal.
                </h2>
                <p className="text-sm leading-relaxed text-white/80">
                  White-label client portal for agencies. Replace scattered tools with one branded experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form area (720) */}
        <div className="flex flex-1 items-center justify-center bg-white px-6 py-10 lg:w-[720px]">
          <div className="w-full max-w-[480px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
