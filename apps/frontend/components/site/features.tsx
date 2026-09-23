import { FileText, FolderKanban, LayoutDashboard, Receipt, Shield, Users } from "lucide-react";

import { Reveal, RevealGroup } from "@/components/site/reveal";

// Bento layout: one wide hero card (the branded portal — the product frame
// from the hero mockup), one narrow pipeline card, three single cards, and a
// full-width trust strip. Sizes vary deliberately; equal cells would read as
// the old template grid, not a bento.
// `id` gives key cards a stable anchor so the navbar's Services dropdown can
// deep-link to it (#client-portal, #request-management, #invoicing).
// Anchor offset is handled globally by scroll-padding-top in globals.css.
const pipeline = [
  { label: "Submitted", count: 5, width: "w-[26%]" },
  { label: "In progress", count: 7, width: "w-[37%]" },
  { label: "Feedback", count: 4, width: "w-[21%]" },
];

// Literal utility strings on purpose: Tailwind only emits classes it can find
// verbatim in source, matching the hero mockup's revenue bars.
const invoiceBars = ["h-[38%]", "h-[52%]", "h-[44%]", "h-[68%]", "h-[61%]", "h-[86%]"];

const cardShell =
  "flex flex-col overflow-hidden rounded-card border border-border bg-page-bg p-6 sm:p-7";
const iconTile =
  "flex h-10 w-10 items-center justify-center rounded-control border border-border bg-white text-primary shadow-card";
const visualPanel =
  "mt-6 rounded-control border border-border bg-white p-4 shadow-card";

export function Features() {
  return (
    <section id="services" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Editorial header — left-aligned, no pill badge. Index eyebrow,
            headline, and description stack vertically: the old split with the
            description floating in a right column read as a template. */}
        <Reveal>
        <div className="mx-auto max-w-6xl">
          <p className="flex items-center gap-3 text-sm font-semibold text-primary">
            <span aria-hidden="true" className="text-neutral-400">
              01
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-border-strong" />
            What you get
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Everything your agency needs
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-neutral-600">
            One portal replaces five tools. Manage clients, requests, files, and invoices without
            keeping spreadsheets in sync.
          </p>
        </div>
        </Reveal>

        <RevealGroup className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-6" step={70}>
          {/* Hero cell — the branded portal. Wide because its mini dashboard
              needs room: sidebar, stats, and queue rows side by side. */}
          <div id="client-portal" className={`${cardShell} sm:col-span-2 lg:col-span-4`}>
            <div className={iconTile}>
              <LayoutDashboard size={20} aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-neutral-900">Client Portal</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-600">
              Give every client a branded dashboard to track projects, view deliverables, and communicate
              with your team.
            </p>
            <div aria-hidden="true" className={`${visualPanel} hidden sm:block`}>
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-2 truncate rounded-control bg-page-bg px-3 py-1 text-[11px] text-neutral-400">
                  clearsmile.clientflowlite.com
                </span>
              </div>
              <div className="flex gap-3 pt-3">
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
                  <div className="mt-2.5 flex items-center gap-2 rounded-control bg-page-bg px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-neutral-700">
                      Pricing page copy + layout
                    </span>
                    <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-primary">
                      In Progress
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 rounded-control bg-page-bg px-3 py-2">
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

          {/* Pipeline cell — narrow by design: label, count, and bar stack
              vertically without needing width. */}
          <div id="request-management" className={`${cardShell} lg:col-span-2`}>
            <div className={iconTile}>
              <FolderKanban size={20} aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-neutral-900">Request Management</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              All requests land in one queue where you can prioritize and track them.
            </p>
            <div aria-hidden="true" className={`${visualPanel} flex flex-1 flex-col justify-center gap-3`}>
              {pipeline.map((stage) => (
                <div key={stage.label}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-medium text-neutral-500">{stage.label}</span>
                    <span className="text-sm font-bold text-neutral-900">{stage.count}</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-100">
                    <div className={`h-full rounded-full bg-primary ${stage.width}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Single cells — one job each: a stat, a note, a file row. */}
          <div id="invoicing" className={`${cardShell} lg:col-span-2`}>
            <div className={iconTile}>
              <Receipt size={20} aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-neutral-900">Invoicing</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Invoice completed work and get paid faster from the same portal.
            </p>
            <div aria-hidden="true" className={`${visualPanel} flex items-end justify-between gap-3`}>
              <div>
                <p className="text-[11px] font-medium text-neutral-500">Paid this month</p>
                <p className="mt-0.5 text-xl font-bold text-neutral-900">$8,420</p>
                <span className="text-[11px] font-semibold text-success-deep">+18%</span>
              </div>
              <div className="flex h-12 shrink-0 items-end gap-1">
                {invoiceBars.map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className={`w-1.5 rounded-full ${height} ${
                      index === invoiceBars.length - 1 ? "bg-primary" : "bg-primary/25"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div id="team-collaboration" className={`${cardShell} lg:col-span-2`}>
            <div className={iconTile}>
              <Users size={20} aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-neutral-900">Team Collaboration</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Assign tasks and leave internal notes without switching tools.
            </p>
            <div aria-hidden="true" className={visualPanel}>
              <div className="flex items-center">
                {["MR", "TS", "JK"].map((initials) => (
                  <span
                    key={initials}
                    className="-ml-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-neutral-800 text-[10px] font-semibold text-white first:ml-0"
                  >
                    {initials}
                  </span>
                ))}
                <span className="-ml-1 flex h-7 items-center rounded-full border-2 border-white bg-primary-soft px-2 text-[10px] font-semibold text-primary">
                  +4
                </span>
              </div>
              <p className="mt-3 rounded-control rounded-tl-none bg-page-bg px-3 py-2 text-[11px] leading-relaxed text-neutral-600">
                <span className="font-semibold text-neutral-800">Internal note —</span> homepage copy
                approved, send to client.
              </p>
            </div>
          </div>

          <div id="file-delivery" className={`${cardShell} lg:col-span-2`}>
            <div className={iconTile}>
              <FileText size={20} aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-neutral-900">File Delivery</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Share deliverables and collect approvals inside the portal.
            </p>
            <div aria-hidden="true" className={`${visualPanel} flex flex-col gap-2`}>
              <div className="flex items-center gap-2 rounded-control bg-page-bg px-3 py-2">
                <FileText size={14} className="shrink-0 text-neutral-400" />
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-neutral-700">
                  hero-mockup-v3.fig
                </span>
                <span className="shrink-0 rounded-full bg-[#DEF7EC] px-2 py-0.5 text-[10px] font-medium text-success-deep">
                  Approved
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-control bg-page-bg px-3 py-2">
                <FileText size={14} className="shrink-0 text-neutral-400" />
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-neutral-700">
                  pricing-page-copy.docx
                </span>
                <span className="shrink-0 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-medium text-[#92400E]">
                  Feedback
                </span>
              </div>
            </div>
          </div>

          {/* Trust strip — full width, horizontal. Security is reassurance,
              not a feature to browse, so it does not compete as an equal card. */}
          <div id="security" className={`${cardShell} sm:col-span-2 lg:col-span-6 lg:flex-row lg:items-center lg:gap-8`}>
            <div className="min-w-0 flex-1">
              <div className={iconTile}>
                <Shield size={20} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-neutral-900">Security &amp; Privacy</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
                Every tenant is fully isolated. Your clients see only their data, encrypted at rest and in
                transit.
              </p>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2 lg:mt-0 lg:max-w-sm lg:justify-end">
              {["Tenant-isolated", "Encrypted at rest & in transit", "SOC 2-aligned"].map((badge) => (
                <li
                  key={badge}
                  className="rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-card"
                >
                  {badge}
                </li>
              ))}
            </ul>
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
