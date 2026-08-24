import type { SchemeListItem, SchemeDetail } from "./types";

const BASE = process.env.MFAPI_BASE || "https://api.mfapi.in";

async function fetchJson<T>(url: string, opts?: { retries?: number; timeoutMs?: number }): Promise<T> {
  const retries = opts?.retries ?? 2;
  const timeoutMs = opts?.timeoutMs ?? 15000;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { accept: "application/json" },
        // Next.js: allow ISR to cache these fetches for a day.
        next: { revalidate: 86400 },
      } as RequestInit);
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`Failed to fetch ${url}`);
}

/** GET /mf — the full scheme universe (~15k entries). */
export async function listSchemes(): Promise<SchemeListItem[]> {
  return fetchJson<SchemeListItem[]>(`${BASE}/mf`);
}

/** GET /mf/:code — one scheme's meta + full NAV history. */
export async function getScheme(code: number | string): Promise<SchemeDetail> {
  return fetchJson<SchemeDetail>(`${BASE}/mf/${code}`);
}

/** GET /mf/:code/latest — meta + latest NAV only (lighter). */
export async function getSchemeLatest(code: number | string): Promise<SchemeDetail> {
  return fetchJson<SchemeDetail>(`${BASE}/mf/${code}/latest`);
}
