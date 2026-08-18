"use client";
import { ClientFlowIcon, IconContainer } from "@/components/icons";
import { useQuery } from "@tanstack/react-query";

import * as React from "react";
import Link from "next/link";

import { useRealtime } from "@/components/use-realtime";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface PortalData {
  proposals: {
    id: string;
    number: string;
    title: string;
    price: number;
    currency: string;
    status: string;
    checkedCount: number;
    deliverableCount: number;
  }[];
  projects: {
    id: string;
    name: string;
    description: string;
    status: string;
    dueDate?: string;
    progress: { total: number; done: number };
  }[];
  invoices: {
    id: string;
    number: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    dueDate?: string;
  }[];
  highlights: {
    needsSignature: { id: string; number: string; title: string } | null;
    activeProject: { id: string; name: string; status: string } | null;
    unpaidInvoice: { id: string; number: string } | null;
    overdueInvoiceCount: number;
  };
}

export default function PortalOverviewPage() {
  useRealtime();

  const { data, isLoading } = useQuery({
    queryKey: ["portal"],
    queryFn: async () => {
      const res = await fetch("/api/portal");
      if (!res.ok) throw new Error("Failed to load portal");
      return (await res.json()) as PortalData;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40 lg:col-span-2" />
          <Skeleton className="h-40" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const needsSignature = data.highlights.needsSignature;
  const activeProject = data.highlights.activeProject;
  const unpaidInvoice = data.highlights.unpaidInvoice;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your workspace</h1>
          <p className="text-muted-foreground text-sm">
            Proposals, projects, and invoices â€” all in one place.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {needsSignature && (
          <Card className="border-primary/30 bg-primary/[0.04] lg:col-span-2">
            <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <IconContainer variant="cut" boxSize={40}>
                  <ClientFlowIcon name="signature" size={20} className="text-primary" />
                </IconContainer>
                <div>
                  <p className="font-semibold">Your signature is needed</p>
                  <p className="text-muted-foreground text-sm">
                    {needsSignature.title} ({needsSignature.number}) is ready for you to review
                    and sign.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link href={`/portal/proposals/${needsSignature.id}`}>
                  Review &amp; sign
                  <ClientFlowIcon name="arrow-right" size={16} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!needsSignature && (
          <Card className="bg-card lg:col-span-2">
            <CardContent className="flex flex-col gap-3 py-5">
              <div className="flex items-center gap-2">
                <ClientFlowIcon name="sparkles" size={16} className="text-primary" />
                <p className="font-semibold">All caught up</p>
              </div>
              <p className="text-muted-foreground text-sm">
                Nothing needs your attention right now. New proposals, invoices, and project
                updates will show up here.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="flex flex-col gap-3 py-5">
            <p className="text-muted-foreground text-sm">Outstanding balance</p>
            <p className="text-3xl font-semibold tracking-tight">
              {formatCurrency(
                data.invoices
                  .filter((i) => i.status !== "paid" && i.status !== "draft")
                  .reduce((s, i) => s + i.amount, 0),
                "USD"
              )}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {data.invoices.filter((i) => i.status !== "paid").length} open invoice(s)
              </span>
              {data.highlights.overdueInvoiceCount > 0 && (
                <span className="text-destructive font-medium">
                  {data.highlights.overdueInvoiceCount} overdue
                </span>
              )}
            </div>
            {unpaidInvoice && (
              <Button asChild variant="outline" size="sm" className="mt-1">
                <Link href="/portal/invoices">
                  <ClientFlowIcon name="wallet" size={16} />
                  Pay now
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Active project</CardTitle>
              <CardDescription>Current milestone progress</CardDescription>
            </div>
            <ClientFlowIcon name="project" size={20} className="text-primary" />
          </CardHeader>
          <CardContent>
            {activeProject ? (
              (() => {
                const project = data.projects.find((p) => p.id === activeProject.id);
                const progress = project
                  ? Math.round(
                      project.progress.total === 0
                        ? 0
                        : (project.progress.done / project.progress.total) * 100
                    )
                  : 0;
                return (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{activeProject.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {project?.description || "No description yet"}
                        </p>
                      </div>
                      <StatusBadge status={activeProject.status} />
                    </div>
                    <Progress value={progress} />
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>
                        {project?.progress.done ?? 0}/{project?.progress.total ?? 0} milestones
                        complete
                      </span>
                      <Link
                        href={`/portal/projects/${activeProject.id}`}
                        className="text-primary hover:underline"
                      >
                        View timeline â†’
                      </Link>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No active projects right now.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent proposals</CardTitle>
              <CardDescription>Latest updates from your agency</CardDescription>
            </div>
            <ClientFlowIcon name="invoice" size={20} className="text-primary" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.proposals.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/portal/proposals/${p.id}`}
                className="hover:bg-accent flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {p.number} Â· {formatCurrency(p.price, p.currency)}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
            {data.proposals.length === 0 && (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No proposals yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
