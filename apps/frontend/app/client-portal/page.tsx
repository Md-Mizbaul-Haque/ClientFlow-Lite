import type { LucideIcon } from "lucide-react";
import { Check, FileText, Globe, LayoutDashboard, MessagesSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CtaBlock } from "@/components/site/cta-block";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

export const metadata: Metadata = {
  title: "Client Portal for Agencies | ClientFlow Lite",
  description: "A branded portal where clients track progress, grab files, and pay. Your logo, your domain, your work.",
};

const blocks: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: LayoutDashboard,
    title: "Branded dashboard",
    description: "Your logo, colors, and domain. Clients see your agency, never ours.",
  },
  {
    icon: FileText,
    title: "File delivery and approvals",
    description: "Share mockups, videos, and docs. Clients approve or comment on the file itself.",
  },
  {
    icon: MessagesSquare,
    title: "Messaging in context",
    description: "Every discussion stays attached to the request it belongs to. Nothing lost in inboxes.",
  },
  {
    icon: Globe,
    title: "Custom domain",
    description: "Serve the portal from portal.youragency.com. One CNAME record and it is yours.",
  },
];

export default function ClientPortalPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-2xl">
              <p className="flex items-center gap-3 text-sm font-semibold text-primary">
                <Link href="/#services" className="transition-colors hover:text-primary-hover">
                  Services
                </Link>
                <span aria-hidden="true" className="text-neutral-400">
                  /
                </span>
                <span>Client Portal</span>
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                A portal your clients will actually open.
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-neutral-600">
                Your logo, your domain, your work. Clients track progress, grab files, and pay
                without another email thread.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Branded with your logo, colors, and domain",
                  "Track progress, approve files, and pay in one place",
                  "No more lost threads or missing attachments",
                ].map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-sm text-neutral-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              aria-hidden="true"
              className="rounded-card border border-border bg-page-bg p-5 shadow-card sm:p-6"
            >
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-2 truncate rounded-control bg-white px-3 py-1 text-[11px] text-neutral-400">
                  portal.youragency.com
                </span>
              </div>
              <div className="flex gap-3 pt-4">
                <div className="flex w-16 shrink-0 flex-col gap-1.5 rounded-control bg-primary p-2">
                  <span className="h-1.5 w-8 rounded-full bg-white" />
                  <span className="h-1.5 w-10 rounded-full bg-white/60" />
                  <span className="h-1.5 w-7 rounded-full bg-white/40" />
                  <span className="h-1.5 w-9 rounded-full bg-white/40" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="h-2 w-24 rounded-full bg-neutral-800" />
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                      12 active
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 rounded-control bg-white px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-neutral-700">
                      Pricing page copy + layout
                    </span>
                    <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-primary">
                      In Progress
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 rounded-control bg-white px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-neutral-700">
                      Autumn social kit — 24 assets
                    </span>
                    <span className="shrink-0 rounded-full bg-[#DEF7EC] px-2 py-0.5 text-[10px] font-medium text-success-deep">
                      Delivered
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-page-bg py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {blocks.map((block) => (
              <div
                key={block.title}
                className="flex flex-col rounded-card border border-border bg-white p-6 sm:p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-control bg-primary-soft text-primary">
                  <block.icon size={20} aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-neutral-900">{block.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{block.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBlock />
      <Footer />
    </main>
  );
}
