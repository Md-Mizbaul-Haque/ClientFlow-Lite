import type { LucideIcon } from "lucide-react";
import { Check, CreditCard, Receipt, Repeat, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CtaBlock } from "@/components/site/cta-block";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

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

export default function InvoicingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-2xl">
              <p className="flex items-center gap-3 text-sm font-semibold text-primary">
                <Link href="/#services" className="transition-colors hover:text-primary-hover">
                  Services
                </Link>
                <span aria-hidden="true" className="text-neutral-400">
                  /
                </span>
                <span>Invoicing</span>
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                Invoice where the work happened.
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-neutral-600">
                Turn delivered requests into branded invoices. Clients pay by card, and you track
                what is outstanding.
              </p>
              <ul className="mt-8 space-y-3">
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
            </div>
            <div
              aria-hidden="true"
              className="rounded-card border border-border bg-page-bg p-5 shadow-card sm:p-6"
            >
              <div className="flex items-end justify-between gap-3 rounded-control border border-border bg-white p-4">
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Paid this month</p>
                  <p className="mt-0.5 text-xl font-bold text-neutral-900">$8,420</p>
                  <span className="text-[11px] font-semibold text-success-deep">+18%</span>
                </div>
                <div className="flex h-12 shrink-0 items-end gap-1">
                  <span className="h-[38%] w-1.5 rounded-full bg-primary/25" />
                  <span className="h-[52%] w-1.5 rounded-full bg-primary/25" />
                  <span className="h-[44%] w-1.5 rounded-full bg-primary/25" />
                  <span className="h-[68%] w-1.5 rounded-full bg-primary/25" />
                  <span className="h-[61%] w-1.5 rounded-full bg-primary/25" />
                  <span className="h-[86%] w-1.5 rounded-full bg-primary" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-control border border-border bg-white px-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-neutral-700">
                  INV-0241 — Autumn social kit · Paid by card
                </span>
                <span className="shrink-0 rounded-full bg-[#DEF7EC] px-2 py-0.5 text-[10px] font-medium text-success-deep">
                  Paid
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-page-bg py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {blocks.map((block) => (
              <div
                key={block.title}
                className="flex flex-col rounded-card border border-border bg-white p-6 sm:p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-control bg-primary-soft text-primary">
                  <block.icon size={20} aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-neutral-900">{block.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{block.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBlock />
      <Footer />
    </main>
  );
}
