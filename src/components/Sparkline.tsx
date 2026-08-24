/** Tiny inline SVG sparkline. Green if trend up over the window, red if down. */
export function Sparkline({
  points,
  width = 90,
  height = 28,
}: {
  points: number[];
  width?: number;
  height?: number;
}) {
  if (!points || points.length < 2) return <span className="text-faint">—</span>;
  const pad = 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = (width - pad * 2) / (points.length - 1);
  const coords = points
    .map(
      (v, i) =>
        `${(pad + i * step).toFixed(1)},${(height - pad - ((v - min) / range) * (height - pad * 2)).toFixed(1)}`,
    )
    .join(" ");
  const up = points[points.length - 1] >= points[0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline
        points={coords}
        fill="none"
        stroke={up ? "#16a34a" : "#dc2626"}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
