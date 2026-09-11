import { CalendarDays } from "lucide-react";

import { PriorityBadge } from "@/components/portal/priority-badge";
import { StatusPill } from "@/components/portal/status-pill";
import type { PortalRequest } from "@/lib/portal-mock";

export function RequestRow({ request }: { request: PortalRequest }) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-neutral-900">{request.title}</h3>
          <StatusPill status={request.status} />
        </div>
        <p className="truncate text-xs text-neutral-500">
          {request.id} · {request.client} · {request.service}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-xs text-neutral-500">
        <PriorityBadge priority={request.priority} />
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={12} aria-hidden="true" />
          {request.due}
        </span>
        <span
          aria-label={`Assigned to ${request.assignee}`}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-[11px] font-semibold text-white"
        >
          {request.assignee}
        </span>
      </div>
    </article>
  );
}
