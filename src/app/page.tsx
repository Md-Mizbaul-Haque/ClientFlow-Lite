import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileSignature,
  KanbanSquare,
  LayoutDashboard,
  Lock,
  PenLine,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: PenLine,
    title: "Proposal builder",
    description:
      "Assemble scope of work, deliverables, pricing, and dynamic terms with a clean form builder. Send in one click.",
  },
  {
    icon: FileSignature,
    title: "E-sign in seconds",
    description:
      "Clients check off deliverables and sign proposals digitally. No more PDF ping-pong or email threads.",
  },
  {
    icon: KanbanSquare,
    title: "Milestone board",
    description:
      "Drag projects from In Progress to In Review to Completed. Everyone sees the same live status.",
  },
  {
    icon: Wallet,
    title: "Payments built in",
    description:
      "Deposits and final invoices with Stripe-powered checkout, tracked against accepted proposals.",
  },
  {
    icon: Lock,
    title: "Private by design",
    description:
      "Role-based access means clients only ever see their own proposals, projects, and invoices.",
  },
  {
    icon: Zap,
    title: "Real-time updates",
    description:
      "Status changes, signatures, and payments sync instantly to every open dashboard.",
  },
];

const steps = [
  { n: "01", title: "Create the proposal", text: "Build a polished proposal with deliverables and terms in minutes." },
  { n: "02", title: "Client signs online", text: "Your client reviews, checks off scope, and e-signs — no prints." },
  { n: "03", title: "Track & get paid", text: "Milestones move on the board, invoices are paid, work ships." },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/magic-link">Client portal</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="bg-primary/10 pointer-events-none absolute inset-0">
            <div className="absolute -top-32 left-1/2 h-96 w-[50rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute top-40 -right-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
          </div>

          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col items-start gap-6">
              <span className="border-border/60 bg-card/70 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
                <Sparkles className="text-primary size-3.5" />
                The client portal your agency deserves
              </span>
              <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Proposals, signatures &amp; payments —{" "}
                <span className="text-primary">one polished portal.</span>
              </h1>
              <p className="text-muted-foreground max-w-lg text-lg leading-relaxed text-pretty">
                ClientFlow Lite replaces your PDF proposals, email signatures, spreadsheet
                trackers, and PayPal links with a single, professional workspace your clients
                will love.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/login">
                    Explore the demo
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/auth/magic-link">Client sign in</Link>
                </Button>
              </div>
              <ul className="text-muted-foreground mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {["No PDFs", "No spreadsheets", "No PayPal links"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="text-primary size-4" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="bg-card border-border/60 rounded-2xl border p-6 shadow-2xl backdrop-blur">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                      <FileSignature className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Website Redesign Proposal</p>
                      <p className="text-muted-foreground text-xs">Northwind Studio · #PRP-2026-001</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 px-2.5 py-0.5 text-xs font-medium">
                    Signed ✓
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Design system & style guide", done: true },
                    { label: "12 responsive page templates", done: true },
                    { label: "CMS integration", done: false },
                    { label: "Launch & training", done: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="border-border/60 bg-muted/40 flex items-center gap-3 rounded-lg border px-3 py-2.5"
                    >
                      <BadgeCheck
                        className={cn(
                          "size-4 shrink-0",
                          item.done ? "text-emerald-500" : "text-muted-foreground/40"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          item.done ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </span>
                      {item.done && (
                        <span className="text-muted-foreground ml-auto text-xs font-medium">
                          Accepted
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Total investment</p>
                    <p className="text-lg font-semibold">$12,500</p>
                  </div>
                  <Button size="sm" className="pointer-events-none opacity-90">
                    Pay deposit · $3,750
                  </Button>
                </div>
              </div>
              <div className="bg-card border-border/60 absolute -bottom-6 -left-4 hidden rounded-xl border px-4 py-3 shadow-xl backdrop-blur sm:block">
                <div className="flex items-center gap-3">
                  <span className="bg-violet-500/10 text-violet-500 flex size-9 items-center justify-center rounded-lg">
                    <LayoutDashboard className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">Milestone moved</p>
                    <p className="text-muted-foreground text-xs">In Review → Completed · live</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
            {steps.map((step) => (
              <div key={step.n} className="flex flex-col gap-2">
                <span className="text-primary font-mono text-sm">{step.n}</span>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-10 flex flex-col items-start gap-3">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything in one place
            </h2>
            <p className="text-muted-foreground max-w-2xl text-lg text-pretty">
              Built for agencies that want to look as professional as the work they ship.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="group border-border/60 gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <CardContent className="flex flex-col gap-4">
                  <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="mb-1 font-semibold">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
              <ShieldCheck className="size-6" />
            </div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Client A will never see Client B&apos;s data. Guaranteed by design.
            </h2>
            <p className="text-muted-foreground max-w-xl text-lg text-pretty">
              Every query is scoped server-side to the signed-in role and client. Admin controls
              stay strictly on the agency side.
            </p>
            <div className="mt-2 flex gap-3">
              <Button asChild size="lg">
                <Link href="/login">
                  Start building
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/magic-link">Client portal</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6">
          <Brand />
          <p className="text-muted-foreground">
            ClientFlow Lite — a micro-SaaS client portal &amp; proposal generator.
          </p>
        </div>
      </footer>
    </div>
  );
}