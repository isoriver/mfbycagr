/** Shared display formatting helpers. */

export function fmtPct(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

export function fmtNav(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  return `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Format an AUM figure given in ₹ crore, e.g. 96040 -> "₹96,040 Cr", 12.3 -> "₹12 Cr". */
export function fmtAum(cr: number | null | undefined): string {
  if (cr == null || Number.isNaN(cr)) return "—";
  return `₹${Math.round(cr).toLocaleString("en-IN")} Cr`;
}

/** Format a plain percentage to 2dp without a sign, e.g. an expense ratio 0.43 -> "0.43%". */
export function fmtPlainPct(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "—";
  return `${v.toFixed(2)}%`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const AVATAR_COLORS = [
  "#f7941e", "#0b5fc4", "#16a34a", "#dc2626",
  "#7c3aed", "#0891b2", "#ca8a04", "#db2777",
];

export function avatarColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function avatarInitials(house: string): string {
  return house.slice(0, 2).toUpperCase();
}
