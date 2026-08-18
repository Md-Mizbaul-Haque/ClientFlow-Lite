import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Payments",
  description:
    "Deposits and final invoices with Stripe-powered checkout, tracked against accepted proposals.",
};

export default function PaymentsPage() {
  return (
    <MarketingPage
      badge="Platform Â· Payments"
      title={
        <>
          Get paid <span className="text-primary">without the chase</span>
        </>
      }
      description="Deposits and final invoices with Stripe-powered checkout, tracked against accepted proposals."
      bullets={["Stripe-powered checkout", "Deposits & final invoices", "Tracked against proposals"]}
      features={[
        {
          icon: "wallet",
          title: "Deposits up front",
          description:
            "Collect a deposit the moment a proposal is signed, before work kicks off.",
        },
        {
          icon: "payment",
          title: "Invoices that pay themselves",
          description:
            "Send invoices with one click â€” clients pay by card without leaving the portal.",
        },
        {
          icon: "reporting",
          title: "Payment tracking",
          description:
            "Every payment is tracked against the accepted proposal, so totals always add up.",
        },
      ]}
      ctaTitle="Start getting paid faster"
      ctaText="15-day free trial, no credit card required. Retire your PayPal links for good."
    />
  );
}