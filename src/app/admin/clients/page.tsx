"use client";
import { ClientFlowIcon } from "@/components/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import * as React from "react";

import { toast } from "sonner";
import { useRealtime } from "@/components/use-realtime";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { initials } from "@/lib/utils";

interface ClientRow {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  hasAccount: boolean;
  proposalCount: number;
  projectCount: number;
  invoiceCount: number;
}

interface ClientForm {
  name: string;
  company: string;
  email: string;
  phone: string;
}

const EMPTY_FORM: ClientForm = { name: "", company: "", email: "", phone: "" };

export default function AdminClientsPage() {
  useRealtime();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to load clients");
      return (await res.json()) as ClientRow[];
    },
  });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ClientRow | null>(null);
  const [form, setForm] = React.useState<ClientForm>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [inviting, setInviting] = React.useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(client: ClientRow) {
    setEditing(client);
    setForm({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/clients/${editing.id}` : "/api/clients", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Could not save client");
      toast.success(editing ? "Client updated" : "Client created");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save client");
    } finally {
      setSaving(false);
    }
  }

  async function handleInvite(client: ClientRow) {
    setInviting(client.id);
    try {
      const res = await fetch(`/api/clients/${client.id}/invite`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Could not send invite");
      toast.success(`Invite sent to ${client.email}`);
      if (body.devUrl) {
        toast.info(`Dev mode — sign-in link: ${body.devUrl}`, { duration: 20000 });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send invite");
    } finally {
      setInviting(null);
    }
  }

  async function handleDelete(client: ClientRow) {
    const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error || "Could not delete client");
      return;
    }
    toast.success("Client deleted");
    queryClient.invalidateQueries({ queryKey: ["clients"] });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm">
            Manage client profiles and send portal invites.
          </p>
        </div>
        <Button onClick={openCreate}>
          <ClientFlowIcon name="user-plus" size={16} />
          Add client
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Portal access</TableHead>
              <TableHead>Proposals</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-28" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading &&
              data?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {initials(c.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {c.company} · {c.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.hasAccount ? (
                      <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 font-medium text-emerald-600 dark:text-emerald-400">
                        Linked
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInvite(c)}
                        disabled={inviting === c.id}
                      >
                        {inviting === c.id ? (
                          <ClientFlowIcon name="loader" size={14} className="animate-spin" />
                        ) : (
                          <ClientFlowIcon name="mail-plus" size={14} />
                        )}
                        Invite
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.proposalCount}</TableCell>
                  <TableCell className="text-muted-foreground">{c.projectCount}</TableCell>
                  <TableCell className="text-muted-foreground">{c.invoiceCount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ClientFlowIcon name="more" size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(c)}>
                          <ClientFlowIcon name="edit" size={16} />
                          Edit
                        </DropdownMenuItem>
                        {!c.hasAccount && (
                          <DropdownMenuItem onClick={() => handleInvite(c)}>
                            <ClientFlowIcon name="mail" size={16} />
                            Send invite
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(c)}
                        >
                          <ClientFlowIcon name="trash" size={16} />
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
                  <ClientFlowIcon name="crm" size={32} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No clients yet. Add your first client to start sending proposals.
                  </p>
                  <Button size="sm" className="mt-4" onClick={openCreate}>
                    <ClientFlowIcon name="plus" size={16} />
                    Add client
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit client" : "Add client"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the client's profile details."
                : "Create a profile; you can invite them to the portal afterwards."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@acme.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                placeholder="+1 555 000 1234"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <ClientFlowIcon name="loader" size={16} className="animate-spin" />}
                {editing ? "Save changes" : "Create client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
