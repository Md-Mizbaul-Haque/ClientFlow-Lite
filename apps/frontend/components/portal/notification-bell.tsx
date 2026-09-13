"use client";

import { Bell } from "lucide-react";
import * as React from "react";

import { markNotificationsRead, type Notification } from "@/lib/api";

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Pull the latest on mount and when the dropdown opens.
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getNotifications()
      .then((data) => {
        if (!cancelled) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Refresh when the dropdown opens so the user sees the latest.
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getNotifications()
      .then((data) => {
        if (!cancelled) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markRead(id?: string) {
    try {
      await markNotificationsRead(id);
      // Optimistic reset of the unread count for the single-notification case.
      if (id) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch {
      // Non-blocking — the user can retry by reopening the dropdown.
    }
  }

  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group relative rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <span className="relative block">
          <Bell size={22} strokeWidth={2} className="transition-transform group-hover:scale-105" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error px-1 text-[11px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
              {badgeLabel}
            </span>
          )}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-neutral-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markRead(undefined)}
                className="rounded-full bg-error px-2 py-0.5 text-xs font-semibold text-white hover:bg-error/80"
              >
                {unreadCount}
              </button>
            )}
          </div>
          {loading ? (
            <div className="flex items-center gap-3 px-4 py-3 text-neutral-500">
              <span className="flex h-5 w-5 animate-spin rounded-full border-2 border-primary-soft border-t-primary" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col gap-2 px-4 py-6 text-center">
              <span className="text-sm text-neutral-500">Nothing here yet</span>
              <span className="text-xs text-neutral-400">New notifications will appear here.</span>
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 transition-colors ${!n.read ? "bg-primary-soft/30" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {!n.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-error" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!n.read ? "font-semibold text-neutral-900" : "text-neutral-700"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">{n.body}</p>
                      <p className="mt-1 text-xs text-neutral-400">{n.createdAt}</p>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        className="shrink-0 rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                        aria-label="Mark as read"
                      >
                        <Bell size={14} strokeWidth={2} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border px-4 py-2.5">
            <button
              type="button"
              onClick={() => markRead(undefined)}
              className="w-full text-center text-sm font-medium text-primary hover:text-primary-hover"
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getNotifications(cursor?: string): Promise<{ notifications: Notification[]; unreadCount: number; nextCursor: string | null }> {
  return import("@/lib/api").then((m) => m.getNotifications(cursor));
}