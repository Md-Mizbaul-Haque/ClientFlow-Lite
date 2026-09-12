import { activity, requests, stats } from "@/lib/portal-mock";

export default function DashboardPage() {
  const awaiting = requests.filter((r) => r.status === "Pending Feedback");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-neutral-900">Good to see you, DesignGuru</h2>
        <p className="text-sm text-neutral-500">Here is what needs your attention today.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-xl border border-border bg-white p-4">
            <p className="text-xs font-medium text-neutral-500">{s.label}</p>
            <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
            <p className="text-xs text-neutral-500">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <section aria-label="Needs attention" className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4">
          <h3 className="text-sm font-semibold text-neutral-900">Needs attention</h3>
          {awaiting.length === 0 ? (
            <p className="text-sm text-neutral-500">Nothing waiting on feedback. Queue is clear.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {awaiting.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-neutral-900">{r.title}</span>
                    <span className="text-xs text-neutral-500">
                      {r.client} · due {r.due}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-medium text-[#92400E]">
                    Review
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Recent activity" className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4">
          <h3 className="text-sm font-semibold text-neutral-900">Recent activity</h3>
          <ul className="flex flex-col divide-y divide-border">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 py-2.5">
                <span className="text-sm text-neutral-700">{a.text}</span>
                <span className="shrink-0 text-xs text-neutral-400">{a.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
