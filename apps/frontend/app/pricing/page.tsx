"use client";

import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { Fragment, useState } from "react";

import { Navbar } from "@/components/site/navbar";
import { Pricing } from "@/components/site/pricing";

const comparisonFeatures = [
  {
    category: "Billing & Payments",
    features: [
      { name: "Stripe integration", pro: true, team: true },
      { name: "Manual payments", pro: true, team: true },
      { name: "Recurring invoices", pro: true, team: true },
      { name: "Coupon codes", pro: false, team: true },
      { name: "Credit-based services", pro: false, team: true },
      { name: "Hourly billing", pro: false, team: true },
    ],
  },
  {
    category: "Client Requests",
    features: [
      { name: "Request module", pro: true, team: true },
      { name: "File storage", pro: true, team: true },
      { name: "Auto-assign requests", pro: false, team: true },
      { name: "Design annotation", pro: false, team: true },
      { name: "Client ratings", pro: false, team: true },
    ],
  },
  {
    category: "Client Portal",
    features: [
      { name: "Client onboarding", pro: true, team: true },
      { name: "Portal branding", pro: true, team: true },
      { name: "Custom domain", pro: true, team: true },
      { name: "Messaging module", pro: false, team: true },
      { name: "Announcements", pro: false, team: true },
      { name: "White label portal", pro: false, team: true },
      { name: "White label email", pro: false, team: true },
    ],
  },
  {
    category: "Integrations",
    features: [
      { name: "Zapier", pro: false, team: true },
      { name: "Google Analytics", pro: false, team: true },
      { name: "Meta Pixel", pro: false, team: true },
      { name: "Slack", pro: false, team: true },
      { name: "Webhooks", pro: false, team: true },
      { name: "API access", pro: false, team: true },
    ],
  },
];

const faqs = [
  {
    q: "How many clients can I have?",
    a: "Pro includes up to 10 active clients. Team includes unlimited active clients.",
  },
  {
    q: "How much does it cost to add extra team seats?",
    a: "Extra team seats are $30/month (or $300/year) per team member. Invited clients don't count as a seat.",
  },
  {
    q: "Can I add a custom domain?",
    a: "Yes, you can add a custom domain (e.g., portal.youragency.com) on all plans.",
  },
  {
    q: "Do you charge transaction fees?",
    a: "No, you'll only pay Stripe's standard transaction fees. We take zero cut.",
  },
  {
    q: "Can I try before I buy?",
    a: "Yes! All plans come with a 14-day free trial. No credit card required.",
  },
  {
    q: "Can I switch plans later?",
    a: "Absolutely. You can upgrade or downgrade at any time. Changes take effect immediately with prorated billing.",
  },
];

function CheckIcon({ included }: { included: boolean }) {
  return included ? (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
      <Check size={12} className="text-primary" />
    </div>
  ) : (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100">
      <Minus size={12} className="text-neutral-400" />
    </div>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-soft via-white to-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center py-16 text-center sm:py-20">
            <span className="animate-fade-up rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
              Simple, transparent pricing
            </span>
            <h1 className="animate-fade-up mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-neutral-900 [animation-delay:100ms] sm:text-5xl lg:text-6xl">
              Plans that scale with your agency
            </h1>
            <p className="animate-fade-up mt-5 max-w-xl text-lg text-neutral-600 [animation-delay:200ms]">
              Pay only for what you need, with no hidden fees.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards — exact homepage block */}
      <Pricing />

      {/* Enterprise CTA */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
        <div className="rounded-2xl bg-neutral-900 px-8 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Enterprise</h2>
          <p className="mx-auto mt-3 max-w-md text-neutral-400">
            Large team with more than 25 members? Get custom pricing, priority support, and a dedicated account manager.
          </p>
          <Link
            href="mailto:sales@clientflow-lite.com"
            className="mt-8 inline-block rounded-lg border border-neutral-700 bg-transparent px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Contact Sales
          </Link>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Plan comparison
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
          See what&apos;s included in each plan.
        </p>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-4 pr-4 font-medium text-neutral-500">Feature</th>
                <th className="pb-4 px-4 text-center font-semibold text-neutral-900">Pro</th>
                <th className="pb-4 pl-4 text-center font-semibold text-primary">Team</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((group) => (
                <Fragment key={group.category}>
                  <tr key={group.category}>
                    <td colSpan={3} className="pb-2 pt-8 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      {group.category}
                    </td>
                  </tr>
                  {group.features.map((f) => (
                    <tr key={f.name} className="border-b border-border/60">
                      <td className="py-3.5 pr-4 text-neutral-700">{f.name}</td>
                      <td className="py-3.5 px-4 text-center">
                        <CheckIcon included={f.pro} />
                      </td>
                      <td className="py-3.5 pl-4 text-center">
                        <CheckIcon included={f.team} />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 lg:px-8 pb-24">
        <h2 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Frequently asked questions
        </h2>
        <div className="mt-12 space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-white transition-colors hover:border-border-strong"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-sm font-semibold text-neutral-900">{faq.q}</span>
                <span className={`ml-4 shrink-0 text-neutral-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-neutral-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
