"use client";
import { ClientFlowIcon, IconContainer } from "@/components/icons";
import { useQuery } from "@tanstack/react-query";

import * as React from "react";
import Link from "next/link";

import { useRealtime } from "@/components/use-realtime";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ProposalRow {
  id: string;
  number: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
  checkedCount: number;
  deliverableCount: number;
}

export default function PortalProposalsPage() {
  useRealtime();

  const { data, isLoading } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const res = await fetch("/api/portal");
      if (!res.ok) throw new Error("Failed to load proposals");
      const body = (await res.json()) as { proposals: ProposalRow[] };
      return body.proposals;
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
        <p className="text-muted-foreground text-sm">
          Review proposals, confirm deliverables, and sign online.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}

        {!isLoading &&
          data?.map((p) => (
            <Link key={p.id} href={`/portal/proposals/${p.id}`}>
              <Card className="gap-0 p-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <IconContainer variant="cut" boxSize={40}>
                      <ClientFlowIcon name="proposal" size={20} className="text-primary" />
                    </IconContainer>
                    <div>
                      <p className="font-semibold">{p.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {p.number} Â· sent {formatDate(p.createdAt)}
                      </p>
                      {p.status === "sent" && (
                        <p className="text-primary mt-1 text-xs font-medium">
                          Awaiting your signature â€” review &amp; sign â†’
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-2">
                    <p className="text-lg font-semibold">
                      {formatCurrency(p.price, p.currency)}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}

        {!isLoading && data?.length === 0 && (
          <Card className="py-12 text-center">
            <ClientFlowIcon name="proposal" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No proposals have been shared with you yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
