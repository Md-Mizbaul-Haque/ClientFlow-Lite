"use client";
import { ClientFlowIcon, IconContainer, type IconName } from "@/components/icons";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import * as React from "react";

import { toast } from "sonner";
import { useRealtime } from "@/components/use-realtime";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate, formatRelative } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
}

interface Deliverable {
  id: string;
  fileName: string;
  size: number;
  mime: string;
  uploadedByName: string;
  createdAt: string;
  downloadUrl: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  status: string;
  dueDate?: string;
  milestones: Milestone[];
  deliverables: Deliverable[];
}

function fileIcon(mime: string): IconName {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf" || mime.includes("word") || mime.includes("text")) return "proposal";
  if (mime.includes("zip") || mime.includes("octet")) return "file-archive";
  return "paperclip";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PortalProjectDetailPage() {
  useRealtime();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const id = params.id;

  const { data, isLoading } = useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Failed to load project");
      return (await res.json()) as ProjectDetail;
    },
  });

  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/projects/${id}/deliverables`, {
        method: "POST",
        body: form,
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Upload failed");
      toast.success(`Uploaded ${file.name}`);
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(deliverableId: string) {
    const res = await fetch(`/api/deliverables/${deliverableId}`, { method: "DELETE" });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error || "Could not delete file");
      return;
    }
    toast.success("File deleted");
    queryClient.invalidateQueries({ queryKey: ["projects", id] });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const done = data.milestones.filter((m) => m.status === "completed").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
          <StatusBadge status={data.status} />
        </div>
        <p className="text-muted-foreground text-sm">
          {data.description || "No description"}
          {data.dueDate && <span className="ml-2">· Due {formatDate(data.dueDate)}</span>}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
            <CardDescription>
              {done}/{data.milestones.length} milestones complete
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.milestones.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Your agency hasn&apos;t added milestones yet.
              </p>
            )}
            <ol className="relative flex flex-col gap-0 border-l border-border pl-6">
              {data.milestones.map((m, i) => {
                const completed = m.status === "completed";
                const active = m.status === "in_progress";
                return (
                  <li key={m.id} className={cn("relative pb-6 last:pb-0", i === 0 && "pt-0")}>
                    <span
                      className={cn(
                        "absolute -left-[31px] flex size-5 items-center justify-center rounded-full border-2 bg-background",
                        completed
                          ? "border-emerald-500 bg-emerald-500/10"
                          : active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-muted"
                      )}
                    >
                      {completed ? (
                        <ClientFlowIcon name="check-circle" size={12} className="text-emerald-500" />
                      ) : active ? (
                        <span className="bg-primary size-2 rounded-full" />
                      ) : (
                        <ClientFlowIcon name="circle" className="text-muted-foreground/50 size-2.5" />
                      )}
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className={cn("font-medium", !completed && "text-muted-foreground")}>
                          {m.title}
                        </p>
                        <StatusBadge status={m.status} label={m.status.replace("_", " ")} />
                      </div>
                      {m.description && (
                        <p className="text-muted-foreground text-sm">{m.description}</p>
                      )}
                      {m.dueDate && (
                        <p className="text-muted-foreground text-xs">
                          Due {formatDate(m.dueDate)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assets</CardTitle>
            <CardDescription>Files shared with you and files you upload.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <label
              className={cn(
                "border-border/70 hover:bg-accent/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors",
                uploading && "pointer-events-none opacity-60"
              )}
            >
              {uploading ? (
                <ClientFlowIcon name="loader" size={24} className="text-primary animate-spin" />
              ) : (
                <ClientFlowIcon name="upload-cloud" size={24} className="text-muted-foreground" />
              )}
              <span className="text-sm font-medium">
                {uploading ? "Uploading…" : "Click to upload a deliverable"}
              </span>
              <span className="text-muted-foreground text-xs">
                PDF, images, docs, zip — up to 25MB
              </span>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>

            <div className="flex flex-col divide-y">
              {data.deliverables.length === 0 && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  No files yet. Your agency will share deliverables here.
                </p>
              )}
              {data.deliverables.map((d) => {
                const Icon = fileIcon(d.mime);
                return (
                  <div
                    key={d.id}
                    className="group flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <IconContainer variant="cut" boxSize={36}>
                        <ClientFlowIcon name={Icon} size={16} className="text-primary" />
                      </IconContainer>
                      <div className="min-w-0">
                        <a
                          href={d.downloadUrl}
                          className="hover:text-primary flex items-center gap-1 truncate text-sm font-medium"
                          title={d.fileName}
                        >
                          {d.fileName}
                        </a>
                        <p className="text-muted-foreground text-xs">
                          {formatSize(d.size)} · by {d.uploadedByName} ·{" "}
                          {formatRelative(d.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={d.downloadUrl} download>
                          <ClientFlowIcon name="download" size={16} />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleDelete(d.id)}
                      >
                        <ClientFlowIcon name="trash" size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
