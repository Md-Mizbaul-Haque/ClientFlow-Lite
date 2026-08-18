import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Video Production Agency",
  description:
    "For production teams: lock scope, manage revisions, and collect deposits before you roll camera.",
};

export default function VideoProductionAgencyPage() {
  return (
    <MarketingPage
      badge="Use case Â· Video Production Agency"
      title={
        <>
          For production teams that <span className="text-primary">edit on deadlines</span>
        </>
      }
      description="Lock scope, manage revisions, and collect deposits before you roll camera. No more chasing invoices mid-edit."
      bullets={["Pre-production proposals", "Revision check-offs", "Deposits before filming"]}
      features={[
        {
          icon: "clapperboard",
          title: "Pre-production proposals",
          description:
            "Scope scripts, shoot days, and post-production clearly before a single frame is shot.",
        },
        {
          icon: "task",
          title: "Revision check-offs",
          description:
            "Clients approve deliverables at each cut â€” so 'one more pass' stops being a surprise.",
        },
        {
          icon: "wallet",
          title: "Deposits before filming",
          description:
            "Collect the deposit with the signed proposal, and keep the edit funded through delivery.",
        },
      ]}
      ctaTitle="Wrap your next project on time"
      ctaText="15-day free trial, no credit card required. Keep the edit moving, not the invoices."
    />
  );
}