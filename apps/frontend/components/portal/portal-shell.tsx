"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { SidebarNav } from "./sidebar";
import { Topbar } from "./topbar";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-border bg-white lg:block">
        <SidebarNav />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Portal navigation">
          <div className="absolute inset-0 bg-neutral-900/40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-lg">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-5 rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[260px]">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-[1080px] px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
