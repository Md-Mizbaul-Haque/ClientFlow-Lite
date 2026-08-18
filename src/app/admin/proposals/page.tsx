"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FilePlus2, FileSignature, PenLine, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRealtime } from "@/components/use-realtime";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface ProposalRow {
  id: string;
  number: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
  sentAt?: string;
  client: { id: string; name: string; company: string } | null;
}

export default function AdminProposalsPage() {
  useRealtime();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const res = await fetch("/api/proposals");
      if (!res.ok) throw new Error("Failed to load proposals");
      return (await res.json()) as ProposalRow[];
    },
  });

  async function handleDelete(id: string) {
    const res = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error || "Could not delete proposal");
      return;
    }
    toast.success("Proposal deleted");
    queryClient.invalidateQueries({ queryKey: ["proposals"] });
  }

  async function handleSend(id: string) {
    const res = await fetch(`/api/proposals/${id}/send`, { method: "POST" });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error || "Could not send proposal");
      return;
    }
    toast.success("Proposal sent — client can now review and sign");
    queryClient.invalidateQueries({ queryKey: ["proposals"] });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground text-sm">Build, send, and track signed proposals.</p>
        </div>
        <Button asChild>
          <Link href="/admin/proposals/new">
            <FilePlus2 className="size-4" />
            New proposal
          </Link>
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proposal</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading &&
              data?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/admin/proposals/${p.id}`} className="hover:underline">
                      <div className="flex flex-col">
                        <span className="font-medium">{p.title}</span>
                        <span className="text-muted-foreground text-xs">{p.number}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{p.client?.name ?? "—"}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(p.price, p.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {p.sentAt ? formatDate(p.sentAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <PenLine className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/proposals/${p.id}`}>View details</Link>
                        </DropdownMenuItem>
                        {p.status === "draft" && (
                          <DropdownMenuItem onClick={() => handleSend(p.id)}>
                            <FileSignature className="size-4" />
                            Send to client
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <FileSignature className="text-muted-foreground mx-auto mb-3 size-8" />
                  <p className="text-muted-foreground text-sm">
                    No proposals yet. Create your first one to get started.
                  </p>
                  <Button asChild size="sm" className="mt-4">
                    <Link href="/admin/proposals/new">
                      <FilePlus2 className="size-4" />
                      New proposal
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}