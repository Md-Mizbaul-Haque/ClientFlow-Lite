// UI-only seed data — shaped like the future GET /api/requests response.
// When the backend lands, replace these imports with a fetch call.

export type RequestStatus = "Submitted" | "In Progress" | "Pending Feedback" | "Delivered";

export type RequestPriority = "High" | "Medium" | "Low";

export type PortalRequest = {
  id: string;
  title: string;
  client: string;
  service: string;
  status: RequestStatus;
  priority: RequestPriority;
  due: string;
  assignee: string;
};

export const STATUSES: RequestStatus[] = ["Submitted", "In Progress", "Pending Feedback", "Delivered"];

export const requests: PortalRequest[] = [
  { id: "REQ-1042", title: "SaaS landing page hero redesign", client: "Acme Co", service: "Landing page", status: "In Progress", priority: "High", due: "Sep 14", assignee: "MH" },
  { id: "REQ-1041", title: "Pricing section copy + layout", client: "Bright Dental", service: "Landing page", status: "Pending Feedback", priority: "High", due: "Sep 12", assignee: "AR" },
  { id: "REQ-1040", title: "Logo variations round 2", client: "Nexus Creative", service: "Logo design", status: "In Progress", priority: "Medium", due: "Sep 16", assignee: "MH" },
  { id: "REQ-1039", title: "Homepage speed audit", client: "TeamTown", service: "SEO audit", status: "Submitted", priority: "Medium", due: "Sep 18", assignee: "AR" },
  { id: "REQ-1038", title: "Product launch teaser edit", client: "Magier Studio", service: "Video edit", status: "Submitted", priority: "Low", due: "Sep 20", assignee: "MH" },
  { id: "REQ-1037", title: "Onboarding email sequence", client: "Acme Co", service: "Copywriting", status: "Pending Feedback", priority: "Medium", due: "Sep 13", assignee: "AR" },
  { id: "REQ-1036", title: "Investor deck touch-up", client: "Bright Dental", service: "Slide design", status: "Delivered", priority: "Low", due: "Sep 08", assignee: "MH" },
  { id: "REQ-1035", title: "Blog template components", client: "Nexus Creative", service: "Landing page", status: "Delivered", priority: "Medium", due: "Sep 05", assignee: "AR" },
];

export type StatCard = {
  label: string;
  value: string;
  hint: string;
};

export const stats: StatCard[] = [
  { label: "Active requests", value: "6", hint: "2 awaiting your review" },
  { label: "Pending feedback", value: "2", hint: "Oldest waiting 2 days" },
  { label: "Delivered this month", value: "14", hint: "+4 vs August" },
  { label: "Collected in September", value: "$4,280", hint: "$1,150 outstanding" },
];

export type ActivityItem = {
  id: string;
  text: string;
  time: string;
};

export const activity: ActivityItem[] = [
  { id: "a1", text: "Bright Dental commented on 'Pricing section copy + layout'", time: "25 min ago" },
  { id: "a2", text: "You moved 'Logo variations round 2' to In Progress", time: "2 hrs ago" },
  { id: "a3", text: "Acme Co approved 'Investor deck touch-up'", time: "Yesterday" },
  { id: "a4", text: "New request 'Homepage speed audit' from TeamTown", time: "Yesterday" },
];

export type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

export const notifications: Notification[] = [
  { id: "n1", title: "New request submitted", description: "TeamTown submitted 'Homepage speed audit'", time: "10 min ago", read: false },
  { id: "n2", title: "Feedback received", description: "Bright Dental commented on 'Pricing section copy + layout'", time: "25 min ago", read: false },
  { id: "n3", title: "Request delivered", description: "You marked 'Investor deck touch-up' as delivered", time: "Yesterday", read: true },
  { id: "n4", title: "Client approved", description: "Acme Co approved 'Investor deck touch-up'", time: "Yesterday", read: true },
];
