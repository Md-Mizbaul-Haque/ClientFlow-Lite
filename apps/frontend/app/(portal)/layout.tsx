import { PortalShell } from "@/components/portal/portal-shell";
import { RequireAuth } from "@/components/portal/require-auth";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <PortalShell>{children}</PortalShell>
    </RequireAuth>
  );
}
