import { CalendarDays, Inbox, LayoutDashboard, Receipt, Settings, Users } from "lucide-react";

type MockRequest = {
  id: string;
  title: string;
  client: string;
  status: "Submitted" | "In Progress" | "Pending Feedback" | "Delivered";
  due: string;
  assignee: string;
};

// Mirrors the real portal's data shape and StatusPill colors
// (see components/portal/status-pill.tsx) so the hero reads as the actual product.
const requests: MockRequest[] = [
  {
    id: "REQ-1042",
    title: "Pricing page copy + layout",
    client: "ClearSmile Dental",
    status: "In Progress",
    due: "Sep 18",
    assignee: "MR",
  },
  {
    id: "REQ-1039",
    title: "Autumn social kit — 24 assets",
    client: "Copperline Coffee",
    status: "Pending Feedback",
    due: "Sep 20",
    assignee: "TS",
  },
  {
    id: "REQ-1036",
    title: "Homepage WordPress migration",
    client: "Harbor Legal",
    status: "Delivered",
    due: "Sep 12",
    assignee: "JK",
  },
  {
    id: "REQ-1031",
    title: "Launch teaser cut-down (60s)",
    client: "Volt Athletics",
    status: "Submitted",
    due: "Sep 24",
    assignee: "MR",
  },
];

const statusStyles: Record<MockRequest["status"], string> = {
  Submitted: "bg-neutral-100 text-neutral-600",
  "In Progress": "bg-primary-soft text-primary",
  "Pending Feedback": "bg-[#FEF3C7] text-[#92400E]",
  Delivered: "bg-[#DEF7EC] text-success-deep",
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: false },
  { label: "Requests", icon: Inbox, active: true },
  { label: "Clients", icon: Users, active: false },
  { label: "Invoices", icon: Receipt, active: false },
  { label: "Settings", icon: Settings, active: false },
];

// The request queue is what this product actually is, so the pipeline leads —
// one workflow zoomed in rather than the whole interface at once.
const stages = [
  { label: "Submitted", count: 5, width: "w-[26%]" },
  { label: "In progress", count: 7, width: "w-[37%]" },
  { label: "Feedback", count: 4, width: "w-[21%]" },
  { label: "Delivered", count: 19, width: "w-full" },
];

// Literal utility strings on purpose: Tailwind only emits classes it can find
// verbatim in source, and this keeps the bar heights out of an inline style.
const revenueBars = ["h-[38%]", "h-[52%]", "h-[44%]", "h-[68%]", "h-[61%]", "h-[86%]"];

export function HeroPortalMockup() {
  return (
    <figure
      aria-hidden="true"
      // CSS-only 3D on lg and up: the figure is the perspective scene, the
      // frame sits at z=0, two solid shells step back to form the block's
      // physical edge, and a soft floor shadow grounds it. Flat below lg so
      // phones get a clean straight panel with no extra layers. Zero JS.
      className="relative mx-auto w-full max-w-5xl lg:max-w-none lg:[transform:perspective(1600px)_rotateY(-10deg)_rotateX(3deg)] lg:[transform-style:preserve-3d] lg:origin-left"
    >
      {/* Floor shadow — a blurred brand wash behind the frame's lower half so
          the dashboard lifts off the page. Hidden below lg with the 3D rig. */}
      <div className="absolute inset-x-10 bottom-[-1.5rem] top-[60%] hidden rounded-full bg-primary/20 blur-3xl lg:block lg:[transform:translateZ(-72px)]" />
      {/* Block edge — two receding shells that read as the device edge on the
          tilted sides. Solid fills (not transparent) so the gap between layers
          never shows page background through. */}
      <div className="absolute inset-0 hidden rounded-shell border border-border bg-[#dbe7f3] lg:block lg:[transform:translateZ(-48px)]" />
      <div className="absolute inset-0 hidden rounded-shell border border-border bg-[#e8f0f8] lg:block lg:[transform:translateZ(-24px)]" />
      <div className="relative overflow-hidden rounded-shell border border-border bg-white shadow-shell">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-neutral-50 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          <div className="ml-3 flex h-7 min-w-0 flex-1 items-center rounded-control bg-white px-3 text-xs text-neutral-400">
            <span className="truncate">app.clientflowlite.com</span>
          </div>
        </div>

        {/* Portal body */}
        <div className="flex text-left">
          {/* Sidebar — mirrors components/portal/sidebar.tsx */}
          <aside className="hidden w-44 shrink-0 flex-col bg-primary p-3 sm:flex">
            <div className="flex items-center gap-2 px-2 pb-4 pt-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-white/20 text-xs font-bold text-white">
                CF
              </span>
              {/* whitespace-nowrap: the sidebar is narrow, and wrapping the
                  wordmark to two lines reads as a layout bug. */}
              <span className="whitespace-nowrap text-[13px] font-bold text-white">
                ClientFlow Lite
              </span>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <span
                  key={item.label}
                  className={`flex items-center gap-2.5 rounded-control px-2.5 py-2 text-xs font-medium ${
                    item.active ? "bg-primary-deep text-white" : "text-white/75"
                  }`}
                >
                  <item.icon size={14} aria-hidden="true" />
                  {item.label}
                </span>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-2 px-2 pt-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold text-white">
                MR
              </span>
              <span className="truncate text-[11px] text-white/70">Maya Reyes · Owner</span>
            </div>
          </aside>

          {/* Main panel */}
          <div className="min-w-0 flex-1 bg-page-bg">
            {/* Topbar */}
            <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-neutral-900">Requests</h3>
                <p className="truncate text-[11px] text-neutral-500">
                  Every client request in one queue
                </p>
              </div>
              <span className="hidden items-center rounded-control bg-primary px-3 py-1.5 text-[11px] font-medium text-white sm:inline-flex">
                + New request
              </span>
            </div>

            <div className="flex flex-col gap-3 p-4">
              {/* Pipeline — the workflow this product is actually about */}
              <div className="hidden grid-cols-4 gap-2 md:grid">
                {stages.map((stage) => (
                  <div
                    key={stage.label}
                    className="rounded-card border border-border bg-white px-3 py-2.5 shadow-card"
                  >
                    <p className="text-[11px] font-medium text-neutral-500">{stage.label}</p>
                    <p className="mt-0.5 text-base font-bold text-neutral-900">{stage.count}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-100">
                      <div className={`h-full rounded-full bg-primary ${stage.width}`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Money and speed — stacked on small phones (≈320px) where two
                  ~135px columns squeeze the turnaround bars; side by side
                  from large phones up. */}
              <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
                <div className="rounded-card border border-border bg-white px-3 py-2.5 shadow-card">
                  <p className="text-[11px] font-medium text-neutral-500">Paid this month</p>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <p className="text-base font-bold text-neutral-900">$8,420</p>
                    <span className="text-[10px] font-semibold text-success-deep">+18%</span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-3 rounded-card border border-border bg-white px-3 py-2.5 shadow-card">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-neutral-500">Avg. turnaround</p>
                    <p className="mt-0.5 text-base font-bold text-neutral-900">3.2 days</p>
                  </div>
                  <div className="flex h-8 shrink-0 items-end gap-1">
                    {revenueBars.map((height, index) => (
                      <span
                        key={`${height}-${index}`}
                        className={`w-1.5 rounded-full ${height} ${
                          index === revenueBars.length - 1 ? "bg-primary" : "bg-primary/25"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Queue — mirrors components/portal/request-row.tsx */}
              <div className="flex flex-col gap-2">
                {requests.map((request, index) => (
                  <div
                    key={request.id}
                    // Phones show a cropped 2-row view; all four rows appear from sm up.
                    className={`items-center gap-3 rounded-card border border-border bg-white px-4 py-2.5 shadow-card ${
                      index >= 2 ? "hidden sm:flex" : "flex"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      {/* Title truncates, pill never shrinks: without min-w-0
                          the flex item keeps its intrinsic width and pushes
                          the row past 320px viewports. */}
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-neutral-900">
                          {request.title}
                        </span>
                        <span
                          className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[request.status]}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-neutral-500">
                        {request.id} · {request.client}
                      </p>
                      {index === 0 ? (
                        <p className="truncate text-[11px] text-neutral-400">
                          "Approved, push it live."
                        </p>
                      ) : null}
                    </div>
                    <span className="hidden shrink-0 items-center gap-1 text-[11px] text-neutral-500 md:inline-flex">
                      <CalendarDays size={11} aria-hidden="true" />
                      {request.due}
                    </span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-semibold text-white">
                      {request.assignee}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
