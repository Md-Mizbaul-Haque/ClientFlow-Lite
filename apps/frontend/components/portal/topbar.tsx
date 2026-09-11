"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/requests": "Requests",
  "/clients": "Clients",
  "/invoices": "Invoices",
  "/settings": "Settings",
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
      >
        <Menu size={20} aria-hidden="true" />
      </button>
      <h1 className="text-base font-semibold text-neutral-900">{titles[pathname] ?? "Portal"}</h1>
      <span className="ml-auto hidden rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary sm:inline">
        14-day trial
      </span>
    </header>
  );
}
