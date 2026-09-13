import { Users } from "lucide-react";

import { SectionEmpty } from "@/components/portal/section-empty";

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-neutral-900">Clients</h2>
        <p className="text-sm text-neutral-500">Every organization you serve, in one directory.</p>
      </div>
      <SectionEmpty
        icon={Users}
        title="No clients yet"
        description="Invite your first client and their profile, requests, and invoices will live here."
      />
    </div>
  );
}
