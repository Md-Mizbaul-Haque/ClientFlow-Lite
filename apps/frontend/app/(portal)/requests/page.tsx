"use client";

import { Inbox } from "lucide-react";
import * as React from "react";

import { RequestRow } from "@/components/portal/request-row";
import { STATUSES, requests } from "@/lib/portal-mock";

export default function RequestsPage() {
  const [filter, setFilter] = React.useState<(typeof STATUSES)[number] | "All">("All");

  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const r of requests) map.set(r.status, (map.get(r.status) ?? 0) + 1);
    return map;
  }, []);

  const visible = filter === "All" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-neutral-900">Request queue</h2>
        <p className="text-sm text-neutral-500">Every client brief in one place — newest first.</p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {(["All", ...STATUSES] as const).map((s) => {
          const active = filter === s;
          const count = s === "All" ? requests.length : (counts.get(s) ?? 0);
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-neutral-600 hover:border-border-strong hover:text-neutral-900"
              }`}
            >
              {s}
              <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white/20" : "bg-neutral-100"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-white px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Inbox size={22} aria-hidden="true" />
          </span>
          <h3 className="text-base font-semibold text-neutral-900">No {filter.toLowerCase()} requests</h3>
          <p className="max-w-[380px] text-sm text-neutral-500">Nothing is sitting in this stage right now.</p>
          <button
            type="button"
            onClick={() => setFilter("All")}
            className="mt-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Show all requests
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((r) => (
            <RequestRow key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}
