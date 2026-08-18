"use client";
import { ClientFlowIcon } from "@/components/icons";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import * as React from "react";
import Link from "next/link";

import { toast } from "sonner";
import { useRealtime } from "@/components/use-realtime";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ProposalDetail {
  id: string;
  number: string;
  title: string;
  description: string;
  scopeOfWork: { title: string; description?: string }[];
  deliverables: { title: string; description?: string }[];
  terms: { title: string; description?: string }[];
  price: number;
  currency: string;
  status: string;
  sentAt?: string;
  signature?: { name: string; dataUrl: string; signedAt: string };
  client: { name: string; company: string; email: string } | null;
  checks: { itemIndex: number; checkedAt: string }[];
}

export default function AdminProposalDetailPage() {
  useRealtime();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["proposals", id],
    queryFn: async () => {
      const res = await fetch(`/api/proposals/${id}`);
      if (!res.ok) throw new Error("Failed to load proposal");
      return (await res.json()) as ProposalDetail;
    },
  });

  async function handleSend() {
    const res = await fetch(`/api/proposals/${id}/send`, { method: "POST" });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error || "Could not send proposal");
      return;
    }
    toast.success("Proposal sent to client");
    refetch();
  }

  async function handleDelete() {
    const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error || "Could not delete proposal");
      return;
    }
    toast.success("Proposal deleted");
    router.push("/admin/proposals");
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const checkedSet = new Set(data.checks.map((c) => c.itemIndex));
  const checkedCount = data.checks.length;
  const totalDeliverables = data.deliverables.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/proposals">
              <ClientFlowIcon name="arrow-left" size={16} />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{data.title}</h1>
              <StatusBadge status={data.status} />
            </div>
            <p className="text-muted-foreground text-sm">
              {data.number} · for {data.client?.name} ({data.client?.company})
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {data.status === "draft" && (
            <>
              <Button variant="outline" onClick={handleDelete}>
                <ClientFlowIcon name="trash" size={16} />
                Delete
              </Button>
              <Button onClick={handleSend}>
                <ClientFlowIcon name="send" size={16} />
                Send to client
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {data.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{data.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClientFlowIcon name="target" size={16} className="text-primary" />
                Scope of work
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y">
              {data.scopeOfWork.map((item, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  <p className="font-medium">{item.title}</p>
                  {item.description && (
                    <p className="text-muted-foreground mt-0.5 text-sm">{item.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClientFlowIcon name="check-circle" size={16} className="text-primary" />
                Deliverables
              </CardTitle>
              <span className="text-muted-foreground text-xs font-medium">
                {checkedCount}/{totalDeliverables} confirmed
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {data.deliverables.map((item, i) => {
                const done = checkedSet.has(i);
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      done
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border/60 bg-muted/30"
                    }`}
                  >
                    <ClientFlowIcon name="approval" className={done ? "text-emerald-500 size-5 shrink-0" : "text-muted-foreground/30 size-5 shrink-0"} />
                    <div className="min-w-0">
                      <p className={done ? "font-medium" : "text-muted-foreground"}>{item.title}</p>
                      {item.description && (
                        <p className="text-muted-foreground mt-0.5 text-xs">{item.description}</p>
                      )}
                      {done && (
                        <p className="text-emerald-600 dark:text-emerald-400 mt-1 text-xs">
                          Confirmed by client
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {data.terms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClientFlowIcon name="task" size={16} className="text-primary" />
                  Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col divide-y">
                {data.terms.map((item, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <p className="font-medium">{item.title}</p>
                    {item.description && (
                      <p className="text-muted-foreground mt-0.5 text-sm">{item.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClientFlowIcon name="banknote" size={16} className="text-primary" />
                Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">
                {formatCurrency(data.price, data.currency)}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {data.deliverables.length} deliverables
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClientFlowIcon name="signature" size={16} className="text-primary" />
                Signature
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.signature ? (
                <div className="flex flex-col gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.signature.dataUrl}
                    alt={`Signature of ${data.signature.name}`}
                    className="border-border bg-background h-24 w-full rounded-lg border object-contain"
                  />
                  <div>
                    <p className="font-medium">{data.signature.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Signed {formatDate(data.signature.signedAt)}
                    </p>
                  </div>
                </div>
              ) : data.status === "accepted" ? (
                <p className="text-muted-foreground text-sm">Accepted without signature on file.</p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {data.status === "sent"
                    ? "Waiting for your client to review and sign."
                    : "Send this proposal to collect a signature."}
                </p>
              )}
            </CardContent>
          </Card>

          {data.status === "sent" && (
            <Card className="border-primary/30 bg-primary/[0.04]">
              <CardContent className="flex flex-col gap-3 py-4">
                <div className="flex items-center gap-2">
                  <ClientFlowIcon name="send" size={16} className="text-primary" />
                  <p className="font-medium text-sm">Awaiting client action</p>
                </div>
                <p className="text-muted-foreground text-sm">
                  Your client has a secure link to review, check deliverables, and sign. Changes
                  sync here in real time.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
