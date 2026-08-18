import { ClientFlowIcon, IconContainer, type IconName } from "@/components/icons";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TRIAL_DAYS } from "@/lib/pricing";

const valueProps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "signature",
    title: "Proposals that win",
    text: "Polished proposals with e-sign built in — clients sign in seconds, not weeks.",
  },
  {
    icon: "milestone",
    title: "Projects that move",
    text: "Milestones progress live on the board, so everyone sees the same status.",
  },
  {
    icon: "wallet",
    title: "Payments that arrive",
    text: "Deposits and final invoices with Stripe checkout, tracked to the penny.",
  },
  {
    icon: "shield",
    title: "Data that stays private",
    text: "Role-based access means clients only ever see their own work.",
  },
];

const roadmap = [
  "AI-assisted proposal drafting",
  "Client retainer billing",
  "Slack & email digests",
];

const stats = ["2.4× faster proposals", "12 hrs saved / month", "99.9% uptime"];

export function AuthMarketingPanel({
  variant = "login",
}: {
  variant?: "login" | "signup";
}) {
  const cta =
    variant === "login"
      ? { label: `Start your ${TRIAL_DAYS}-day free trial`, href: "/free-trial" }
      : { label: "See plans from $19/mo", href: "/pricing" };

  return (
    <div className="hidden flex-col gap-6 lg:flex">
      <div className="flex flex-col gap-3">
        <span className="border-border/60 bg-card/70 text-muted-foreground inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
          <ClientFlowIcon name="sparkles" size={14} className="text-primary" />
          {TRIAL_DAYS} days free · No credit card required
        </span>
        <h2 className="text-3xl leading-[1.15] font-semibold tracking-tight text-balance sm:text-4xl">
          {variant === "login"
            ? "Your agency deserves a workflow clients will love."
            : "Everything your agency needs to look professional."}
        </h2>
        <p className="text-muted-foreground max-w-md text-lg leading-relaxed text-pretty">
          {variant === "login"
            ? "Proposals, signatures, milestones, and payments — replaced with one polished portal."
            : "Proposals, signatures, milestones, and payments — in one place, from day one."}
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {valueProps.map((v) => (
          <li key={v.title} className="flex items-start gap-3">
            <IconContainer variant="crop" boxSize={36}>
              <ClientFlowIcon name={v.icon} size={16} className="text-primary" />
            </IconContainer>
            <div>
              <p className="font-medium">{v.title}</p>
              <p className="text-muted-foreground text-sm">{v.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-border/60 bg-card relative rounded-xl border p-5 shadow-sm">
        <ClientFlowIcon name="quote" size={24} className="text-primary/40 absolute top-4 right-4" />
        <p className="text-sm leading-relaxed text-pretty">
          &ldquo;We closed two clients on the same week we started using ClientFlow Lite. The
          proposals finally look as good as our work.&rdquo;
        </p>
        <p className="text-muted-foreground mt-3 text-xs font-medium">
          — Studio lead, Northwind Studio
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">
          Upcoming features <span className="text-muted-foreground font-normal">— coming soon</span>
        </p>
        <ul className="flex flex-col gap-2">
          {roadmap.map((f) => (
            <li key={f} className="text-muted-foreground flex items-center gap-2 text-sm">
              <ClientFlowIcon name="sparkles" size={16} className="text-primary shrink-0" />
              {f}
              <Badge variant="outline" className="border-primary/30 text-primary">
                Coming soon
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2">
        {stats.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span className="bg-border h-8 w-px" />}
            <span className="text-muted-foreground text-xs">{s}</span>
          </span>
        ))}
      </div>

      <Button
        asChild
        variant="outline"
        className="border-border/60 bg-card/60 backdrop-blur hover:bg-accent/60"
      >
        <Link href={cta.href}>
          {cta.label}
          <ClientFlowIcon name="arrow-right" size={16} />
        </Link>
      </Button>
    </div>
  );
}
