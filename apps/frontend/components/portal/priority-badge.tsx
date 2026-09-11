import { Flag } from "lucide-react";

import type { RequestPriority } from "@/lib/portal-mock";

const styles: Record<RequestPriority, string> = {
  High: "text-error",
  Medium: "text-[#92400E]",
  Low: "text-neutral-400",
};

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${styles[priority]}`}>
      <Flag size={12} aria-hidden="true" />
      {priority}
    </span>
  );
}
