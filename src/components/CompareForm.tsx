"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Hit {
  code: number;
  name: string;
}

function Picker({ label, onPick, picked }: { label: string; onPick: (h: Hit | null) => void; picked: Hit | null }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal });
        const json = (await res.json()) as { results: Hit[] };
        setHits(json.results || []);
        setOpen(true);
      } catch {
        /* ignore */
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  return (
    <div ref={ref} className="relative">
      <label className="mb-1 block text-[12px] text-dim">{label}</label>
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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => hits.length && setOpen(true)}
            placeholder="Search a fund…"
            className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:border-accent"
          />
          {open && hits.length > 0 && (
            <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-white shadow-lg">
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

export function CompareForm() {
  const [a, setA] = useState<Hit | null>(null);
  const [b, setB] = useState<Hit | null>(null);
  const router = useRouter();

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Picker label="Fund A" onPick={setA} picked={a} />
        <Picker label="Fund B" onPick={setB} picked={b} />
      </div>
      <button
        disabled={!a || !b || a.code === b.code}
        onClick={() => a && b && router.push(`/compare/${a.code}-vs-${b.code}`)}
        className="mt-4 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white disabled:opacity-40"
      >
        Compare →
      </button>
    </div>
  );
}
