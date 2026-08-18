import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Why ClientFlow?",
  description:
    "ClientFlow Lite replaces PDF proposals, email signatures, spreadsheet trackers, and PayPal links with one professional portal.",
};

export default function WhyClientFlowPage() {
  return (
    <MarketingPage
      badge="Why ClientFlow?"
      title={
        <>
          The client portal <span className="text-primary">your agency deserves</span>
        </>
      }
      description="ClientFlow Lite replaces your PDF proposals, email signatures, spreadsheet trackers, and PayPal links with a single, professional workspace your clients will love."
      bullets={["No PDFs", "No spreadsheets", "No PayPal links"]}
      features={[
        {
          icon: "edit",
          title: "Proposal builder",
          description:
            "Assemble scope of work, deliverables, pricing, and dynamic terms with a clean form builder. Send in one click.",
        },
        {
          icon: "signature",
          title: "E-sign in seconds",
          description:
            "Clients check off deliverables and sign proposals digitally. No more PDF ping-pong or email threads.",
        },
        {
          icon: "milestone",
          title: "Milestone board",
          description:
            "Drag projects from In Progress to In Review to Completed. Everyone sees the same live status.",
        },
        {
          icon: "wallet",
          title: "Payments built in",
          description:
            "Deposits and final invoices with Stripe-powered checkout, tracked against accepted proposals.",
        },
        {
          icon: "lock",
          title: "Private by design",
          description:
            "Role-based access means clients only ever see their own proposals, projects, and invoices.",
        },
        {
          icon: "zap",
          title: "Real-time updates",
          description:
            "Status changes, signatures, and payments sync instantly to every open dashboard.",
        },
      ]}
      ctaTitle="Start your 15-day free trial today"
      ctaText="No credit card required. Cancel anytime. Set up your workspace in minutes."
    />
  );
}