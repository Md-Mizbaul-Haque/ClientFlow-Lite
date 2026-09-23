import type { LucideIcon } from "lucide-react";
import { Check, CreditCard, Receipt, Repeat, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CtaBlock } from "@/components/site/cta-block";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { Reveal, RevealGroup } from "@/components/site/reveal";

export const metadata: Metadata = {
  title: "Invoicing for Agencies | ClientFlow Lite",
  description: "Turn delivered work into branded invoices. Card payments through Stripe, recurring billing, outstanding at a glance.",
};

const blocks: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Receipt,
    title: "Branded invoices",
    description: "Your logo and payment terms on every invoice. Sent from the portal, never as an attachment.",
  },
  {
    icon: Repeat,
    title: "Recurring billing",
    description: "Retainers and maintenance plans billed automatically each month. Pause anytime.",
  },
  {
    icon: CreditCard,
    title: "Card payments",
    description: "Clients pay by card through Stripe. Money lands in your account, minus Stripe's fee.",
  },
  {
    icon: Wallet,
    title: "Outstanding at a glance",
    description: "Paid, pending, and overdue across every client on one screen. No spreadsheet to maintain.",
  },
];

const bars = ["38%", "52%", "44%", "68%", "61%", "86%"];

export default function InvoicingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-2xl">
              <p className="animate-fade-up flex items-center gap-3 text-sm font-semibold text-primary">
                <Link href="/#services" className="transition-colors hover:text-primary-hover">
                  Services
                </Link>
                <span aria-hidden="true" className="text-neutral-400">
                  /
                </span>
                <span>Invoicing</span>
              </p>
              <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                Invoice where the work happened.
              </h1>
              <p className="animate-fade-up mt-4 max-w-lg text-pretty text-lg leading-relaxed text-neutral-600 [animation-delay:80ms]">
                Turn delivered requests into branded invoices. Clients pay by card, and you track
                what is outstanding.
              </p>
              <ul className="animate-fade-up mt-8 space-y-3 [animation-delay:160ms]">
                {[
                  "Branded invoices sent from the portal, never as attachments",
                  "Card payments through Stripe land straight in your account",
                  "Retainers billed monthly with overdue tracked in one view",
                ].map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-sm text-neutral-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="animate-fade-up mt-8 flex w-full flex-col gap-3 [animation-delay:240ms] sm:w-auto sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-control bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Try for free
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-2 py-3 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  See pricing
                </Link>
              </div>
            </div>
            <Reveal delay={120}>
              <div
                aria-hidden="true"
                className="rounded-card border border-border bg-page-bg p-5 shadow-card sm:p-6"
              >
                <div className="rounded-control bg-white p-4 shadow-card">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-neutral-500">Paid this month</p>
                      <p className="mt-0.5 text-xl font-bold tabular-nums text-neutral-900">$8,420</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-success-deep">+18% vs last month</p>
                    </div>
                    <div className="flex h-12 shrink-0 items-end gap-1">
                      {bars.map((height, i) => (
                        <span
                          key={i}
                          style={{ height }}
                          className={`w-1.5 rounded-full ${i === bars.length - 1 ? "bg-primary" : "bg-primary/25"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center gap-2 rounded-control bg-white px-4 py-3 shadow-card">
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-neutral-800">
                      INV-0241 — Autumn social kit · Paid by card
                    </span>
                    <span className="shrink-0 rounded-full bg-[#DEF7EC] px-2 py-0.5 text-[10px] font-semibold text-success-deep">
                      Paid
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-control bg-white px-4 py-3 shadow-card">
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-neutral-800">
                      INV-0242 — Monthly retainer · Due in 4 days
                    </span>
                    <span className="shrink-0 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-semibold text-[#92400E]">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-page-bg py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="flex items-center gap-3 text-sm font-semibold text-primary">
                <span aria-hidden="true" className="text-neutral-400">
                  03
                </span>
                <span aria-hidden="true" className="h-px w-8 bg-border-strong" />
                Money in
              </p>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                From delivered work to money in the account.
              </h2>
            </div>
          </Reveal>
          <RevealGroup className="mt-10 border-t border-border" step={80}>
            {blocks.map((block, i) => (
              <div
                key={block.title}
                className="group grid gap-3 border-b border-border px-4 py-7 transition-colors duration-200 hover:bg-white sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.4fr)] sm:items-baseline sm:gap-6 sm:px-6"
              >
                <span aria-hidden="true" className="text-sm font-semibold text-neutral-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="flex items-center gap-2.5 text-base font-semibold text-neutral-900 transition-colors group-hover:text-primary">
                  <block.icon size={18} aria-hidden="true" className="shrink-0 text-primary" />
                  {block.title}
                </h3>
                <p className="max-w-xl text-pretty text-sm leading-relaxed text-neutral-600">
                  {block.description}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBlock />
      <Footer />
    </main>
  );
}
