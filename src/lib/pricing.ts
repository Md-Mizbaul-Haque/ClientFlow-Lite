import { type IconName } from "@/components/icons";


export const TRIAL_DAYS = 15;

export type BillingPeriod = "monthly" | "annual";

export interface PricingPlan {
  name: string;
  icon: IconName;
  price: number;
  annualPrice: number;
  tagline: string;
  features: string[];
  featured: boolean;
}

export const plans: PricingPlan[] = [
  {
    name: "Starter",
    icon: "zap",
    price: 19,
    annualPrice: 15,
    tagline: "For solo freelancers getting started.",
    features: [
      "1 workspace",
      "Up to 5 clients",
      "Proposals + e-sign",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Pro",
    icon: "rocket",
    price: 39,
    annualPrice: 31,
    tagline: "For growing agencies that ship a lot.",
    features: [
      "Unlimited clients",
      "Stripe deposits & invoices",
      "Milestone board with realtime sync",
      "Custom proposal templates",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Agency",
    icon: "building",
    price: 79,
    annualPrice: 63,
    tagline: "For teams that need white-label polish.",
    features: [
      "Multi-seat access",
      "White-label client portal",
      "Audit log & admin controls",
      "Dedicated support",
    ],
    featured: false,
  },
];