import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";

export const metadata: Metadata = {
  title: "Milestones",
  description:
    "Drag projects from In Progress to In Review to Completed. Everyone sees the same live status.",
};

export default function MilestonesPage() {
  return (
    <MarketingPage
      badge="Platform Â· Milestones"
      title={
        <>
          One live board for <span className="text-primary">every project</span>
        </>
      }
      description="Drag projects from In Progress to In Review to Completed. Everyone sees the same live status â€” no status-meeting archaeology."
      bullets={["Drag-and-drop status", "Real-time sync", "Client-visible progress"]}
      features={[
        {
          icon: "milestone",
          title: "Milestone board",
          description:
            "Move work across stages in one click and keep every project's status honest.",
        },
        {
          icon: "refresh",
          title: "Real-time updates",
          description:
            "Status changes sync instantly to every open dashboard â€” no refresh required.",
        },
        {
          icon: "eye",
          title: "Client visibility",
          description:
            "Clients see exactly where their project stands, without a single status email.",
        },
      ]}
      ctaTitle="Move your first milestone today"
      ctaText="15-day free trial, no credit card required. Keep every project moving."
    />
  );
}