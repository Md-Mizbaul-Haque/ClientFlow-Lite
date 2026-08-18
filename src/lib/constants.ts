export const PROJECT_STATUSES = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
] as const;

export const MILESTONE_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
] as const;

export const PROPOSAL_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
] as const;

export const INVOICE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
] as const;

export const INVOICE_TYPES = [
  { value: "deposit", label: "Deposit" },
  { value: "final", label: "Final" },
] as const;

export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "BDT", "AUD", "CAD"] as const;

export const STATUS_STYLES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-transparent",
  sent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  pending: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  declined: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  overdue: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  in_progress: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  in_review: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  backlog: "bg-muted text-muted-foreground border-transparent",
};