import { fmtPct } from "@/lib/format";

export function ReturnPill({ value }: { value: number | null | undefined }) {
  if (value == null || Number.isNaN(value)) {
    return <span className="text-faint tabular-nums">—</span>;
  }
  const up = value >= 0;
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[12.5px] font-semibold tabular-nums ${
        up ? "bg-up-bg text-up" : "bg-down-bg text-down"
      }`}
    >
      {fmtPct(value)}
    </span>
  );
}
