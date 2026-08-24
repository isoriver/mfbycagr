/**
 * A fund needs a recent NAV before it can appear in rankings or search results.
 * A two-week window covers weekends, holidays and delayed reporting while keeping
 * discontinued schemes from being presented as current performers.
 */
export const MAX_NAV_AGE_DAYS = 14;

const DAY_MS = 86_400_000;

export function hasRecentNav(navDate: string | null, now = new Date()): boolean {
  if (!navDate || !/^\d{4}-\d{2}-\d{2}$/.test(navDate)) return false;
  const parsed = new Date(`${navDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== navDate) return false;

  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const age = today - parsed.getTime();
  return age >= -DAY_MS && age <= MAX_NAV_AGE_DAYS * DAY_MS;
}
