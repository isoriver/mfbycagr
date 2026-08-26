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
  m1: number | null; // 1-month absolute return %
  m6: number | null; // 6-month absolute return %
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
 * A genuine fund NAV never changes by more than ~15-20% between two consecutive daily
 * observations (circuit breakers cap even a crash day). When it jumps by a large factor
 * overnight it is a **split / bonus / re-denomination / plan-merger** or a feed error —
 * e.g. a face-value reset that halves the NAV (~2x), or ICICI Overnight Fund's ~10x
 * jump on 2022-08-17. Any horizon spanning such a break reports a fabricated CAGR
 * (that overnight fund showed "+67% 5Y").
 *
 * Rather than discard the pre-break history (which nulls the long horizons), we
 * **back-adjust** it the way a stock split is adjusted: walking newest → oldest, each
 * time an adjacent pair (within a few days) crosses the split threshold we fold that
 * ratio into a cumulative factor and scale every older NAV by it, so the series becomes
 * continuous on the latest scale. This yields the correct CAGR across the split *and*
 * keeps the full history. Two useful properties fall out for free:
 *   • a transient one-day spike (jump then immediate reversal) cancels itself, and
 *   • a split on the most recent day makes the 1-day change ~0 instead of a fake move.
 */
const SPLIT_FACTOR = 1.5; // >1.5x or <1/1.5x overnight = artefact, never a real market move
const JUMP_MAX_GAP_MS = 7 * DAY_MS; // only treat as a split when the points are close in time

function splitAdjust(sorted: SortedPoint[]): SortedPoint[] {
  if (sorted.length < 2) return sorted;
  const out: SortedPoint[] = [{ dt: sorted[0].dt, nav: sorted[0].nav }];
  let factor = 1;
  for (let i = 1; i < sorted.length; i++) {
    const newer = sorted[i - 1];
    const older = sorted[i];
    const gap = newer.dt.getTime() - older.dt.getTime();
    const ratio = newer.nav / older.nav; // ratio of the *original* adjacent NAVs
    if (gap <= JUMP_MAX_GAP_MS && (ratio >= SPLIT_FACTOR || ratio <= 1 / SPLIT_FACTOR)) {
      factor *= ratio; // fold the break into the running factor
    }
    out.push({ dt: older.dt, nav: older.nav * factor });
  }
  return out;
}

/** NAV closest to a target timestamp, or null if the nearest point is beyond tolerance. */
function closestNav(sorted: SortedPoint[], targetMs: number, toleranceMs: number): number | null {
  let best: SortedPoint | null = null;
  let bestDiff = Infinity;
  for (const p of sorted) {
    const diff = Math.abs(p.dt.getTime() - targetMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = p;
    }
  }
  return best && bestDiff <= toleranceMs ? best.nav : null;
}

// Tolerances for the sub-year horizons. Tighter than the yearly tolerance because a
// month-scale window can't absorb a 45-day gap without distorting the return.
const M1_TOLERANCE_MS = 12 * DAY_MS;
const M6_TOLERANCE_MS = 30 * DAY_MS;

/** Absolute (point-to-point) return % from `months` ago to the latest NAV. */
function absoluteReturnMonths(
  sorted: SortedPoint[],
  latest: SortedPoint,
  months: number,
  toleranceMs: number,
): number | null {
  const target = new Date(latest.dt);
  target.setUTCMonth(target.getUTCMonth() - months);
  const startNav = closestNav(sorted, target.getTime(), toleranceMs);
  if (startNav == null || !(startNav > 0)) return null;
  return (latest.nav / startNav - 1) * 100;
}

/**
 * Compute latest NAV, 1-day change, 1M/6M absolute returns, CAGR over 1/3/5/10y and a
 * 30-point sparkline. Each horizon uses the NAV closest to the target date, but only if
 * that point is within tolerance — so gaps in the history yield null instead of a bogus
 * figure computed against a stale NAV. Sub-year windows (1M, 6M) report simple
 * point-to-point returns; annualising them would exaggerate short-run moves.
 */
export function computeReturns(points: NavPoint[]): ComputedReturns {
  const sorted = splitAdjust(normalise(points));
  const empty: ComputedReturns = {
    latestNav: null,
    latestDate: null,
    today: null,
    m1: null,
    m6: null,
    cagr: { y1: null, y3: null, y5: null, y10: null },
    spark: [],
    dataPoints: sorted.length,
  };
  if (sorted.length === 0) return empty;

  const latest = sorted[0];
  const prev = sorted[1];
  const latestNav = latest.nav;
  const today = prev ? (latestNav / prev.nav - 1) * 100 : null;
  const m1 = absoluteReturnMonths(sorted, latest, 1, M1_TOLERANCE_MS);
  const m6 = absoluteReturnMonths(sorted, latest, 6, M6_TOLERANCE_MS);

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
    m1,
    m6,
    cagr: cagrOut,
    spark,
    dataPoints: sorted.length,
  };
}

/**
 * The full NAV series, split-adjusted and ordered oldest → newest, for charting.
 * Uses the same back-adjustment as computeReturns so a split/re-denomination renders as a
 * continuous line (the latest NAV is unchanged; older NAVs are rebased onto today's scale)
 * instead of a misleading vertical cliff. Dates are ISO (yyyy-mm-dd).
 */
export function splitAdjustedSeries(points: NavPoint[]): { date: string; nav: number }[] {
  const adjusted = splitAdjust(normalise(points)); // newest-first
  const out: { date: string; nav: number }[] = [];
  for (let i = adjusted.length - 1; i >= 0; i--) {
    out.push({ date: toIsoDate(adjusted[i].dt), nav: adjusted[i].nav });
  }
  return out;
}
