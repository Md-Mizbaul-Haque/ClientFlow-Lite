"use client";
import { ClientFlowIcon } from "@/components/icons";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import * as React from "react";
import Link from "next/link";

import { toast } from "sonner";
import { useRealtime } from "@/components/use-realtime";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, cn } from "@/lib/utils";
import { MILESTONE_STATUSES } from "@/lib/constants";

const COLUMNS = MILESTONE_STATUSES.map((s) => s.value);

interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  order: number;
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  status: string;
  dueDate?: string;
  client: { name: string; company: string } | null;
  milestones: Milestone[];
  tasks: { id: string; title: string; dueDate?: string; completed: boolean }[];
}

const COLUMN_STYLES: Record<string, string> = {
  pending: "border-border/60",
  in_progress: "border-violet-500/30",
  in_review: "border-amber-500/30",
  completed: "border-emerald-500/30",
};

export default function AdminProjectBoardPage() {
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

  const [newMilestone, setNewMilestone] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [newTask, setNewTask] = React.useState("");
  const [dragId, setDragId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  async function addMilestone() {
    if (!newMilestone.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newMilestone.trim() }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Could not add milestone");
      setNewMilestone("");
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add milestone");
    } finally {
      setAdding(false);
    }
  }

  async function addTask() {
    if (!newTask.trim()) return;
    const res = await fetch(`/api/projects/${id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask.trim() }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error || "Could not add task");
      return;
    }
    setNewTask("");
    queryClient.invalidateQueries({ queryKey: ["projects", id] });
  }

  async function handleDragEnd(event: DragEndEvent) {
    setDragId(null);
    const { active, over } = event;
    if (!over) return;

    const milestone = data?.milestones.find((m) => m.id === active.id);
    if (!milestone) return;

    const overId = String(over.id);
    let nextStatus = milestone.status;

    if (over.data.current?.type === "column") {
      nextStatus = overId;
    } else {
      const overMilestone = data?.milestones.find((m) => m.id === overId);
      if (overMilestone) nextStatus = overMilestone.status;
    }

    if (nextStatus === milestone.status && String(active.id) !== overId) {
      const columnItems = data?.milestones
        .filter((m) => m.status === nextStatus)
        .map((m) => m.id) ?? [];
      const oldIndex = columnItems.indexOf(String(active.id));
      const newIndex = columnItems.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(columnItems, oldIndex, newIndex);
        queryClient.setQueryData<ProjectDetail>(["projects", id], (prev) =>
          prev
            ? {
                ...prev,
                milestones: prev.milestones.map(
                  (m) =>
                    ({
                      ...m,
                      order: reordered.indexOf(m.id),
                    }) as Milestone
                ),
              }
            : prev
        );
        await fetch(`/api/milestones/${active.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newIndex }),
        });
      }
      return;
    }

    if (nextStatus !== milestone.status) {
      queryClient.setQueryData<ProjectDetail>(["projects", id], (prev) =>
        prev
          ? {
              ...prev,
              milestones: prev.milestones.map((m) =>
                m.id === String(active.id) ? { ...m, status: nextStatus } : m
              ),
            }
          : prev
      );
      const res = await fetch(`/api/milestones/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        queryClient.invalidateQueries({ queryKey: ["projects", id] });
      }
    }
  }

  async function toggleTask(taskId: string, completed: boolean) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    queryClient.invalidateQueries({ queryKey: ["projects", id] });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/projects">
              <ClientFlowIcon name="arrow-left" size={16} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
            <p className="text-muted-foreground text-sm">
              {data.client?.name} ({data.client?.company})
              {data.dueDate && (
                <span className="ml-3 inline-flex items-center gap-1">
                  <ClientFlowIcon name="calendar" size={14} />
                  {formatDate(data.dueDate)}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(e) => setDragId(String(e.active.id))}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDragId(null)}
          >
            {COLUMNS.map((col) => (
              <BoardColumn
                key={col}
                columnId={col}
                milestones={data.milestones
                  .filter((m) => m.status === col)
                  .sort((a, b) => a.order - b.order)}
                onDelete={async (milestoneId) => {
                  const res = await fetch(`/api/milestones/${milestoneId}`, { method: "DELETE" });
                  if (!res.ok) {
                    toast.error("Could not delete milestone");
                    return;
                  }
                  toast.success("Milestone deleted");
                  queryClient.invalidateQueries({ queryKey: ["projects", id] });
                }}
              />
            ))}

            <DragOverlay>
              {dragId &&
                (() => {
                  const m = data.milestones.find((x) => x.id === dragId);
                  return m ? (
                    <Card className="w-56 cursor-grabbing gap-1 p-3 opacity-95 shadow-xl">
                      <p className="text-sm font-medium">{m.title}</p>
                    </Card>
                  ) : null;
                })()}
            </DragOverlay>
          </DndContext>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="gap-3">
            <div className="flex items-center gap-2 px-6">
              <ClientFlowIcon name="plus" size={16} className="text-primary" />
              <span className="font-semibold text-sm">Add milestone</span>
            </div>
            <div className="flex flex-col gap-2 px-6">
              <Input
                placeholder="e.g. Design phase complete"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMilestone())}
              />
              <Button size="sm" onClick={addMilestone} disabled={adding || !newMilestone.trim()}>
                {adding && <ClientFlowIcon name="loader" size={16} className="animate-spin" />}
                Add to board
              </Button>
            </div>
          </Card>

          <Card className="gap-3">
            <div className="flex items-center gap-2 px-6">
              <ClientFlowIcon name="task" size={16} className="text-primary" />
              <span className="font-semibold text-sm">Tasks</span>
            </div>
            <div className="flex flex-col gap-2 px-6">
              <Input
                placeholder="e.g. Send final invoice"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
              />
              <Button size="sm" variant="outline" onClick={addTask} disabled={!newTask.trim()}>
                Add task
              </Button>
            </div>
            <div className="flex flex-col px-3 pb-3">
              {data.tasks.length === 0 && (
                <p className="text-muted-foreground px-3 py-2 text-xs">No tasks yet.</p>
              )}
              {data.tasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleTask(t.id, !t.completed)}
                  className="hover:bg-accent flex items-start gap-2.5 rounded-md px-3 py-2 text-left transition-colors"
                >
                  <ClientFlowIcon name="check-circle" className={cn(
                      "mt-0.5 size-4 shrink-0",
                      t.completed ? "text-emerald-500" : "text-muted-foreground/40"
                    )} />
                  <span
                    className={cn(
                      "text-sm",
                      t.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {t.title}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BoardColumn({
  columnId,
  milestones,
  onDelete,
}: {
  columnId: string;
  milestones: Milestone[];
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { type: "column" },
  });
  const label = MILESTONE_STATUSES.find((s) => s.value === columnId)?.label ?? columnId;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-64 flex-col gap-2 rounded-xl border bg-muted/20 p-3 transition-colors",
        COLUMN_STYLES[columnId],
        isOver && "ring-primary/40 ring-2"
      )}
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
          {milestones.length}
        </span>
      </div>

      <SortableContext
        items={milestones.map((m) => m.id)}
        strategy={verticalListSortingStrategy}
      >
        {milestones.map((m) => (
          <SortableMilestoneCard key={m.id} milestone={m} onDelete={() => onDelete(m.id)} />
        ))}
      </SortableContext>

      {milestones.length === 0 && (
        <div className="text-muted-foreground/60 border-border/40 rounded-lg border border-dashed p-4 text-center text-xs">
          Drag milestones here
        </div>
      )}
    </div>
  );
}

function SortableMilestoneCard({
  milestone,
  onDelete,
}: {
  milestone: Milestone;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: milestone.id,
    data: { type: "milestone" },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("touch-none", isDragging && "opacity-40")}
    >
      <Card className="group gap-1 p-3 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{milestone.title}</p>
          <button
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Delete milestone"
          >
            <ClientFlowIcon name="trash" size={14} />
          </button>
        </div>
        {milestone.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs">{milestone.description}</p>
        )}
        {milestone.dueDate && (
          <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
            <ClientFlowIcon name="calendar" size={12} />
            {formatDate(milestone.dueDate)}
          </p>
        )}
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground/50 hover:text-muted-foreground -mb-0.5 -mt-1 ml-auto flex w-fit cursor-grab rounded p-0.5 transition-colors"
          aria-label="Drag to reorder or move"
        >
          <ClientFlowIcon name="grip" size={14} />
        </button>
      </Card>
    </div>
  );
}
