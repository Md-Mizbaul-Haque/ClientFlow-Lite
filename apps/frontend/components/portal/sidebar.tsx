"use client";

import { Inbox, LayoutDashboard, Receipt, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCurrentUser } from "./require-auth";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: Inbox },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/settings", label: "Settings", icon: Settings },
];

// "DesignGuru Studio" is two words; take the first letter of up to two words.
function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useCurrentUser();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          CF
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-neutral-900">ClientFlow Lite</span>
          <span className="max-w-[150px] truncate text-xs text-neutral-500">{user.agencyName}</span>
        </span>
      </div>
      <nav aria-label="Portal" className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-primary-soft text-primary" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
            {initials(user.agencyName)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="max-w-[150px] truncate text-sm font-medium text-neutral-900">{user.email}</span>
            <span className="text-xs text-neutral-500">Agency owner</span>
          </span>
        </div>
      </div>
    </div>
  );
}
