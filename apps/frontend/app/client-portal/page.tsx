import type { LucideIcon } from "lucide-react";
import { Check, FileText, Globe, LayoutDashboard, MessagesSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CtaBlock } from "@/components/site/cta-block";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { Reveal, RevealGroup } from "@/components/site/reveal";

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

      <section className="relative overflow-hidden bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-2xl">
              <p className="animate-fade-up flex items-center gap-3 text-sm font-semibold text-primary">
                <Link href="/#services" className="transition-colors hover:text-primary-hover">
                  Services
                </Link>
                <span aria-hidden="true" className="text-neutral-400">
                  /
                </span>
                <span>Client Portal</span>
              </p>
              <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                A portal your clients will actually open.
              </h1>
              <p className="animate-fade-up mt-4 max-w-lg text-pretty text-lg leading-relaxed text-neutral-600 [animation-delay:80ms]">
                Your logo, your domain, your work. Clients track progress, grab files, and pay
                without another email thread.
              </p>
              <ul className="animate-fade-up mt-8 space-y-3 [animation-delay:160ms]">
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
              <div className="animate-fade-up mt-8 flex w-full flex-col gap-3 [animation-delay:240ms] sm:w-auto sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-control bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Try for free
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-2 py-3 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
                >
                  See pricing
                </Link>
              </div>
            </div>
            <Reveal delay={120}>
              <div
                aria-hidden="true"
                className="rounded-card border border-border bg-page-bg p-5 shadow-card sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    Brightline Studio
                  </p>
                  <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                    portal.youragency.com
                  </span>
                </div>
                <div className="mt-4 space-y-2.5">
                  <div className="rounded-control bg-white px-4 py-3 shadow-card">
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-800">
                        Pricing page copy + layout
                      </span>
                      <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                        In Progress
                      </span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full w-2/3 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-control bg-white px-4 py-3 shadow-card">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-800">
                      Autumn social kit — 24 assets
                    </span>
                    <span className="shrink-0 rounded-full bg-[#DEF7EC] px-2 py-0.5 text-[10px] font-semibold text-success-deep">
                      Delivered
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-control bg-primary px-4 py-2 text-[11px] font-semibold text-white">
                      Approve files
                    </span>
                    <span className="rounded-control border border-border bg-white px-4 py-2 text-[11px] font-semibold text-neutral-700">
                      Leave a comment
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-page-bg py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="flex items-center gap-3 text-sm font-semibold text-primary">
                <span aria-hidden="true" className="text-neutral-400">
                  01
                </span>
                <span aria-hidden="true" className="h-px w-8 bg-border-strong" />
                What you get
              </p>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Everything the client needs, nothing they have to learn.
              </h2>
            </div>
          </Reveal>
          <RevealGroup className="mt-10 border-t border-border" step={80}>
            {blocks.map((block, i) => (
              <div
                key={block.title}
                className="group grid gap-3 border-b border-border px-4 py-7 transition-colors duration-200 hover:bg-white sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.4fr)] sm:items-baseline sm:gap-6 sm:px-6"
              >
                <span aria-hidden="true" className="text-sm font-semibold text-neutral-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="flex items-center gap-2.5 text-base font-semibold text-neutral-900 transition-colors group-hover:text-primary">
                  <block.icon size={18} aria-hidden="true" className="shrink-0 text-primary" />
                  {block.title}
                </h3>
                <p className="max-w-xl text-pretty text-sm leading-relaxed text-neutral-600">
                  {block.description}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBlock />
      <Footer />
    </main>
  );
}
