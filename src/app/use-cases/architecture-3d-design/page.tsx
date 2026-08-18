import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Architecture & 3D Design Agency",
  description:
    "For architects and 3D studios: stage proposals by phase, get deliverable sign-off, and invoice against milestones.",
};

export default function Architecture3DDesignPage() {
  return (
    <MarketingPage
      badge="Use case Â· Architecture & 3D Design Agency"
      title={
        <>
          For architects and 3D studios <span className="text-primary">building trust, phase by phase</span>
        </>
      }
      description="Stage proposals by phase, get sign-off on deliverables, and invoice against milestones as designs progress."
      bullets={["Phase-based proposals", "Deliverable sign-off", "Milestone invoicing"]}
      features={[
        {
          icon: "box",
          title: "Phase-based proposals",
          description:
            "Structure concept, design development, and visualization phases with clear pricing per stage.",
        },
        {
          icon: "signature",
          title: "Deliverable sign-off",
          description:
            "Clients approve each deliverable â€” from massing studies to final renders â€” before you move on.",
        },
        {
          icon: "wallet",
          title: "Milestone invoicing",
          description:
            "Invoice automatically as phases complete, with payments tracked against the accepted proposal.",
        },
      ]}
      ctaTitle="Bring your phases into one place"
      ctaText="15-day free trial, no credit card required. Keep clients confident at every stage."
    />
  );
}