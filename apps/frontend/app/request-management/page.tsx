import type { LucideIcon } from "lucide-react";
import { Check, ClipboardList, Flag, FolderKanban } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CtaBlock } from "@/components/site/cta-block";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

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

export default function RequestManagementPage() {
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
                <span>Request Management</span>
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
                Every request in one queue.
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-neutral-600">
                Clients submit through structured forms. You prioritize, assign, and deliver.
                Nothing slips through email again.
              </p>
              <ul className="mt-8 space-y-3">
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
            </div>
            <div
              aria-hidden="true"
              className="rounded-card border border-border bg-page-bg p-5 shadow-card sm:p-6"
            >
              <div className="rounded-control border border-border bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-neutral-500">Submitted</span>
                  <span className="text-sm font-bold text-neutral-900">5</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full w-[26%] rounded-full bg-primary" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-neutral-500">In progress</span>
                  <span className="text-sm font-bold text-neutral-900">7</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full w-[37%] rounded-full bg-primary" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-neutral-500">Feedback</span>
                  <span className="text-sm font-bold text-neutral-900">4</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full w-[21%] rounded-full bg-primary" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-control border border-border bg-white px-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-neutral-700">
                  Homepage hero copy + size specs included
                </span>
                <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-primary">
                  High priority
                </span>
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
