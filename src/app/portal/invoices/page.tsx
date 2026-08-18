"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, ExternalLink, LoaderCircle, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useRealtime } from "@/components/use-realtime";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceRow {
  id: string;
  number: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  dueDate?: string;
}

export default function PortalInvoicesPage() {
  useRealtime();
  const searchParams = useSearchParams();
  const paid = searchParams.get("paid");
  const cancelled = searchParams.get("cancelled");

  const { data, isLoading } = useQuery({
    queryKey: ["portal"],
    queryFn: async () => {
      const res = await fetch("/api/portal");
      if (!res.ok) throw new Error("Failed to load invoices");
      const body = (await res.json()) as { invoices: InvoiceRow[] };
      return body.invoices;
    },
  });

  const [paying, setPaying] = React.useState<string | null>(null);

  async function handlePay(invoiceId: string) {
    setPaying(invoiceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Could not start checkout");
      if (body.url) {
        window.open(body.url, "_self");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout");
      setPaying(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground text-sm">
          Pay deposits and final invoices securely with Stripe.
        </p>
      </div>

      {paid && (
        <Alert variant="success">
          <CreditCard />
          <AlertTitle>Payment successful</AlertTitle>
          <AlertDescription>
            Thanks — your payment went through. Your agency has been notified.
          </AlertDescription>
        </Alert>
      )}
      {cancelled && (
        <Alert variant="warning">
          <CreditCard />
          <AlertTitle>Payment cancelled</AlertTitle>
          <AlertDescription>No charges were made. You can try again any time.</AlertDescription>
        </Alert>
      )}

      {data && data.length > 0 && (
        <Alert>
          <CreditCard />
          <AlertTitle>Test mode</AlertTitle>
          <AlertDescription>
            <p>
              Stripe is in sandbox mode. Use test card{" "}
              <code className="font-mono">4242 4242 4242 4242</code> with any future expiry and
              CVC.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}

        {!isLoading &&
          data?.map((inv) => (
            <Card key={inv.id} className="gap-0 p-0">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Receipt className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">
                      {inv.number}
                      <span className="text-muted-foreground ml-2 text-xs capitalize">
                        · {inv.type} payment
                      </span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {inv.dueDate ? `Due ${formatDate(inv.dueDate)}` : "No due date"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-2">
                  <p className="text-lg font-semibold">
                    {formatCurrency(inv.amount, inv.currency)}
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inv.status} />
                    {(inv.status === "sent" || inv.status === "overdue") && (
                      <Button size="sm" onClick={() => handlePay(inv.id)} disabled={paying === inv.id}>
                        {paying === inv.id ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <ExternalLink className="size-4" />
                        )}
                        Pay with Stripe
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

        {!isLoading && data?.length === 0 && (
          <Card className="py-12 text-center">
            <Receipt className="text-muted-foreground mx-auto mb-3 size-8" />
            <p className="text-muted-foreground text-sm">No invoices for you yet.</p>
            <Button asChild variant="link" className="mt-1">
              <Link href="/portal">Back to overview</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}