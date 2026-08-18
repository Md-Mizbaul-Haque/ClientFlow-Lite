import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "E-sign",
  description:
    "Clients check off deliverables and sign proposals digitally â€” no print, scan, or email loops.",
};

export default function ESignPage() {
  return (
    <MarketingPage
      badge="Platform Â· E-sign"
      title={
        <>
          E-sign in seconds, <span className="text-primary">not weeks of email</span>
        </>
      }
      description="Clients check off deliverables and sign proposals digitally. No more print, scan, sign, and email loops."
      bullets={["Legally binding signatures", "Instant status updates", "Zero training needed"]}
      features={[
        {
          icon: "mouse-pointer",
          title: "Signature pad",
          description:
            "Sign with a mouse, trackpad, or finger â€” no account setup required for your clients.",
        },
        {
          icon: "task",
          title: "Scope check-off",
          description:
            "Clients confirm each deliverable, so scope changes are never a surprise.",
        },
        {
          icon: "notification",
          title: "Instant notifications",
          description: "You and your team are notified the moment a proposal is signed.",
        },
      ]}
      ctaTitle="Get your next contract signed today"
      ctaText="15-day free trial, no credit card required. No more chasing signatures by email."
    />
  );
}