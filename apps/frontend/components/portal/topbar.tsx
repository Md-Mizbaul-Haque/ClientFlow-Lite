"use client";

import { LogOut, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useCurrentUser } from "./require-auth";

import { logout } from "@/lib/api";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/requests": "Requests",
  "/clients": "Clients",
  "/invoices": "Invoices",
  "/settings": "Settings",
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();

  function handleLogout() {
    logout();
    // replace, not push: the portal must not stay in the back-button history.
    router.replace("/login");
  }

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
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary sm:inline">
          14-day trial
        </span>
        <span className="hidden max-w-[200px] truncate text-sm text-neutral-600 md:block">{user.email}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <LogOut size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
