import Link from "next/link";

import { CtaBackground } from "@/components/site/cta-background";
import { Reveal } from "@/components/site/reveal";

export function CtaBlock() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-primary-deep py-20">
      <CtaBackground />
      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <Reveal>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Ready to streamline your client work?
        </h2>
        </Reveal>
        <Reveal delay={90}>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
          Join agencies that replaced email threads, spreadsheets, and scattered tools with one clean client
          portal. Start free, no credit card required.
        </p>
        </Reveal>
        <Reveal delay={180}>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-control bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-lg transition-colors hover:bg-neutral-50"
          >
            Try for free
          </Link>
          <a
            href="#pricing"
            className="rounded-control border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            See pricing
          </a>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
