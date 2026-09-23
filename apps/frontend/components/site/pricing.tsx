"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Reveal, RevealGroup } from "@/components/site/reveal";

const tiers = [
  {
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 23,
    period: "/month",
    description: "For freelancers and small agencies ready to grow.",
    features: [
      "Up to 10 active clients",
      "Request management",
      "Basic invoicing",
      "Custom branding",
      "File delivery & approvals",
      "Priority support",
    ],
    cta: { label: "Start 14-day trial", href: "/signup", primary: false },
  },
  {
    name: "Team",
    monthlyPrice: 79,
    yearlyPrice: 63,
    period: "/month",
    description: "For agencies with multiple team members and clients.",
    features: [
      "Unlimited active clients",
      "Everything in Pro",
      "Team collaboration",
      "Role-based access",
      "Analytics dashboard",
      "Dedicated support",
    ],
    cta: { label: "Start 14-day trial", href: "/signup", primary: true },
    popular: true,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-3 text-sm font-semibold text-primary">
            <span aria-hidden="true" className="text-neutral-400">
              03
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-border-strong" />
            Pricing
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-600">
            Pay only for what you need, with no hidden fees.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
              className={`cursor-pointer text-sm font-medium ${!annual ? "text-neutral-900" : "text-neutral-500"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(!annual)}
              className="relative h-7 w-12 shrink-0 rounded-full bg-primary transition-colors"
              aria-label="Toggle annual billing"
              aria-pressed={annual}
            >
              <span
                aria-hidden="true"
                className={`absolute left-0.5 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform ${
                  annual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
              className={`cursor-pointer text-sm font-medium ${annual ? "text-neutral-900" : "text-neutral-500"}`}
            >
              Annual
              <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Save 20%
              </span>
            </button>
          </div>
        </div>
        </Reveal>

        <RevealGroup className="mx-auto mt-14 grid max-w-4xl gap-8 lg:grid-cols-2" step={90}>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-card border p-8 transition-all ${
                tier.popular
                  ? "border-primary bg-white shadow-xl shadow-primary/10"
                  : "border-border bg-white"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-neutral-900">{tier.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-neutral-900">
                  ${annual ? tier.yearlyPrice : tier.monthlyPrice}
                </span>
                <span className="text-sm text-neutral-500">{tier.period}</span>
              </div>
              {annual && (
                <p className="mt-1 text-xs text-neutral-400">
                  ${tier.yearlyPrice * 12}/year
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {tier.description}
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.cta.href}
                className={`mt-8 block rounded-control py-3 text-center text-sm font-semibold transition-colors ${
                  tier.cta.primary
                    ? "bg-primary text-white hover:bg-primary-hover"
                    : "border border-border bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {tier.cta.label}
              </Link>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
