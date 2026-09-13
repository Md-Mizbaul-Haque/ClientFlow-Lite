"use client";

import { Inbox, Receipt, Search, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { search, type SearchResult } from "@/lib/api";

interface SearchBarProps {
  onSelect?: (result: SearchResult) => void;
  /** Controlled open state (e.g. driven by Cmd+K in the shell). */
  open?: boolean;
  /** Explicit open-state setter. Prefer this over `onToggle`. */
  onOpenChange?: (open: boolean) => void;
  /** @deprecated Use `onOpenChange` — kept for backwards compat. */
  onToggle?: () => void;
}

const LISTBOX_ID = "portal-search-listbox";

function ResultIcon({ type }: { type: SearchResult["type"] }) {
  const Icon = type === "client" ? Users : type === "invoice" ? Receipt : Inbox;
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-softer text-primary">
      <Icon size={16} strokeWidth={2} aria-hidden="true" />
    </span>
  );
}

function typeLabel(type: SearchResult["type"]): string {
  return type === "client" ? "Client" : type === "invoice" ? "Invoice" : "Request";
}

export function SearchBar({ onSelect, open: controlledOpen, onOpenChange, onToggle }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestRef = React.useRef(0);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  // Explicit setter — never toggles blindly, so closing an already-closed
  // popover (outside click, Escape) can't accidentally reopen it.
  const requestOpen = React.useCallback(
    (next: boolean) => {
      if (onOpenChange) {
        onOpenChange(next);
      } else if (isControlled) {
        if (next !== controlledOpen) onToggle?.();
      } else {
        setInternalOpen(next);
      }
    },
    [onOpenChange, isControlled, controlledOpen, onToggle],
  );

  const closeAndBlur = React.useCallback(() => {
    requestOpen(false);
    inputRef.current?.blur();
  }, [requestOpen]);

  // Focus the input whenever the popover opens (e.g. via Cmd+K).
  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setActiveIndex(0);
    }
  }, [open ]);

  // Clear pending debounce on unmount.
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function runSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    const id = ++requestRef.current;
    setLoading(true);
    try {
      const data = await search(trimmed, 8);
      // Drop stale responses when the user kept typing.
      if (requestRef.current !== id) return;
      setResults(data);
      setActiveIndex(0);
    } catch {
      if (requestRef.current !== id) return;
      setResults([]);
    } finally {
      if (requestRef.current === id) setLoading(false);
    }
  }

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      requestRef.current += 1;
      setResults([]);
      setLoading(false);
      // Stay open on empty query so Cmd+K shows the hint panel.
      requestOpen(true);
      return;
    }
    requestOpen(true);
    debounceRef.current = setTimeout(() => runSearch(value), 200);
  }

  function selectResult(result: SearchResult) {
    requestOpen(false);
    setQuery("");
    setResults([]);
    inputRef.current?.blur();
    if (onSelect) {
      onSelect(result);
    } else if (result.url) {
      router.push(result.url);
    }
  }

  function clearQuery() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    requestRef.current += 1;
    setQuery("");
    setResults([]);
    setLoading(false);
    requestOpen(true);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = results[activeIndex];
      if (selected) selectResult(selected);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeAndBlur();
    } else if (e.key === "Tab") {
      requestOpen(false);
    }
  }

  // Keep the keyboard-active option visible.
  React.useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Close on outside click.
  React.useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!(e.target instanceof Node)) return;
      const target = e.target as HTMLElement;
      if (!target.closest("[data-search-root]")) requestOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open, requestOpen]);

  const trimmedQuery = query.trim();
  const hasResults = results.length > 0;
  const activeResult = hasResults ? results[Math.min(activeIndex, results.length - 1)] : undefined;

  return (
    <div className="relative min-w-0 flex-1" data-search-root>
      {/* Field — idle: neutral border on soft fill; hover: stronger border; focus: brand ring. */}
      <div
        className={`relative flex h-10 items-center rounded-full border bg-neutral-50 transition-colors ${
          open
            ? "border-primary bg-white shadow-sm ring-2 ring-primary/15"
            : "border-border hover:border-border-strong hover:bg-white focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/15"
        }`}
        onMouseDown={(e) => {
          // Focus the input without toggling closed when repositioning the caret.
          const target = e.target as HTMLElement;
          if (target.closest("input,button")) return;
          e.preventDefault();
          requestOpen(true);
          inputRef.current?.focus();
        }}
      >
        <Search
          size={17}
          strokeWidth={2}
          className={`pointer-events-none absolute left-3.5 shrink-0 transition-colors ${open || trimmedQuery ? "text-primary" : "text-neutral-400"}`}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          placeholder="Search requests, clients, invoices…"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => requestOpen(true)}
          aria-label="Search requests, clients, and invoices"
          aria-expanded={open}
          aria-controls={open ? LISTBOX_ID : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open && activeResult ? `portal-search-option-${activeResult.type}-${activeResult.id}` : undefined}
          autoComplete="off"
          spellCheck={false}
          className="h-full w-full bg-transparent pl-10 pr-20 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />

        {/* Right cluster — loading spinner, clear button, or Cmd+K hint. */}
        <span className="absolute right-2.5 flex shrink-0 items-center gap-1.5">
          {loading ? (
            <span
              className="flex h-5 w-5 animate-spin rounded-full border-2 border-primary-soft border-t-primary"
              aria-hidden="true"
            />
          ) : trimmedQuery ? (
            <button
              type="button"
              onClick={clearQuery}
              aria-label="Clear search"
              className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="hidden items-center gap-0.5 rounded-md border border-border bg-white px-1.5 py-0.5 text-[11px] font-semibold leading-none text-neutral-500 shadow-xs sm:flex"
            >
              ⌘K
            </kbd>
          )}
        </span>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-border bg-white shadow-lg sm:min-w-[22rem]">
          {loading && !hasResults ? (
            <div className="flex items-center gap-3 px-4 py-4 text-neutral-500" role="status" aria-live="polite">
              <span className="flex h-4 w-4 animate-spin rounded-full border-2 border-primary-soft border-t-primary" />
              <span className="text-sm">Searching…</span>
            </div>
          ) : hasResults ? (
            <>
              <ul id={LISTBOX_ID} ref={listRef} role="listbox" aria-label="Search results" className="max-h-80 overflow-y-auto p-1.5">
                {results.map((r, i) => {
                  const active = i === activeIndex;
                  return (
                    <li
                      key={`${r.type}:${r.id}`}
                      id={`portal-search-option-${r.type}-${r.id}`}
                      role="option"
                      aria-selected={active}
                    >
                      <button
                        type="button"
                        tabIndex={-1}
                        onMouseDown={(e) => {
                          // Select before the input blur / outside-click handler runs.
                          e.preventDefault();
                          selectResult(r);
                        }}
                        onMouseEnter={() => setActiveIndex(i)}
                        onFocus={() => setActiveIndex(i)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          active ? "bg-primary-softer" : "hover:bg-neutral-50"
                        }`}
                      >
                        <ResultIcon type={r.type} />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-sm font-medium text-neutral-900">{r.title}</span>
                          <span className="truncate text-xs text-neutral-500">{r.subtitle}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
                          {typeLabel(r.type)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center gap-3 border-t border-border-light px-4 py-2 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-neutral-50 px-1 font-semibold">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-neutral-50 px-1 font-semibold">↵</kbd> open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-neutral-50 px-1 font-semibold">esc</kbd> close
                </span>
              </div>
            </>
          ) : trimmedQuery ? (
            <div className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <Search size={16} aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-neutral-700">No results for &ldquo;{query.trim()}&rdquo;</p>
              <p className="text-xs text-neutral-500">Try a different name, title, or invoice number.</p>
            </div>
          ) : (
            <div className="px-4 py-4">
              <p className="text-sm text-neutral-500">Type to search across requests, clients, and invoices.</p>
              <p className="mt-1.5 text-xs text-neutral-400">Results appear as you type — press Enter to open the top match.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
