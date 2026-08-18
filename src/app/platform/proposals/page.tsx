import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Proposals",
  description:
    "Build polished proposals with deliverables, pricing, and dynamic terms â€” and send them in one click.",
};

export default function ProposalsPage() {
  return (
    <MarketingPage
      badge="Platform Â· Proposals"
      title={
        <>
          Polished proposals in minutes, <span className="text-primary">signed in seconds</span>
        </>
      }
      description="Assemble scope of work, deliverables, pricing, and dynamic terms with a clean form builder â€” then send to your client in one click."
      bullets={["Dynamic terms & pricing", "One-click send", "No PDF ping-pong"]}
      features={[
        {
          icon: "edit",
          title: "Form builder",
          description:
            "Assemble scope, deliverables, and pricing line items without touching a template engine.",
        },
        {
          icon: "signature",
          title: "Built-in e-sign",
          description:
            "Clients check off deliverables and sign digitally right inside the proposal.",
        },
        {
          icon: "refresh",
          title: "Live status",
          description: "See exactly where every proposal is: Draft, Sent, Viewed, Signed.",
        },
      ]}
      ctaTitle="Send your first proposal today"
      ctaText="15-day free trial, no credit card required. Your clients will thank you."
    />
  );
}