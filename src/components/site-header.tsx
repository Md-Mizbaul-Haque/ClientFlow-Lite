"use client";
import { ClientFlowIcon, IconContainer, type IconName } from "@/components/icons";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MegaLink {
  label: string;
  href: string;
  icon: IconName;
  description: string;
}

const platformMegaLinks: MegaLink[] = [
  {
    label: "Client portal",
    href: "/portal",
    icon: "dashboard",
    description: "Clients get their own login to review, sign, and track work.",
  },
  {
    label: "Billing",
    href: "/portal/invoices",
    icon: "payment",
    description: "Deposits and invoices with Stripe-powered checkout.",
  },
  {
    label: "Time tracking",
    href: "/platform/milestones",
    icon: "calendar-clock",
    description: "Log hours against milestones and roll them into invoices.",
  },
  {
    label: "CRM",
    href: "/platform/proposals",
    icon: "client",
    description: "Keep every lead, contact, and conversation in one place.",
  },
  {
    label: "Projects",
    href: "/portal/projects",
    icon: "project",
    description: "Deliverables, status, and handoff from one board.",
  },
  {
    label: "Reporting",
    href: "/platform/payments",
    icon: "reporting",
    description: "See revenue, utilization, and pipeline at a glance.",
  },
];

const useCaseLinks: MegaLink[] = [
  {
    label: "Design Agency",
    href: "/use-cases/design-agency",
    icon: "palette",
    description: "On-brand proposals, sign-offs, and deposits for your studio.",
  },
  {
    label: "Webflow Agency",
    href: "/use-cases/webflow-agency",
    icon: "globe",
    description: "Scope builds, approve milestones, and invoice on launch.",
  },
  {
    label: "Video Production Agency",
    href: "/use-cases/video-production-agency",
    icon: "clapperboard",
    description: "Lock scope, check off revisions, and collect deposits up front.",
  },
  {
    label: "Architecture & 3D Design Agency",
    href: "/use-cases/architecture-3d-design",
    icon: "building",
    description: "Phase-based proposals and milestone invoicing for large projects.",
  },
];

const triggerClasses =
  "border border-transparent focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring/50";

const menuPanelClasses =
  "bg-popover text-popover-foreground z-50 overflow-x-hidden overflow-y-auto rounded-md border p-3 shadow-md";

const megaItemClasses =
  "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group relative flex cursor-default items-start gap-3 rounded-xl p-3 text-sm outline-hidden select-none";

function MegaMenu({
  label,
  links,
  panelClassName,
  gridClassName,
}: {
  label: string;
  links: MegaLink[];
  panelClassName?: string;
  gridClassName?: string;
}) {
  return (
    <div className="group relative">
      <Button
        variant="ghost"
        size="sm"
        aria-haspopup="menu"
        className={cn(triggerClasses, "gap-1")}
      >
        {label}
        <ClientFlowIcon
          name="chevron-down"
          size={14}
          className="text-muted-foreground transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
        />
      </Button>
      <div className="invisible absolute top-full left-0 z-50 translate-y-1 pt-2 opacity-0 transition-[opacity,transform,visibility] duration-150 ease-out delay-75 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-0 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:delay-0">
        <div className={cn(menuPanelClasses, panelClassName)}>
          <div className={cn("grid gap-1", gridClassName)}>
            {links.map(({ label: itemLabel, href, icon: Icon, description }) => (
              <Link key={href} href={href} className={megaItemClasses}>
                <IconContainer variant="ring" boxSize={40}>
                  <ClientFlowIcon name={Icon} size={20} className="text-primary" />
                </IconContainer>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{itemLabel}</span>
                  <span className="text-muted-foreground mt-0.5 text-xs leading-snug">
                    {description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Brand />
        <nav className="hidden items-center gap-1 lg:flex">
          <MegaMenu label="Platform" links={platformMegaLinks} panelClassName="w-[620px]" gridClassName="grid-cols-3" />
          <MegaMenu label="Use cases" links={useCaseLinks} panelClassName="w-[560px]" gridClassName="grid-cols-2" />
          <Button variant="ghost" size="sm" asChild className={triggerClasses}>
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className={triggerClasses}>
            <Link href="/why-clientflow">Why ClientFlow?</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/20"
          >
            <Link href="/free-trial">
              <ClientFlowIcon name="sparkles" size={18} />
              Try it for free
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}