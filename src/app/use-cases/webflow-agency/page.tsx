import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Webflow Agency",
  description:
    "For Webflow agencies: scope responsive builds, collect milestone approvals, and get paid on launch.",
};

export default function WebflowAgencyPage() {
  return (
    <MarketingPage
      badge="Use case Â· Webflow Agency"
      title={
        <>
          For Webflow agencies shipping <span className="text-primary">sites, not emails</span>
        </>
      }
      description="Scope responsive builds, collect milestone approvals, and get paid on launch â€” all in one client portal."
      bullets={["Clear scope for builds", "Milestone approvals", "Launch-day invoices"]}
      features={[
        {
          icon: "globe",
          title: "Scope that sticks",
          description:
            "Lock in page counts, integrations, and revisions up front so every build starts with agreed expectations.",
        },
        {
          icon: "milestone",
          title: "Milestone approvals",
          description:
            "Move builds from Wireframes to Design to Development with client sign-off at every stage.",
        },
        {
          icon: "payment",
          title: "Launch-day invoices",
          description:
            "Send the final invoice the moment the site goes live â€” and get paid by card in the portal.",
        },
      ]}
      ctaTitle="Ship your next build with clarity"
      ctaText="15-day free trial, no credit card required. Fewer scope emails, more launches."
    />
  );
}