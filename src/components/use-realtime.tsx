"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

const KEY_FOR_EVENT: Record<string, string[]> = {
  [REALTIME_EVENTS.PROJECT_UPDATED]: ["projects"],
  [REALTIME_EVENTS.MILESTONE_UPDATED]: ["projects", "milestones"],
  [REALTIME_EVENTS.TASK_UPDATED]: ["tasks"],
  [REALTIME_EVENTS.PROPOSAL_UPDATED]: ["proposals", "portal"],
  [REALTIME_EVENTS.PROPOSAL_SIGNED]: ["proposals", "portal", "dashboard"],
  [REALTIME_EVENTS.PROPOSAL_CHECKED]: ["proposals"],
  [REALTIME_EVENTS.INVOICE_UPDATED]: ["invoices"],
  [REALTIME_EVENTS.INVOICE_PAID]: ["invoices", "portal", "dashboard"],
  [REALTIME_EVENTS.DELIVERABLE_CREATED]: ["deliverables", "projects"],
  [REALTIME_EVENTS.DELIVERABLE_DELETED]: ["deliverables", "projects"],
};

function eventMatchesKey(event: string, key: string[]) {
  const targets = KEY_FOR_EVENT[event];
  if (!targets) return true;
  return targets.some((t) => key[0] === t);
}

export function useRealtime() {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    let closed = false;

    const connect = () => {
      const source = new EventSource("/api/realtime");

      source.onopen = () => {
        source.addEventListener("connected", () => {
          queryClient.invalidateQueries();
        });
      };

      source.onmessage = () => {
        /* named events only */
      };

      for (const event of Object.keys(KEY_FOR_EVENT)) {
        source.addEventListener(event, () => {
          if (closed) return;
          const keys = queryClient.getQueryCache().findAll();
          for (const query of keys) {
            const parts = query.queryKey as string[];
            if (eventMatchesKey(event, parts)) {
              queryClient.invalidateQueries({ queryKey: parts });
            }
          }
        });
      }

      source.onerror = () => {
        source.close();
        if (!closed) setTimeout(connect, 5000);
      };

      return source;
    };

    const source = connect();
    return () => {
      closed = true;
      source.close();
    };
  }, [queryClient]);
}