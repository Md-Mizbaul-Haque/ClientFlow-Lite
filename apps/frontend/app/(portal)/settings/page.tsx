import { Settings } from "lucide-react";

import { SectionEmpty } from "@/components/portal/section-empty";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-neutral-900">Settings</h2>
        <p className="text-sm text-neutral-500">Workspace, branding, and notification preferences.</p>
      </div>
      <SectionEmpty
        icon={Settings}
        title="Settings live here"
        description="Agency profile, portal branding, and team preferences are managed in this section."
      />
    </div>
  );
}
