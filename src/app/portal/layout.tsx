import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PortalShell } from "@/components/portal-shell";

export default async function PortalLayout({ children }: LayoutProps<"/portal">) {
  const session = await getSession();
  if (!session || session.role !== "client") {
    redirect("/auth/magic-link");
  }

  return (
    <PortalShell name={session.name} email={session.email}>
      {children}
    </PortalShell>
  );
}