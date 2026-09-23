import Link from "next/link";

import { CtaBlock } from "@/components/site/cta-block";
import { Features } from "@/components/site/features";
import { Footer } from "@/components/site/footer";
import { HeroBackground } from "@/components/site/hero-background";
import { HeroPortalMockup } from "@/components/site/hero-portal-mockup";
import { Navbar } from "@/components/site/navbar";
import { Pricing } from "@/components/site/pricing";
import { WhyChooseUs } from "@/components/site/why-choose-us";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero — split product layout: copy left, the portal dashboard right.
          The product IS the hero visual, so the backdrop stays structural
          (see hero-background.tsx). CSS only; no animation library. */}
      <section className="relative isolate overflow-hidden bg-white">
        <HeroBackground />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-10 py-12 sm:gap-12 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 lg:py-24">
            {/* Copy */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              {/* Not animated on purpose: this is the LCP element, and a fade
                  from opacity 0 holds its paint back by the full duration.
                  Everything below it staggers in instead. */}
              <h1 className="mt-2 max-w-xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                One portal for all your client work.
              </h1>

              <p className="animate-fade-up mt-6 max-w-lg text-pretty text-base leading-relaxed text-neutral-600 sm:text-lg">
                <strong className="font-semibold text-neutral-900">
                  Client portal, requests, invoicing.
                </strong>{" "}
                Onboard clients, manage requests, and get paid from your own branded portal.
              </p>

              {/* Full-width stacked buttons on phones for 44px+ tap targets;
                  centered row from sm up. Parent stays items-center so the
                  w-full container does not stretch past the copy column. */}
              <div className="animate-fade-up mt-8 flex w-full max-w-sm flex-col gap-3 [animation-delay:60ms] sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-control bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
                >
                  Try for free
                </Link>
                {/* Same-page hash: a native anchor is correct here, no route change. */}
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center px-2 py-3.5 text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  See pricing
                </a>
              </div>
            </div>

            {/* Product — the hero visual. The lg right padding keeps the
                tilted frame's bounding box inside the container; without it
                the rotateY sweep pushes the panel past the edge. */}
            <div className="animate-fade-up [animation-delay:180ms] lg:pr-6">
              <HeroPortalMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Features — What you get */}
      <Features />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Pricing */}
      <Pricing />

      {/* Final CTA */}
      <CtaBlock />

      {/* Footer */}
      <Footer />
    </main>
  );
}
