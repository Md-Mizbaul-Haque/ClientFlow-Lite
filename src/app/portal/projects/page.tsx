"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban } from "lucide-react";
import { useRealtime } from "@/components/use-realtime";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";

interface ProjectRow {
  id: string;
  name: string;
  description: string;
  status: string;
  dueDate?: string;
  progress: { total: number; done: number };
}

export default function PortalProjectsPage() {
  useRealtime();

  const { data, isLoading } = useQuery({
    queryKey: ["portal"],
    queryFn: async () => {
      const res = await fetch("/api/portal");
      if (!res.ok) throw new Error("Failed to load projects");
      const body = (await res.json()) as { projects: ProjectRow[] };
      return body.projects;
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-muted-foreground text-sm">
          Follow your project timeline and upload assets.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}

        {!isLoading &&
          data?.map((p) => {
            const progress = Math.round(
              p.progress.total === 0 ? 0 : (p.progress.done / p.progress.total) * 100
            );
            return (
              <Link key={p.id} href={`/portal/projects/${p.id}`}>
                <Card className="gap-0 p-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                        <FolderKanban className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold">{p.name}</p>
                        {p.description && (
                          <p className="text-muted-foreground line-clamp-1 text-sm">
                            {p.description}
                          </p>
                        )}
                        <p className="text-muted-foreground mt-1 text-xs">
                          {p.dueDate ? `Due ${formatDate(p.dueDate)}` : "No due date"}
                        </p>
                      </div>
                    </div>
                    <div className="flex min-w-40 flex-col gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <StatusBadge status={p.status} />
                        <span className="text-muted-foreground text-xs font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}

        {!isLoading && data?.length === 0 && (
          <Card className="py-12 text-center">
            <FolderKanban className="text-muted-foreground mx-auto mb-3 size-8" />
            <p className="text-muted-foreground text-sm">No projects assigned to you yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}