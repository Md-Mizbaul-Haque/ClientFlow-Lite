"use client";

import { Search } from "lucide-react";
import * as React from "react";

import { search, type SearchResult } from "@/lib/api";

interface SearchBarProps {
  onSelect?: (result: SearchResult) => void;
}

export function SearchBar({ onSelect, onToggle, open: controlledOpen }: SearchBarProps & { onToggle?: () => void; open?: boolean }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Controlled open state from the shell (Cmd+K); falls back to internal state.
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = React.useCallback((v: boolean) => {
    if (controlledOpen !== undefined) {
      onToggle?.();
    } else {
      setInternalOpen(v);
    }
  }, [controlledOpen, onToggle]);

  // Focus the input when the dropdown opens.
  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setActiveIndex(0);
    }
  }, [open]);

  async function runSearch(q: string) {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await search(q, 8);
      setResults(data);
      setActiveIndex(0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(value), 180);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = results[activeIndex];
      if (selected) {
        setOpen(false);
        setQuery("");
        onSelect?.(selected);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  // Scroll the active item into view.
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
      if (!target.closest("[data-search-dropdown]")) {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const showSuggestions = open && results.length > 0;
  const showEmpty = open && query.trim().length > 0 && results.length === 0 && !loading;

  return (
    <div className="relative" data-search-dropdown>
      <div
        className="relative flex min-w-0 flex-1 max-w-md rounded-full border border-primary bg-white px-3"
        onClick={() => {
          setOpen(!open);
          if (!open) inputRef.current?.focus();
        }}
      >
        <Search
          size={20}
          strokeWidth={2}
          className="shrink-0 absolute left-3 top-1/2 -translate-y-1/2 text-primary"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search requests, clients, invoices…"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!query.trim()) {
              // Don't spam search on focus; only open if we have results or a query.
              return;
            }
            setOpen(true);
          }}
          className="w-full bg-transparent py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          aria-label="Search"
          aria-expanded={open}
          aria-controls="search-results"
          aria-autocomplete="list"
          role="combobox"
        />
        {open && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              inputRef.current?.blur();
            }}
            className="shrink-0 rounded-full bg-neutral-100 p-1 text-neutral-500 hover:bg-neutral-200"
            aria-label="Close search"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 2.5l9 9M11.5 2.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {showSuggestions && (
        <ul
          id="search-results"
          ref={listRef}
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 w-full overflow-y-auto rounded-xl border border-border bg-white py-1 shadow-lg"
        >
          {results.map((r, i) => (
            <li key={`${r.type}:${r.id}`} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  setQuery("");
                  onSelect?.(r);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors ${i === activeIndex ? "bg-primary-soft" : "hover:bg-neutral-50"}`}
              >
                <span className="text-sm font-medium text-neutral-900">{r.title}</span>
                <span className="text-xs text-neutral-500">{r.subtitle}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showEmpty && (
        <div className="absolute right-0 top-full z-50 mt-1 w-full rounded-xl border border-border bg-white py-6 shadow-lg">
          <p className="px-4 text-sm text-neutral-500">No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {open && query.trim().length === 0 && (
        <div className="absolute right-0 top-full z-50 mt-1 w-full rounded-xl border border-border bg-white py-6 shadow-lg">
          <p className="px-4 text-sm text-neutral-500">Type to search across requests, clients, and invoices.</p>
        </div>
      )}
    </div>
  );
}
