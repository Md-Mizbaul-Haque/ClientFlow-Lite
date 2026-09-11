import { BrandLogo } from "@/components/brand-logo";

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
              {/* Brand — main ClientFlow Lite logo, white box for contrast on blue */}
              <BrandLogo variant="onBlue" />
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
          <div className="flex w-full max-w-[480px] flex-col gap-8">
            <div className="lg:hidden">
              <BrandLogo variant="onWhite" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
