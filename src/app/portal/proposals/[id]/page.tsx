"use client";
import { ClientFlowIcon } from "@/components/icons";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import * as React from "react";

import { toast } from "sonner";
import { useRealtime } from "@/components/use-realtime";
import { SignaturePad } from "@/components/signature-pad";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

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
  client: { name: string; company: string } | null;
  checks: { itemIndex: number; checkedAt: string }[];
}

export default function PortalProposalDetailPage() {
  useRealtime();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const id = params.id;

  const { data, isLoading } = useQuery({
    queryKey: ["proposals", id],
    queryFn: async () => {
      const res = await fetch(`/api/proposals/${id}`);
      if (!res.ok) throw new Error("Failed to load proposal");
      return (await res.json()) as ProposalDetail;
    },
  });

  const [name, setName] = React.useState("");
  const [signature, setSignature] = React.useState("");
  const [signing, setSigning] = React.useState(false);

  async function toggleCheck(itemIndex: number) {
    const res = await fetch(`/api/proposals/${id}/checks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIndex }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error || "Could not update");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["proposals", id] });
    queryClient.invalidateQueries({ queryKey: ["portal"] });
  }

  async function handleSign() {
    if (!name.trim()) {
      toast.error("Enter your full legal name");
      return;
    }
    if (!signature) {
      toast.error("Please draw your signature");
      return;
    }
    setSigning(true);
    try {
      const res = await fetch(`/api/proposals/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), dataUrl: signature }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Could not sign proposal");
      toast.success("Proposal signed — thank you!");
      queryClient.invalidateQueries({ queryKey: ["proposals", id] });
      queryClient.invalidateQueries({ queryKey: ["portal"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign proposal");
    } finally {
      setSigning(false);
    }
  }

  async function handleDecline() {
    const res = await fetch(`/api/proposals/${id}/decline`, { method: "POST" });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error || "Could not decline proposal");
      return;
    }
    toast.success("Proposal declined — we'll be in touch");
    queryClient.invalidateQueries({ queryKey: ["proposals", id] });
    queryClient.invalidateQueries({ queryKey: ["portal"] });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const checkedSet = new Set(data.checks.map((c) => c.itemIndex));
  const signed = Boolean(data.signature) || data.status === "accepted";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{data.title}</h1>
            <StatusBadge status={data.status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {data.number} · prepared for {data.client?.company}
          </p>
        </div>
      </div>

      {data.status === "sent" && (
        <Alert variant="warning">
          <ClientFlowIcon name="signature" />
          <AlertTitle>Awaiting your signature</AlertTitle>
          <AlertDescription>
            Review the proposal below. Once you confirm the deliverables and sign, the agreement
            is official — your agency will be notified instantly.
          </AlertDescription>
        </Alert>
      )}

      {data.status === "accepted" && signed && (
        <Alert variant="success">
          <ClientFlowIcon name="check-circle" />
          <AlertTitle>Proposal signed</AlertTitle>
          <AlertDescription>
            {data.signature?.name ?? "You"} accepted this proposal on{" "}
            {formatDate(data.signature?.signedAt ?? data.sentAt)}. Your agency has been notified.
          </AlertDescription>
        </Alert>
      )}

      {data.status === "declined" && (
        <Alert variant="destructive">
          <ClientFlowIcon name="x-circle" />
          <AlertTitle>Proposal declined</AlertTitle>
          <AlertDescription>
            You declined this proposal. Your agency will follow up with you.
          </AlertDescription>
        </Alert>
      )}

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClientFlowIcon name="check-circle" size={16} className="text-primary" />
            Deliverables
          </CardTitle>
          <CardDescription>
            Confirm each item once your agency delivers it — this keeps everything transparent.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {data.deliverables.map((item, i) => {
            const checked = checkedSet.has(i);
            return (
              <label
                key={i}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  checked
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border/60 bg-muted/30 hover:bg-muted/60"
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleCheck(i)}
                  className="mt-0.5"
                  disabled={data.status === "draft"}
                />
                <div className="min-w-0">
                  <p className={cn(checked ? "font-medium" : "", checked && "text-emerald-700 dark:text-emerald-300")}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-muted-foreground mt-0.5 text-xs">{item.description}</p>
                  )}
                </div>
                {checked && (
                  <ClientFlowIcon name="approval" size={20} className="text-emerald-500 ml-auto shrink-0" />
                )}
              </label>
            );
          })}
        </CardContent>
      </Card>

      {data.terms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClientFlowIcon name="shield" size={16} className="text-primary" />
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClientFlowIcon name="banknote" size={16} className="text-primary" />
            Total investment
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-semibold tracking-tight">
              {formatCurrency(data.price, data.currency)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {data.deliverables.length} deliverables · taxes included
            </p>
          </div>
          {data.status === "accepted" && data.signature && (
            <div className="text-right">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.signature.dataUrl}
                alt={`Signature of ${data.signature.name}`}
                className="border-border bg-background h-16 rounded-lg border object-contain px-2"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {data.signature.name} · {formatDate(data.signature.signedAt)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {data.status === "sent" && !signed && (
        <Card className="border-primary/30 bg-primary/[0.04]">
          <CardHeader>
            <CardTitle className="text-base">Sign to accept</CardTitle>
            <CardDescription>
              By signing, you agree to the scope, deliverables, and terms above.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="legal-name">Full legal name</Label>
              <Input
                id="legal-name"
                placeholder="e.g. Jane A. Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <SignaturePad value={signature} onChange={setSignature} />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleSign} disabled={signing} className="flex-1">
                {signing ? <ClientFlowIcon name="loader" size={16} className="animate-spin" /> : <ClientFlowIcon name="signature" size={16} />}
                Accept &amp; sign proposal
              </Button>
              <Button variant="outline" onClick={handleDecline}>
                <ClientFlowIcon name="thumbs-down" size={16} />
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
