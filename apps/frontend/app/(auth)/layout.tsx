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
              {/* Logo from Figma: logo-uc2 1 275x26 */}
              <img src="/logo.png" alt="ClientFlow Lite" className="h-[26px] w-[275px] object-contain brightness-0 invert" />
              <p className="max-w-[620px] text-white text-[15px] leading-relaxed">
                Join us for a seamless online experience. Access your account effortlessly. Stay secure
                and enjoy a hassle-free journey.
              </p>
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
