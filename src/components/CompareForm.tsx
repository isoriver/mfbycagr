"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Hit {
  code: number;
  name: string;
}

function Picker({
  label,
  inputId,
  onPick,
  picked,
}: {
  label: string;
  inputId: string;
  onPick: (h: Hit | null) => void;
  picked: Hit | null;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // The `ref` was previously declared but never used, so the dropdown stayed open
  // forever once shown. Close it when the user clicks anywhere outside the picker.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    let cancelled = false;
    let started = false;
    const t = setTimeout(() => {
      started = true;
      fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
        .then((json: { results?: Hit[] }) => {
          if (cancelled) return;
          setHits(json.results ?? []);
          setOpen(true);
        })
        .catch(() => {
          /* aborted by a newer keystroke, or a network failure — keep prior results */
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
      // Abort only an in-flight request (see the note in SearchBox).
      if (started && !ctrl.signal.aborted) ctrl.abort();
    };
  }, [q]);

  return (
    <div ref={ref} className="relative">
      <label htmlFor={inputId} className="mb-1 block text-[12px] text-dim">
        {label}
      </label>
      {picked ? (
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-[13px]">
          <span className="truncate">{picked.name}</span>
          <button onClick={() => onPick(null)} className="ml-2 text-faint hover:text-down" aria-label="Clear">
            ✕
          </button>
        </div>
      ) : (
        <>
          <input
            id={inputId}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => hits.length && setOpen(true)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            placeholder="Search a fund…"
            role="combobox"
            aria-expanded={open && hits.length > 0}
            aria-controls={`${inputId}-results`}
            aria-autocomplete="list"
            className="w-full rounded-md border border-border-strong px-3 py-2 text-[13px] outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
          />
          {open && hits.length > 0 && (
            <div
              id={`${inputId}-results`}
              role="listbox"
              aria-label={`${label} search results`}
              className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-white shadow-lg"
            >
              {hits.map((h) => (
                <button
                  key={h.code}
                  onClick={() => {
                    onPick(h);
                    setOpen(false);
                    setQ("");
                  }}
                  className="block w-full border-b border-border px-3 py-2 text-left text-[13px] last:border-0 hover:bg-panel"
                >
                  {h.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const SLOTS = ["Fund A", "Fund B", "Fund C (optional)", "Fund D (optional)"];

export function CompareForm() {
  const [picks, setPicks] = useState<(Hit | null)[]>([null, null, null, null]);
  const router = useRouter();

  const setAt = (i: number, h: Hit | null) =>
    setPicks((prev) => prev.map((p, idx) => (idx === i ? h : p)));

  const chosen = picks.filter((p): p is Hit => p != null);
  const codes = Array.from(new Set(chosen.map((p) => p.code)));
  const canCompare = codes.length >= 2;

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {SLOTS.map((label, i) => (
          <Picker
            key={i}
            label={label}
            inputId={`compare-fund-${i}`}
            onPick={(h) => setAt(i, h)}
            picked={picks[i]}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          disabled={!canCompare}
          aria-describedby="compare-hint"
          onClick={() => canCompare && router.push(`/compare/${codes.join("-vs-")}`)}
          className="rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white disabled:opacity-40"
        >
          Compare →
        </button>
        <span id="compare-hint" className="text-[12px] text-faint">
          Pick 2 to 4 funds.
        </span>
      </div>
    </div>
  );
}
