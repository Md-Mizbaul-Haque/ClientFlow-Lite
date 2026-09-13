"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { SidebarNav } from "./sidebar";
import { Topbar } from "./topbar";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
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
  }, [open]);

  // Cmd+K / Ctrl+K opens the search bar.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop sidebar — Figma: 280px wide, #005EB8 bg */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] bg-primary lg:block">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar overlay */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Portal navigation">
          <div className="absolute inset-0 bg-neutral-900/40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-[280px] bg-primary shadow-lg">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-5 rounded-md p-2 text-white/70 hover:bg-white/10"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      {/* Content — Figma: offset 280px from sidebar, max-width 1096px, padding 32px */}
      <div className="lg:pl-[280px]">
        <Topbar onMenu={() => setOpen(true)} onSearchOpenChange={setSearchOpen} searchOpen={searchOpen} />
        <main className="mx-auto w-full max-w-[1096px] px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
