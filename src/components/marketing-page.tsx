import { ClientFlowIcon, IconContainer, type IconName } from "@/components/icons";
import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { HeroBackground } from "@/components/hero-background";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Feature = {
  icon: IconName;
  title: string;
  description: string;
};

export function MarketingPage({
  badge,
  title,
  description,
  bullets,
  features,
  ctaTitle,
  ctaText,
  ctaLabel = "Start free trial",
  ctaHref = "/free-trial",
}: {
  badge: string;
  title: ReactNode;
  description: string;
  bullets?: string[];
  features?: Feature[];
  ctaTitle: string;
  ctaText: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <HeroBackground />

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-6 sm:py-24">
            <span className="border-border/60 bg-card/70 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
              <ClientFlowIcon name="sparkles" size={14} className="text-primary" />
              {badge}
            </span>
            <h1 className="max-w-3xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl">
              {title}
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed text-pretty">
              {description}
            </p>
            {bullets && (
              <ul className="text-muted-foreground mt-2 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                {bullets.map((b) => (
                  <li key={b} className="flex items-center gap-1.5">
                    <ClientFlowIcon name="check-circle" size={16} className="text-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="group shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
              >
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ClientFlowIcon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-border/60 bg-card/60 backdrop-blur hover:bg-accent/60"
              >
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {features && (
          <section className="border-y bg-muted/30">
            <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
              {features.map((f) => (
                <Card
                  key={f.title}
                  className="group border-border/60 gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <CardContent className="flex flex-col gap-4">
                    <IconContainer variant="ring" boxSize={40}>
                      <ClientFlowIcon name={f.icon} size={20} className="text-primary" />
                    </IconContainer>
                    <div>
                      <h3 className="mb-1 font-semibold">{f.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {f.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="border-border/60 bg-card relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border px-6 py-14 text-center shadow-xl">
            <div className="bg-primary/10 pointer-events-none absolute inset-0">
              <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            </div>
            <IconContainer variant="ring" boxSize={48}>
              <ClientFlowIcon name="shield" size={24} className="text-primary" />
            </IconContainer>
            <h2 className="relative max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {ctaTitle}
            </h2>
            <p className="text-muted-foreground relative max-w-lg text-lg text-pretty">
              {ctaText}
            </p>
            <Button
              asChild
              size="lg"
              className="relative shadow-sm hover:shadow-lg hover:shadow-primary/20"
            >
              <Link href="/free-trial">
                <ClientFlowIcon name="sparkles" size={16} />
                Try for free
                <ClientFlowIcon name="arrow-right" size={16} />
              </Link>
            </Button>
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
