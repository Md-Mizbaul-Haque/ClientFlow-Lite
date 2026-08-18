import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Design Agency",
  description:
    "For design agencies: replace PDF proposals, email signatures, and spreadsheet trackers with one polished client portal.",
};

export default function DesignAgencyPage() {
  return (
    <MarketingPage
      badge="Use case Â· Design Agency"
      title={
        <>
          For design agencies that want to <span className="text-primary">look as good as their work</span>
        </>
      }
      description="Replace PDF proposals, email signatures, and spreadsheet trackers with one polished portal for your studio."
      bullets={["On-brand proposals", "Client sign-off in minutes", "Deposits before kickoff"]}
      features={[
        {
          icon: "palette",
          title: "On-brand proposals",
          description:
            "Present scope, deliverables, and pricing in a clean, professional document your clients will actually read.",
        },
        {
          icon: "signature",
          title: "Client sign-off in minutes",
          description:
            "Clients check off deliverables and sign digitally â€” no print, no scan, no chasing.",
        },
        {
          icon: "wallet",
          title: "Deposits before kickoff",
          description:
            "Collect a deposit the moment the proposal is signed, so every project starts funded.",
        },
      ]}
      ctaTitle="Give your studio a portal clients love"
      ctaText="15-day free trial, no credit card required. Look as professional as the work you ship."
    />
  );
}