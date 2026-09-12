import type { RequestStatus } from "@/lib/portal-mock";

const styles: Record<RequestStatus, string> = {
  Submitted: "bg-neutral-100 text-neutral-600",
  "In Progress": "bg-primary-soft text-primary",
  // Amber pair is intentionally outside the Figma palette: status semantics
  // need a warning step between primary (active) and success (done).
  "Pending Feedback": "bg-[#FEF3C7] text-[#92400E]",
  Delivered: "bg-[#DEF7EC] text-success-deep",
};

export function StatusPill({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
