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

function CheckIcon({ included, label }: { included: boolean; label: string }) {
  return (
    <span
      title={included ? `Included in ${label}` : `Not included in ${label}`}
      className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full ${
        included ? "bg-primary/10" : "bg-neutral-100"
      }`}
    >
      {included ? (
        <Check size={12} className="text-primary" aria-hidden="true" />
      ) : (
        <Minus size={12} className="text-neutral-400" aria-hidden="true" />
      )}
      <span className="sr-only">
        {included ? `Included in ${label}` : `Not included in ${label}`}
      </span>
    </span>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-soft via-white to-white">
        <div aria-hidden="true" className="pricing-grid absolute inset-0" />
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
      <section className="mx-auto max-w-5xl px-6 lg:px-8 pb-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Plan comparison
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
          Everything in Pro is included in Team. Team adds collaboration,
          branding, and integrations.
        </p>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Feature comparison between Pro and Team plans
              </caption>
              <thead>
                <tr className="border-b border-border">
                  <th
                    scope="col"
                    className="w-[46%] px-6 py-5 text-sm font-medium text-neutral-500"
                  >
                    Feature
                  </th>
                  <th scope="col" className="w-[27%] px-4 py-5 text-center">
                    <span className="block text-base font-semibold text-neutral-900">
                      Pro
                    </span>
                    <span className="mt-0.5 block text-xs font-normal text-neutral-500">
                      $29/mo
                    </span>
                  </th>
                  <th
                    scope="col"
                    className="w-[27%] border-l border-border/60 bg-primary/[0.04] px-4 py-5 text-center"
                  >
                    <span className="mx-auto mb-1.5 block w-fit rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      Most popular
                    </span>
                    <span className="block text-base font-semibold text-primary">
                      Team
                    </span>
                    <span className="mt-0.5 block text-xs font-normal text-neutral-500">
                      $79/mo
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((group) => {
                  const proCount = group.features.filter((f) => f.pro).length;
                  const total = group.features.length;
                  return (
                    <Fragment key={group.category}>
                      <tr className="border-t border-border/60 bg-neutral-50/70 first:border-t-0">
                        <td colSpan={3} className="px-6 py-3">
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                              {group.category}
                            </span>
                            <span className="text-xs font-medium text-neutral-400">
                              Pro {proCount}/{total} · Team {total}/{total}
                            </span>
                          </span>
                        </td>
                      </tr>
                      {group.features.map((f) => (
                        <tr
                          key={f.name}
                          className="border-t border-border/60 transition-colors hover:bg-neutral-50/60"
                        >
                          <th
                            scope="row"
                            className="px-6 py-3.5 font-normal text-neutral-700"
                          >
                            {f.name}
                          </th>
                          <td className="px-4 py-3.5 text-center">
                            <CheckIcon included={f.pro} label="Pro" />
                          </td>
                          <td className="border-l border-border/60 bg-primary/[0.04] px-4 py-3.5 text-center">
                            <CheckIcon included={f.team} label="Team" />
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-neutral-50/50">
                  <td className="px-6 py-5 text-sm font-medium text-neutral-900">
                    Choose your plan
                  </td>
                  <td className="px-4 py-5 text-center">
                    <Link
                      href="/signup"
                      className="inline-block rounded-lg border border-border bg-white px-5 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      Start with Pro
                    </Link>
                  </td>
                  <td className="border-l border-border/60 bg-primary/[0.04] px-4 py-5 text-center">
                    <Link
                      href="/signup"
                      className="inline-block rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                    >
                      Start with Team
                    </Link>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
              <Check size={12} className="text-primary" aria-hidden="true" />
            </span>
            Included
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100">
              <Minus size={12} className="text-neutral-400" aria-hidden="true" />
            </span>
            Not included in this plan
          </span>
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
