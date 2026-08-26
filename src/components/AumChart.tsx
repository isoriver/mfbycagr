import { fmtAum } from "@/lib/format";

/**
 * Small quarterly AUM bar chart. Server-rendered SVG, no client JS. Only meaningful with
 * two or more quarters; the fund page gates on that. History accumulates over time as
 * build-extras.ts appends each quarter, so early on this simply won't render.
 */
export function AumChart({ points }: { points: { quarter: string; aum: number }[] }) {
  if (points.length < 2) return null;

  const width = 320;
  const height = 120;
  const padX = 8;
  const padTop = 8;
  const padBottom = 22;
  const max = Math.max(...points.map((p) => p.aum));
  const barGap = 6;
  const barW = (width - padX * 2) / points.length - barGap;
  const scaleY = (v: number) => (max > 0 ? (v / max) * (height - padTop - padBottom) : 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full max-w-sm"
      role="img"
      aria-label={`Quarterly average AUM trend: ${points
        .map((p) => `${p.quarter} ${fmtAum(p.aum)}`)
        .join(", ")}`}
    >
      {points.map((p, i) => {
        const x = padX + i * (barW + barGap);
        const barH = scaleY(p.aum);
        const y = height - padBottom - barH;
        // Show a short quarter label (first word + year) to keep the axis readable.
        const short = p.quarter.replace(/\s*-\s*/g, "–").split(" ")[0].slice(0, 3);
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={2} fill="#137a37" opacity={0.85} />
            <text
              x={x + barW / 2}
              y={height - padBottom + 12}
              textAnchor="middle"
              fontSize={8}
              className="fill-faint"
            >
              {short}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
