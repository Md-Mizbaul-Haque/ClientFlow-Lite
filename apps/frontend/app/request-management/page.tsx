import type { LucideIcon } from "lucide-react";
import { Check, ClipboardList, Flag, FolderKanban } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CtaBlock } from "@/components/site/cta-block";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { Reveal, RevealGroup } from "@/components/site/reveal";

export const metadata: Metadata = {
  title: "Request Management for Agencies | ClientFlow Lite",
  description: "Every client request in one queue. Structured forms, clear priorities, feedback and approvals in the portal.",
};

const blocks: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: FolderKanban,
    title: "One shared queue",
    description: "Submitted, in progress, feedback, delivered. The whole agency sees the same list.",
  },
  {
    icon: ClipboardList,
    title: "Structured request forms",
    description: "Ask for what you need upfront: links, files, sizes, deadlines. Fewer back-and-forths.",
  },
  {
    icon: Flag,
    title: "Priorities that mean something",
    description: "High, medium, low, set by you and visible to the client. Urgent work stops hiding.",
  },
  {
    icon: Check,
    title: "Feedback and approvals",
    description: "Clients review deliverables and sign off inside the portal. The record keeps itself.",
  },
];

const queue: { title: string; meta: string; pill: string; pillClass: string }[] = [
  {
    title: "Homepage hero copy + size specs included",
    meta: "Brightline Studio · due Friday",
    pill: "High priority",
    pillClass: "bg-primary-soft text-primary",
  },
  {
    title: "Testimonial edit — round two",
    meta: "Harbor & Co · waiting on client",
    pill: "Feedback",
    pillClass: "bg-[#FEF3C7] text-[#92400E]",
  },
  {
    title: "Footer links audit",
    meta: "Northwind Bakery · queued",
    pill: "Low priority",
    pillClass: "bg-neutral-100 text-neutral-600",
  },
];

export default function RequestManagementPage() {
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
                <span>Request Management</span>
              </p>
              <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                Every request in one queue.
              </h1>
              <p className="animate-fade-up mt-4 max-w-lg text-pretty text-lg leading-relaxed text-neutral-600 [animation-delay:80ms]">
                Clients submit through structured forms. You prioritize, assign, and deliver.
                Nothing slips through email again.
              </p>
              <ul className="animate-fade-up mt-8 space-y-3 [animation-delay:160ms]">
                {[
                  "Structured forms collect links, files, and deadlines upfront",
                  "One shared queue the whole team prioritizes together",
                  "Feedback and approvals recorded inside the portal",
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
                  <p className="text-sm font-semibold text-neutral-900">Incoming queue</p>
                  <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                    3 open
                  </span>
                </div>
                <div className="mt-4 space-y-2.5">
                  {queue.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-control bg-white px-4 py-3 shadow-card"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-neutral-800">
                          {item.title}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.pillClass}`}
                        >
                          {item.pill}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-neutral-500">{item.meta}</p>
                    </div>
                  ))}
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
                  02
                </span>
                <span aria-hidden="true" className="h-px w-8 bg-border-strong" />
                How it flows
              </p>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                From client message to signed-off delivery.
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
