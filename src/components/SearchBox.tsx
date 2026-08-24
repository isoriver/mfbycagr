"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Hit {
  code: number;
  name: string;
  house: string;
}

export function SearchBox({ placeholder = "Search 15,000+ funds…" }: { placeholder?: string }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setHits([]);
      setOpen(false);
      return;
    }
    const ctrl = new AbortController();
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const json = (await res.json()) as { results: Hit[] };
        if (cancelled) return;
        setHits(json.results || []);
        setOpen(true);
        setActive(-1);
      } catch (err) {
        // Aborted on cleanup (each keystroke cancels the previous request) — expected, ignore.
        if ((err as Error)?.name === "AbortError") return;
        // Real network/parse failure: keep prior results rather than clobbering the UI.
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
      ctrl.abort();
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
    router.push(`/funds/${hit.code}`);
    setOpen(false);
    setQ("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || hits.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(hits[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => hits.length && setOpen(true)}
        placeholder={placeholder}
        aria-label="Search funds"
        className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-accent"
      />
      {open && (
        <div className="absolute z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-border bg-white shadow-lg">
          {hits.length === 0 ? (
            <div className="p-3 text-[12.5px] text-dim">No matches.</div>
          ) : (
            hits.map((h, i) => (
              <button
                key={h.code}
                onClick={() => go(h)}
                className={`flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2 text-left text-[13px] last:border-0 hover:bg-panel ${
                  i === active ? "bg-panel" : ""
                }`}
              >
                <span className="truncate">{h.name}</span>
                <span className="shrink-0 text-[11px] text-faint">#{h.code}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
