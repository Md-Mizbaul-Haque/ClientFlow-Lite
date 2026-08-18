"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  FilePlus2,
  GripVertical,
  ListChecks,
  LoaderCircle,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { CURRENCIES } from "@/lib/constants";

interface Item {
  title: string;
  description: string;
}

interface ClientOption {
  id: string;
  name: string;
  company: string;
}

export default function NewProposalPage() {
  const router = useRouter();

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Failed to load clients");
      return (await res.json()) as ClientOption[];
    },
  });

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [scope, setScope] = React.useState<Item[]>([{ title: "", description: "" }]);
  const [deliverables, setDeliverables] = React.useState<Item[]>([
    { title: "", description: "" },
  ]);
  const [terms, setTerms] = React.useState<Item[]>([]);
  const [saving, setSaving] = React.useState(false);

  function updateItem(
    list: Item[],
    setList: React.Dispatch<React.SetStateAction<Item[]>>,
    index: number,
    field: keyof Item,
    value: string
  ) {
    setList(list.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function removeItem(
    list: Item[],
    setList: React.Dispatch<React.SetStateAction<Item[]>>,
    index: number
  ) {
    setList(list.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const cleaned = {
        title,
        description,
        clientId,
        price,
        currency,
        scopeOfWork: scope.filter((s) => s.title.trim()),
        deliverables: deliverables.filter((d) => d.title.trim()),
        terms: terms.filter((t) => t.title.trim()),
      };

      if (!cleaned.title.trim()) throw new Error("Give the proposal a title");
      if (!cleaned.clientId) throw new Error("Select a client");
      if (cleaned.scopeOfWork.length === 0) throw new Error("Add at least one scope item");
      if (cleaned.deliverables.length === 0) throw new Error("Add at least one deliverable");
      if (!cleaned.price) throw new Error("Set a price");

      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create proposal");

      toast.success("Proposal created");
      router.push(`/admin/proposals/${data.proposal.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create proposal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/proposals">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New proposal</h1>
            <p className="text-muted-foreground text-sm">Assemble everything your client needs to say yes.</p>
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save proposal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
          <CardDescription>How this proposal is presented to the client.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Proposal title</Label>
            <Input
              id="title"
              placeholder="e.g. Website Redesign & Development"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="client" className="w-full">
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
            {clients && clients.length === 0 && (
              <p className="text-muted-foreground text-xs">
                No clients yet —{" "}
                <Link href="/admin/clients" className="text-primary hover:underline">
                  create one first
                </Link>
                .
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Executive summary</Label>
            <Textarea
              id="description"
              placeholder="A short paragraph that frames the project and the outcome."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Scope of work</CardTitle>
            <CardDescription>Break the work into phases or focus areas.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setScope([...scope, { title: "", description: "" }])}
          >
            <Plus className="size-4" />
            Add item
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {scope.map((item, i) => (
            <div key={i} className="border-border/60 bg-muted/30 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <GripVertical className="text-muted-foreground size-4 shrink-0" />
                <Input
                  placeholder={`Scope item ${i + 1} — e.g. Discovery & research`}
                  value={item.title}
                  onChange={(e) => updateItem(scope, setScope, i, "title", e.target.value)}
                />
                {scope.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(scope, setScope, i)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Optional description"
                className="mt-2 border-transparent bg-transparent pl-6 shadow-none"
                value={item.description}
                onChange={(e) => updateItem(scope, setScope, i, "description", e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Deliverables</CardTitle>
            <CardDescription>What the client receives — they&apos;ll check these off after signing.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDeliverables([...deliverables, { title: "", description: "" }])}
          >
            <Plus className="size-4" />
            Add deliverable
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {deliverables.map((item, i) => (
            <div key={i} className="border-border/60 bg-muted/30 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary size-4 shrink-0" />
                <Input
                  placeholder={`Deliverable ${i + 1} — e.g. 12 page templates`}
                  value={item.title}
                  onChange={(e) => updateItem(deliverables, setDeliverables, i, "title", e.target.value)}
                />
                {deliverables.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(deliverables, setDeliverables, i)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Optional description"
                className="mt-2 border-transparent bg-transparent pl-6 shadow-none"
                value={item.description}
                onChange={(e) => updateItem(deliverables, setDeliverables, i, "description", e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Investment</CardTitle>
          <CardDescription>The total project price.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-40 flex-1">
            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
              {currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency}
            </span>
            <Input
              type="number"
              min="0"
              step="0.01"
              className="pl-10"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-28">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4" />
              Terms
            </CardTitle>
            <CardDescription>Dynamic terms the client agrees to when signing.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTerms([...terms, { title: "", description: "" }])}
          >
            <Plus className="size-4" />
            Add term
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {terms.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No terms yet — add payment schedules, timelines, or legal clauses.
            </p>
          )}
          {terms.map((item, i) => (
            <div key={i} className="border-border/60 bg-muted/30 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <ListChecks className="text-muted-foreground size-4 shrink-0" />
                <Input
                  placeholder={`Term ${i + 1} — e.g. Payment schedule`}
                  value={item.title}
                  onChange={(e) => updateItem(terms, setTerms, i, "title", e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(terms, setTerms, i)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Textarea
                placeholder="Optional details"
                className="mt-2 border-transparent bg-transparent pl-6 shadow-none"
                rows={2}
                value={item.description}
                onChange={(e) => updateItem(terms, setTerms, i, "description", e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-end gap-3 pb-8">
        <Button asChild variant="ghost">
          <Link href="/admin/proposals">Cancel</Link>
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : <FilePlus2 className="size-4" />}
          Create proposal
        </Button>
      </div>
    </form>
  );
}