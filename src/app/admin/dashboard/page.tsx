"use client";
import { ClientFlowIcon, IconContainer, type IconName } from "@/components/icons";
import { useQuery } from "@tanstack/react-query";

import * as React from "react";
import Link from "next/link";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRealtime } from "@/components/use-realtime";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DashboardData {
  stats: {
    activeProjects: number;
    pendingProposals: number;
    monthlyRevenue: number;
    currency: string;
    overdueTasks: number;
    totalClients: number;
  };
  revenueSeries: { label: string; total: number }[];
  projectStatusCounts: { backlog: number; in_progress: number; in_review: number; completed: number };
  overdueTasks: { id: string; title: string; dueDate: string; project: { id: string; name: string } | null }[];
  recentInvoices: { id: string; number: string; amount: number; currency: string; status: string; client: { name: string } | null }[];
}

const PIE_COLORS = ["#a1a1aa", "#7c3aed", "#f59e0b", "#10b981"];

export default function AdminDashboardPage() {
  useRealtime();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to load dashboard");
      }
      return (await res.json()) as DashboardData;
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <Alert variant="warning" className="mx-auto max-w-2xl">
        <AlertTitle>Dashboard unavailable</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            ClientFlow Lite needs a database to show real numbers. Add{" "}
            <code className="font-mono text-xs">MONGODB_URI</code> to <code className="font-mono text-xs">.env</code>,
            then run <code className="font-mono text-xs">npm run seed</code> to create your admin account and demo data.
          </p>
          <pre className="rounded-lg bg-black/5 p-3 text-xs dark:bg-white/5">
            npm run seed
          </pre>
        </AlertDescription>
      </Alert>
    );
  }

  const pieData = [
    { name: "Backlog", value: data.projectStatusCounts.backlog },
    { name: "In Progress", value: data.projectStatusCounts.in_progress },
    { name: "In Review", value: data.projectStatusCounts.in_review },
    { name: "Completed", value: data.projectStatusCounts.completed },
  ].filter((d) => d.value > 0);

  const stats: { label: string; value: string; icon: IconName; hint: string; href: string }[] = [
    {
      label: "Active projects",
      value: String(data.stats.activeProjects),
      icon: "project",
      hint: "In progress or review",
      href: "/admin/projects",
    },
    {
      label: "Pending proposals",
      value: String(data.stats.pendingProposals),
      icon: "proposal",
      hint: "Awaiting signature",
      href: "/admin/proposals",
    },
    {
      label: "Revenue this month",
      value: formatCurrency(data.stats.monthlyRevenue, data.stats.currency),
      icon: "banknote",
      hint: "Paid invoices",
      href: "/admin/invoices",
    },
    {
      label: "Overdue tasks",
      value: String(data.stats.overdueTasks),
      icon: "calendar-clock",
      hint: "Past due date",
      href: "/admin/projects",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Your agency at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/clients">
              <ClientFlowIcon name="crm" size={16} />
              {data.stats.totalClients} clients
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/proposals/new">
              <ClientFlowIcon name="proposal" size={16} />
              New proposal
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <Card className="gap-2 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-sm">{s.label}</p>
                  <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
                  <p className="text-muted-foreground text-xs">{s.hint}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <IconContainer variant="crop" boxSize={36}>
                    <ClientFlowIcon name={s.icon} size={16} className="text-primary" />
                  </IconContainer>
                  <ClientFlowIcon name="arrow-up-right" size={16} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue</CardTitle>
            <CardDescription>Paid invoices over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueSeries} margin={{ top: 5, right: 5, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value) => [formatCurrency(Number(value) || 0), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projects by status</CardTitle>
            <CardDescription>Current board distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex w-full flex-col gap-1.5">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.name}
                  </span>
                  <span className="text-muted-foreground font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overdue tasks</CardTitle>
            <CardDescription>
              {data.stats.overdueTasks === 0
                ? "Nothing overdue Ã¢â‚¬â€ great job"
                : `${data.stats.overdueTasks} task(s) past their due date`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.overdueTasks.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No overdue tasks.
              </p>
            ) : (
              <div className="flex flex-col divide-y">
                {data.overdueTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <ClientFlowIcon name="calendar-clock" size={16} className="text-destructive shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{t.title}</p>
                        {t.project && (
                          <Link
                            href={`/admin/projects/${t.project.id}`}
                            className="text-muted-foreground hover:text-foreground text-xs"
                          >
                            {t.project.name}
                          </Link>
                        )}
                      </div>
                    </div>
                    <span className="text-destructive shrink-0 text-xs font-medium">
                      {formatDate(t.dueDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent invoices</CardTitle>
            <CardDescription>Latest activity across clients</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.number}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.client?.name ?? "Ã¢â‚¬â€"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(inv.amount, inv.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {data.recentInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground h-16 text-center">
                      No invoices yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
