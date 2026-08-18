import { ClientFlowIcon, IconContainer, type IconName } from "@/components/icons";
import Link from "next/link";
import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { PricingCards } from "@/components/pricing-cards";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { TRIAL_DAYS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for freelancers and agencies. 15-day free trial on every plan â€” no credit card required.",
};

const included: { icon: IconName; label: string }[] = [
  { icon: "signature", label: "Unlimited proposals & e-sign" },
  { icon: "milestone", label: "Milestone board" },
  { icon: "payment", label: "Stripe-powered payments" },
  { icon: "refresh", label: "Real-time sync" },
  { icon: "shield", label: "Private by design" },
];

const faqs = [
  {
    q: "Do I need a credit card to start the free trial?",
    a: "No. Start your 15-day free trial with just a work email. We only ask for a card if you decide to upgrade.",
  },
  {
    q: "What happens when my free trial ends?",
    a: "You'll get a reminder before the trial ends and can pick any plan â€” or export your data and walk away, no questions asked.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade anytime, and you'll only be billed for the plan you're on. Switching to annual billing applies the discount right away.",
  },
  {
    q: "Is my clients' data safe?",
    a: "Every query is scoped server-side to the signed-in role and client. Clients only ever see their own proposals, projects, and invoices.",
  },
  {
    q: "What payment methods do my clients have?",
    a: "Clients pay by credit or debit card through Stripe-powered checkout â€” right inside the portal, with no extra accounts to create.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "We do! Reach out from your workspace and we'll apply a 20% nonprofit or student discount to any plan.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="bg-primary/10 pointer-events-none absolute inset-0">
            <div className="absolute -top-32 left-1/2 h-96 w-[50rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute top-40 -right-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
            <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          </div>

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-6 sm:py-24">
            <span className="border-border/60 bg-card/70 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
              <ClientFlowIcon name="badge-percent" size={14} className="text-primary" />
              Simple, transparent pricing
            </span>
            <h1 className="max-w-2xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl">
              Pricing that scales with{" "}
              <span className="bg-linear-to-r from-primary to-chart-4 bg-clip-text text-transparent">
                your agency
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg text-pretty">
              Start free for {TRIAL_DAYS} days â€” no credit card required. Pick a plan when
              you&apos;re ready, upgrade or downgrade anytime.
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
              {["15-day free trial", "No credit card required", "Cancel anytime"].map((t) => (
                <span
                  key={t}
                  className="border-border/60 bg-card/70 text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <PricingCards />
        </section>

        <section className="border-y bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              Every plan includes
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {included.map((item) => (
                <span
                  key={item.label}
                  className="border-border/60 bg-card flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm"
                >
                  <ClientFlowIcon name={item.icon} size={16} className="text-primary" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
          <h2 className="mb-3 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mb-10 text-center text-lg text-pretty">
            Everything you need to know before you start. Still curious? Start a trial and ask
            us anything.
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group border-border/60 bg-card rounded-2xl border px-5 py-4 shadow-sm transition-colors open:border-primary/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {faq.q}
                  <ClientFlowIcon name="chevron-down" size={16} className="text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="border-border/60 bg-card relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-xl">
            <div className="bg-primary/10 pointer-events-none absolute inset-0">
              <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            </div>
            <IconContainer variant="ring" boxSize={48}>
              <ClientFlowIcon name="wallet" size={24} className="text-primary" />
            </IconContainer>
            <h2 className="relative max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Start your {TRIAL_DAYS}-day free trial today
            </h2>
            <p className="text-muted-foreground relative max-w-lg text-lg text-pretty">
              No credit card required. Cancel anytime. Set up your workspace in minutes.
            </p>
            <div className="relative flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="group shadow-sm hover:shadow-lg hover:shadow-primary/20"
              >
                <Link href="/free-trial">
                  <ClientFlowIcon name="sparkles" size={16} />
                  Try for free
                  <ClientFlowIcon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/why-clientflow">Why ClientFlow?</Link>
              </Button>
            </div>
            <p className="text-muted-foreground relative text-xs">
              {TRIAL_DAYS} days free Â· No credit card required Â· Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6">
          <Brand />
          <p className="text-muted-foreground">
            ClientFlow Lite â€” a micro-SaaS client portal &amp; proposal generator.
          </p>
        </div>
      </footer>
    </div>
  );
}