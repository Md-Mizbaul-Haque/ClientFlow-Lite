import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Role-based access means clients only ever see their own proposals, projects, and invoices.",
};

export default function SecurityPage() {
  return (
    <MarketingPage
      badge="Platform Â· Security"
      title={
        <>
          Private by <span className="text-primary">design</span>
        </>
      }
      description="Role-based access means clients only ever see their own proposals, projects, and invoices. Guaranteed by design."
      bullets={["Role-based access", "Client data isolation", "Server-side scoping"]}
      features={[
        {
          icon: "lock",
          title: "Role-based access",
          description:
            "Admins, team members, and clients each get exactly the permissions they need â€” nothing more.",
        },
        {
          icon: "shield",
          title: "Client isolation",
          description:
            "Client A will never see Client B's data â€” every query is scoped server-side to the signed-in role and client.",
        },
        {
          icon: "key",
          title: "Admin-only controls",
          description:
            "Agency-side controls stay strictly on your side, with secure sign-in flows throughout.",
        },
      ]}
      ctaTitle="Run your agency with peace of mind"
      ctaText="15-day free trial, no credit card required. Your clients' data stays their data."
    />
  );
}