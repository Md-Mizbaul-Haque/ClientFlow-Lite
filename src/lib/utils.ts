import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string | number | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelative(date: Date | string | number | null | undefined) {
  if (!date) return "—";
  const d = new Date(date);
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);
  const days = Math.round(abs / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  if (days >= 30) return rtf.format(Math.round(days / 30), "month");
  if (days >= 1) return rtf.format(days, "day");
  const hours = Math.round(abs / 3_600_000);
  if (hours >= 1) return rtf.format(diff > 0 ? hours : -hours, "hour");
  const minutes = Math.round(abs / 60_000);
  return rtf.format(diff > 0 ? minutes : -minutes, "minute");
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}