import { Receipt } from "lucide-react";

import { SectionEmpty } from "@/components/portal/section-empty";

export default function InvoicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-neutral-900">Invoices</h2>
        <p className="text-sm text-neutral-500">Bill for delivered work and track what is outstanding.</p>
      </div>
      <SectionEmpty
        icon={Receipt}
        title="No invoices yet"
        description="Invoices you raise against delivered requests will appear here with their status."
      />
    </div>
  );
}
