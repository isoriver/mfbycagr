/** Full-width SVG line chart for a NAV series. Server-renderable, no dependency. */
export function NavChart({
  points,
  width = 720,
  height = 240,
  label = "NAV history",
}: {
  points: { date: string; nav: number }[];
  width?: number;
  height?: number;
  label?: string;
}) {
  const clean = points.filter((p) => Number.isFinite(p.nav));
  if (clean.length < 2) {
    return <p className="text-[13px] text-dim">Not enough NAV history to chart.</p>;
  }
  const navs = clean.map((p) => p.nav);
  const min = Math.min(...navs);
  const max = Math.max(...navs);
  const range = max - min || 1;
  const padX = 8;
  const padY = 12;
  const step = (width - padX * 2) / (clean.length - 1);
  const y = (v: number) => height - padY - ((v - min) / range) * (height - padY * 2);
  const line = clean.map((p, i) => `${(padX + i * step).toFixed(1)},${y(p.nav).toFixed(1)}`).join(" ");
  const area = `${padX},${height - padY} ${line} ${(padX + (clean.length - 1) * step).toFixed(1)},${height - padY}`;
  const up = navs[navs.length - 1] >= navs[0];
  const stroke = up ? "#16a34a" : "#dc2626";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={label}
      preserveAspectRatio="none"
    >
      <polygon points={area} fill={stroke} opacity={0.08} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
