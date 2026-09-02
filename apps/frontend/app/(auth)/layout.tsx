export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        {/* Left — Onboarding (720) */}
        <div className="hidden lg:flex w-[720px] flex-col bg-primary">
          <div className="flex flex-1 flex-col justify-between p-8">
            <div className="flex-1 flex items-center justify-center">
              <div className="h-[679px] w-full max-w-[720px] rounded-xl bg-primary-light/20 flex items-center justify-center border border-white/10">
                <span className="text-white/60 text-sm">Photo / Illustration — 720x679</span>
              </div>
            </div>
            <div className="mt-8 max-w-[620px]">
              <div className="h-[26px] w-[275px] bg-white/90 rounded mb-4 flex items-center px-3 text-xs font-semibold text-primary">
                ClientFlow Lite
              </div>
              <p className="text-white text-[15px] leading-relaxed">
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
