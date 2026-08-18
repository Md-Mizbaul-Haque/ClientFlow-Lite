"use client";
import { ClientFlowIcon, IconContainer } from "@/components/icons";
import { useState } from "react";
import Link from "next/link";
import { TRIAL_DAYS, plans, type BillingPeriod } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const annualSavings = Math.round((1 - plans[1].annualPrice / plans[1].price) * 100);

export function PricingCards() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center gap-3">
        <div className="bg-card border-border/60 inline-flex items-center gap-1 rounded-full border p-1 shadow-sm">
          <button
            type="button"
            aria-pressed={billing === "monthly"}
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              billing === "monthly"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={billing === "annual"}
            onClick={() => setBilling("annual")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              billing === "annual"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Annual
            {billing === "monthly" && (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold">
                Save {annualSavings}%
              </span>
            )}
          </button>
        </div>
        <p className="text-muted-foreground text-sm">
          {billing === "annual"
            ? `Billed annually â€” you save ${annualSavings}% versus monthly.`
            : "Billed monthly â€” switch or cancel anytime."}
        </p>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = billing === "annual" ? plan.annualPrice : plan.price;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative",
                plan.featured && "lg:-my-3 lg:py-3"
              )}
            >
              {plan.featured && (
                <div
                  aria-hidden
                  className="bg-primary/15 absolute inset-x-4 top-0 h-40 rounded-full blur-3xl"
                />
              )}
              <Card
                className={cn(
                  "group relative flex h-full flex-col gap-6 border-border/60",
                  plan.featured &&
                    "border-primary/40 shadow-2xl shadow-primary/15"
                )}
              >
                {plan.featured && (
                  <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 gap-1 px-3 py-1">
                    <ClientFlowIcon name="sparkles" size={12} />
                    Most popular
                  </Badge>
                )}
                <CardContent className="flex flex-col gap-6 pt-8">
                  <div className="flex flex-col gap-3">
                    <IconContainer variant={plan.featured ? "filled" : "ring"} boxSize={44}>
                      <ClientFlowIcon name={plan.icon} size={20} className={cn(!plan.featured && "text-primary")} />
                    </IconContainer>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                      <p className="text-muted-foreground text-sm">{plan.tagline}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold tracking-tight">
                        {formatPrice(price)}
                      </span>
                      <span className="text-muted-foreground text-sm">/ month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {billing === "annual" ? "Billed annually" : "Billed monthly"}
                      </span>
                      {billing === "annual" && (
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold">
                          You save {annualSavings}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-border/60 h-px" />

                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="text-muted-foreground flex items-start gap-2.5 text-sm">
                        <ClientFlowIcon name="check-circle" size={16} className="text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    size="lg"
                    variant={plan.featured ? "default" : "outline"}
                    className={cn("mt-auto w-full", plan.featured && "shadow-lg shadow-primary/20")}
                  >
                    <Link href="/free-trial">
                      Start {TRIAL_DAYS}-day free trial
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <p className="text-muted-foreground text-center text-xs">
        Prices in USD Â· {TRIAL_DAYS}-day free trial on every plan Â· No credit card required Â·
        Cancel anytime
      </p>
    </div>
  );
}