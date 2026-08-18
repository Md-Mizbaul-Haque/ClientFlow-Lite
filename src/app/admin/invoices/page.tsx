"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CreditCard, LoaderCircle, Plus, Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRealtime } from "@/components/use-realtime";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CURRENCIES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceRow {
  id: string;
  number: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  dueDate?: string;
  client: { id: string; name: string; company: string } | null;
}

interface ClientOption {
  id: string;
  name: string;
  company: string;
}

export default function AdminInvoicesPage() {
  useRealtime();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error("Failed to load invoices");
      return (await res.json()) as InvoiceRow[];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) return [] as ClientOption[];
      return (await res.json()) as ClientOption[];
    },
  });

  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    clientId: "",
    amount: "",
    currency: "USD",
    type: "deposit",
    dueDate: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: form.clientId,
          amount: form.amount,
          currency: form.currency,
          type: form.type,
          dueDate: form.dueDate || null,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Could not create invoice");
      toast.success("Invoice created");
      setOpen(false);
      setForm({ clientId: "", amount: "", currency: "USD", type: "deposit", dueDate: "" });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create invoice");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(inv: InvoiceRow) {
    const res = await fetch(`/api/invoices/${inv.id}`, { method: "DELETE" });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error || "Could not delete invoice");
      return;
    }
    toast.success("Invoice deleted");
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  }

  const unpaid = data?.filter((i) => i.status !== "paid" && i.status !== "draft") ?? [];
  const collected =
    data?.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm">
            Clients pay directly from their portal via Stripe.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New invoice
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardStat
            icon={Receipt}
            label="Outstanding"
            value={formatCurrency(
              unpaid.reduce((sum, i) => sum + i.amount, 0),
              "USD"
            )}
            hint={`${unpaid.length} unpaid invoice(s)`}
          />
        </Card>
        <Card>
          <CardStat
            icon={Banknote}
            label="Collected"
            value={formatCurrency(collected, "USD")}
            hint="All-time paid invoices"
          />
        </Card>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading &&
              data?.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.number}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {inv.client?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">{inv.type}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(inv.amount, inv.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {inv.dueDate ? formatDate(inv.dueDate) : "—"}
                  </TableCell>
                  <TableCell>
                    {inv.status !== "paid" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(inv)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <CreditCard className="text-muted-foreground mx-auto mb-3 size-8" />
                  <p className="text-muted-foreground text-sm">
                    No invoices yet. Create one to accept payments.
                  </p>
                  <Button size="sm" className="mt-4" onClick={() => setOpen(true)}>
                    <Plus className="size-4" />
                    New invoice
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New invoice</DialogTitle>
            <DialogDescription>
              Clients can pay instantly from their portal once the invoice is created.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Client</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm({ ...form, clientId: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} · {c.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="i-amount">Amount</Label>
                <Input
                  id="i-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm({ ...form, currency: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="i-due">Due date</Label>
                <Input
                  id="i-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <LoaderCircle className="size-4 animate-spin" />}
                Create invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CardStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </div>
      <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
        <Icon className="size-5" />
      </span>
    </div>
  );
}