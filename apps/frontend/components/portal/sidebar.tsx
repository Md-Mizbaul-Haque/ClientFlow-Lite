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
      {/* Brand header — Figma: padding 24px */}
      <div className="flex items-center gap-3 px-6 pb-6 pt-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/20 text-sm font-bold text-white">
          CF
        </span>
        <span className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white">ClientFlow Lite</span>
          <span className="max-w-[150px] truncate text-xs text-white/70">{user.agencyName}</span>
        </span>
      </div>

      {/* Navigation — Figma: items padding 16px 14px, text 16px Medium, gap 1px between items */}
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
              className={`flex items-center gap-4 rounded-md px-3.5 py-4 text-base font-medium transition-colors ${
                active
                  ? "bg-primary-deep text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section — Figma: no border on blue bg, white text */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
            {initials(user.agencyName)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="max-w-[150px] truncate text-sm font-medium text-white">{user.email}</span>
            <span className="text-xs text-white/70">Agency owner</span>
          </span>
        </div>
      </div>
    </div>
  );
}
