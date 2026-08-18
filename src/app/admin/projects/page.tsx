"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, FolderKanban, LoaderCircle, Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatCurrency } from "@/lib/utils";

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  description: string;
  budget: number;
  currency: string;
  dueDate?: string;
  milestoneCount: number;
  client: { id: string; name: string; company: string } | null;
}

interface ClientOption {
  id: string;
  name: string;
  company: string;
}

export default function AdminProjectsPage() {
  useRealtime();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      return (await res.json()) as ProjectRow[];
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
    name: "",
    description: "",
    clientId: "",
    budget: "",
    dueDate: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          clientId: form.clientId,
          budget: form.budget || 0,
          dueDate: form.dueDate || null,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Could not create project");
      toast.success("Project created");
      setOpen(false);
      setForm({ name: "", description: "", clientId: "", budget: "", dueDate: "" });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Open a project to manage its milestone board.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}

        {!isLoading &&
          data?.map((p) => (
            <Link key={p.id} href={`/admin/projects/${p.id}`}>
              <Card className="gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardBody project={p} />
              </Card>
            </Link>
          ))}

        {!isLoading && data?.length === 0 && (
          <Card className="col-span-full py-12 text-center">
            <FolderKanban className="text-muted-foreground mx-auto mb-3 size-8" />
            <p className="text-muted-foreground text-sm">
              No projects yet. Create one to start tracking milestones.
            </p>
            <Button size="sm" className="mt-4" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              New project
            </Button>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>Kick off a project for an existing client.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-name">Project name</Label>
              <Input
                id="p-name"
                placeholder="e.g. Website Redesign"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                rows={2}
                placeholder="What's this project about?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="p-budget">Budget</Label>
                <Input
                  id="p-budget"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="p-due">Due date</Label>
                <Input
                  id="p-due"
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
                Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CardBody({ project }: { project: ProjectRow }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{project.name}</p>
          <p className="text-muted-foreground text-xs">{project.client?.name ?? "—"}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      {project.description && (
        <p className="text-muted-foreground line-clamp-2 text-sm">{project.description}</p>
      )}
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          {project.dueDate ? formatDate(project.dueDate) : "No due date"}
        </span>
        <span>{project.milestoneCount} milestones</span>
        {project.budget > 0 && (
          <span className="font-medium">{formatCurrency(project.budget, project.currency)}</span>
        )}
      </div>
    </div>
  );
}