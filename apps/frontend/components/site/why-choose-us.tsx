import { Clock, DollarSign, Palette, ShieldCheck } from "lucide-react";

import { Reveal, RevealGroup } from "@/components/site/reveal";

const reasons = [
  {
    icon: Palette,
    title: "White-Label Branding",
    description:
      "Your clients never see our name. Every portal is fully branded with your logo, colors, and domain.",
  },
  {
    icon: Clock,
    title: "5-Minute Onboarding",
    description:
      "Sign up, invite your client, and they can start right away. Setup takes minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description:
      "Each client's data stays fully separated on SOC 2-aligned infrastructure.",
  },
  {
    icon: DollarSign,
    title: "Pay Per Client",
    description:
      "Pay only for the active clients on your plan, so the price grows with you.",
  },
];

export function WhyChooseUs() {
  return (
    <section
      id="why"
      className="relative overflow-hidden bg-page-bg py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
        <div className="mx-auto max-w-6xl">
          <p className="flex items-center gap-3 text-sm font-semibold text-primary">
            <span aria-hidden="true" className="text-neutral-400">
              02
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-border-strong" />
            Why agencies switch
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Stop duct-taping your client workflow
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Email threads, Google Docs, Stripe invoices, WhatsApp updates. Sound familiar? ClientFlow Lite
            puts it all in one place.
          </p>
        </div>
        </Reveal>

        <RevealGroup className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 sm:gap-5" step={80}>
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="flex flex-col rounded-card border border-border bg-white p-6 sm:p-7"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-control border border-border bg-white text-primary shadow-card">
                <reason.icon size={20} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-neutral-900">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {reason.description}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
