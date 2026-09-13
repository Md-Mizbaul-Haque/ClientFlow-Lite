"use client";

import { Menu } from "lucide-react";

import { NotificationBell } from "./notification-bell";
import { SearchBar } from "./search-bar";

export function Topbar({
  onMenu,
  onSearchOpenChange,
  onSearchToggle,
  searchOpen,
}: {
  onMenu: () => void;
  onSearchOpenChange?: (open: boolean) => void;
  onSearchToggle?: () => void;
  searchOpen?: boolean;
}) {
  return (
    <header
      className="sticky top-0 z-20 flex h-24 items-center gap-4 border-b border-border bg-white px-8 sm:px-6 lg:px-12"
    >
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        className="shrink-0 rounded-md p-2 text-neutral-600 hover:bg-neutral-50 lg:hidden"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/* Search bar — bordered with brand color, rounded. Opens on click or Cmd+K. */}
      <SearchBar onOpenChange={onSearchOpenChange} onToggle={onSearchToggle} open={searchOpen} />

      {/* Notification bell — badge is red via NotificationBell's own styles */}
      <NotificationBell />
    </header>
  );
}