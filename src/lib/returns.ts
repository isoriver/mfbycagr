/**
 * Pure return / CAGR math for Indian mutual fund NAV history.
 *
 * Framework-free and dependency-free on purpose: this module is unit-tested with
 * `node --test` (see tests/returns.test.mjs) without needing npm install or network.
 *
 * MFapi.in NAV records look like: { date: "dd-mm-yyyy", nav: "123.4567" }
 * and are returned newest-last / order-unspecified, so we always sort defensively.
 */

export interface NavPoint {
  date: string; // "dd-mm-yyyy"
  nav: string; // stringified float
}

export type Period = "y1" | "y3" | "y5" | "y10";

export const PERIOD_YEARS: Record<Period, number> = {
  y1: 1,
  y3: 3,
  y5: 5,
  y10: 10,
};

export interface ComputedReturns {
  latestNav: number | null;
  latestDate: string | null; // ISO yyyy-mm-dd
  today: number | null; // 1-day % change
  cagr: Record<Period, number | null>;
  spark: number[]; // last 30 NAVs, oldest -> newest
  dataPoints: number;
}

/** Parse MFapi "dd-mm-yyyy" into a UTC-midnight Date. Returns null when malformed. */
export function parseNavDate(d: string): Date | null {
  if (typeof d !== "string") return null;
  const parts = d.split("-");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map((p) => Number(p));
  if (!dd || !mm || !yyyy) return null;
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd));
  return Number.isNaN(dt.getTime()) ||
    dt.getUTCFullYear() !== yyyy ||
    dt.getUTCMonth() !== mm - 1 ||
    dt.getUTCDate() !== dd
    ? null
    : dt;
}

/** Format a Date as ISO yyyy-mm-dd (UTC). */
export function toIsoDate(dt: Date): string {
  return dt.toISOString().slice(0, 10);
}

/** Annualised CAGR as a percentage. Returns null on invalid inputs. */
export function cagr(startNav: number, endNav: number, years: number): number | null {
  if (!(startNav > 0) || !(endNav > 0) || !(years > 0)) return null;
  return (Math.pow(endNav / startNav, 1 / years) - 1) * 100;
}

interface SortedPoint {
  dt: Date;
  nav: number;
}

const DAY_MS = 86_400_000;
/**
 * How far the nearest NAV may sit from a horizon date before we treat the horizon
 * as having no usable data. MFapi histories often have multi-month/-year gaps (old,
 * merged or renamed schemes); without this guard the horizon lookup would latch onto
 * a stale pre-gap NAV and report absurd CAGR (e.g. a bond fund at "+173% 5Y"). 45 days
 * comfortably covers weekends, holiday clusters and sparse (monthly) reporters.
 */
const HORIZON_TOLERANCE_MS = 45 * DAY_MS;

/** Sort valid points newest-first and coerce NAVs to numbers. */
function normalise(points: NavPoint[]): SortedPoint[] {
  const out: SortedPoint[] = [];
  for (const p of points) {
    const dt = parseNavDate(p.date);
    const nav = parseFloat(p.nav);
    if (dt && Number.isFinite(nav) && nav > 0) out.push({ dt, nav });
  }
  out.sort((a, b) => b.dt.getTime() - a.dt.getTime());
  return out;
}

/**
 * Compute latest NAV, 1-day change, CAGR over 1/3/5/10y and a 30-point sparkline.
 * Each horizon uses the NAV closest to the target date, but only if that point is
 * within HORIZON_TOLERANCE_MS of it — so gaps in the history yield null instead of a
 * bogus CAGR computed against a years-stale NAV.
 */
export function computeReturns(points: NavPoint[]): ComputedReturns {
  const sorted = normalise(points);
  const empty: ComputedReturns = {
    latestNav: null,
    latestDate: null,
    today: null,
    cagr: { y1: null, y3: null, y5: null, y10: null },
    spark: [],
    dataPoints: sorted.length,
  };
  if (sorted.length === 0) return empty;

  const latest = sorted[0];
  const prev = sorted[1];
  const latestNav = latest.nav;
  const today = prev ? (latestNav / prev.nav - 1) * 100 : null;

  const cagrOut: Record<Period, number | null> = { y1: null, y3: null, y5: null, y10: null };
  (Object.keys(PERIOD_YEARS) as Period[]).forEach((period) => {
    const years = PERIOD_YEARS[period];
    const target = new Date(latest.dt);
    target.setUTCFullYear(target.getUTCFullYear() - years);
    const targetMs = target.getTime();
    // Pick the NAV closest to the horizon date (either side), then reject it if the
    // nearest available point is farther than the tolerance — that means the history
    // has a gap around this horizon and any CAGR from it would be an artefact.
    let best: SortedPoint | null = null;
    let bestDiff = Infinity;
    for (const p of sorted) {
      const diff = Math.abs(p.dt.getTime() - targetMs);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = p;
      }
    }
    cagrOut[period] = best && bestDiff <= HORIZON_TOLERANCE_MS ? cagr(best.nav, latestNav, years) : null;
  });

  const spark = sorted
    .slice(0, 30)
    .reverse()
    .map((p) => p.nav);

  return {
    latestNav,
    latestDate: toIsoDate(latest.dt),
    today,
    cagr: cagrOut,
    spark,
    dataPoints: sorted.length,
  };
}
