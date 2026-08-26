"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fundPath } from "@/lib/seo";
import { ReturnPill } from "./ReturnPill";

interface Hit {
  code: number;
  name: string;
  house: string;
  category: string;
  type: string;
  y5: number | null;
}

export function SearchBox({ placeholder = "Search 15,000+ funds by name, house or category…" }: { placeholder?: string }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setHits([]);
      setTotal(0);
      setOpen(false);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    let cancelled = false;
    let started = false; // whether the debounced fetch actually left the gate
    setLoading(true);

    const t = setTimeout(() => {
      started = true;
      // Terminal .catch() means this chain can never produce an unhandled rejection.
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
        .then((json: { results?: Hit[]; total?: number }) => {
          if (cancelled) return;
          setHits(json.results ?? []);
          setTotal(json.total ?? 0);
          setOpen(true);
          setActive(-1);
        })
        .catch(() => {
          // Aborted (superseded by a newer keystroke) or a network/parse failure.
          // Either way, leave the previous results in place rather than clobbering the UI.
        })
        .then(() => {
          if (!cancelled) setLoading(false);
        });
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(t);
      // Only abort a request that is actually in flight. Calling abort() on a signal no
      // fetch ever consumed (the common case — the debounce timer had not fired yet) is
      // pointless work, and it is what makes Next's dev overlay report a stray
      // "AbortError: signal is aborted without reason".
      if (started && !ctrl.signal.aborted) ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function go(hit: Hit) {
    // Open the fund page in a new tab so the user keeps their search context.
    window.open(fundPath(hit), "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  function seeAll() {
    const query = q.trim();
    if (query.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  function clear() {
    setQ("");
    setHits([]);
    setTotal(0);
    setOpen(false);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && active >= 0 && hits[active]) go(hits[active]);
      else seeAll();
      return;
    }
    if (!open || hits.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    }
  }

  const showDropdown = open && q.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative w-full md:max-w-md">
      <div className="relative">
        {/* Leading search icon */}
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => hits.length && setOpen(true)}
          placeholder={placeholder}
          aria-label="Search funds"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="fund-search-results"
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 && hits[active] ? `fund-hit-${hits[active].code}` : undefined}
          className="w-full rounded-lg border border-border-strong bg-white py-2 pl-9 pr-9 text-[13px] outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/40 [&::-webkit-search-cancel-button]:hidden"
        />

        {/* Trailing: spinner while loading, clear button when idle with text */}
        {loading ? (
          <span
            className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-border border-t-accent"
            aria-hidden="true"
          />
        ) : (
          q.length > 0 && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-faint hover:bg-panel hover:text-ink"
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )
        )}
      </div>

      {/* Announce result counts to assistive tech, which can't see the dropdown appear. */}
      <p className="sr-only" role="status" aria-live="polite">
        {showDropdown
          ? loading
            ? "Searching…"
            : `${total} result${total === 1 ? "" : "s"} for ${q.trim()}`
          : ""}
      </p>

      {showDropdown && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-white shadow-lg">
          {hits.length === 0 ? (
            <div className="px-3 py-4 text-center text-[12.5px] text-dim">
              {loading ? "Searching…" : `No funds match “${q.trim()}”.`}
            </div>
          ) : (
            <>
              <ul id="fund-search-results" role="listbox" aria-label="Fund search results" className="max-h-[22rem] overflow-y-auto py-1">
                {hits.map((h, i) => (
                  <li key={h.code} id={`fund-hit-${h.code}`} role="option" aria-selected={i === active}>
                    <button
                      onClick={() => go(h)}
                      onMouseEnter={() => setActive(i)}
                      tabIndex={-1}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                        i === active ? "bg-panel" : "hover:bg-panel"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">{h.name}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-faint">
                          {h.house} · {h.category}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end">
                        <ReturnPill value={h.y5} />
                        <span className="mt-0.5 text-[9.5px] uppercase tracking-wide text-faint">5Y CAGR</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={seeAll}
                className="flex w-full items-center justify-between border-t border-border bg-panel/60 px-3 py-2 text-left text-[12px] font-medium text-link hover:bg-panel"
              >
                <span>
                  See all {total.toLocaleString("en-IN")} result{total === 1 ? "" : "s"} for “{q.trim()}”
                </span>
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
