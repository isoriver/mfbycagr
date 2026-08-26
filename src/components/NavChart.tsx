"use client";

import { useState, useRef, useCallback } from "react";
import { parseNavDate } from "@/lib/returns";

/** Parse a NAV point date. Handles MFapi "dd-mm-yyyy" and returns null for fallback ("pt-N") labels. */
function toDate(d: string): Date | null {
  const parsed = parseNavDate(d);
  if (parsed) return parsed;
  const native = new Date(d);
  return Number.isNaN(native.getTime()) ? null : native;
}

const RANGES: { label: string; months: number | null }[] = [
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
  { label: "3Y", months: 36 },
  { label: "5Y", months: 60 },
  { label: "Max", months: null },
];

/** Full-width SVG line chart for a NAV series with axes, a range selector and hover tooltip. */
export function NavChart({
  points,
  width = 720,
  height = 280,
  label = "NAV history",
}: {
  points: { date: string; nav: number }[];
  width?: number;
  height?: number;
  label?: string;
}) {
  const [rangeMonths, setRangeMonths] = useState<number | null>(null); // null = Max

  const all = points.filter((p) => Number.isFinite(p.nav));
  if (all.length < 2) {
    return <p className="text-[13px] text-dim">Not enough NAV history to chart.</p>;
  }

  // Restrict to the selected trailing window (measured back from the latest date).
  // Fall back to the full series if a range leaves too few points to draw.
  const latestDate = all.reduce<Date | null>((acc, p) => {
    const d = toDate(p.date);
    return d && (!acc || d > acc) ? d : acc;
  }, null);
  let clean = all;
  if (rangeMonths != null && latestDate) {
    const cutoff = new Date(latestDate);
    cutoff.setUTCMonth(cutoff.getUTCMonth() - rangeMonths);
    const windowed = all.filter((p) => {
      const d = toDate(p.date);
      return d ? d.getTime() >= cutoff.getTime() : false;
    });
    if (windowed.length >= 2) clean = windowed;
  }

  const navs = clean.map((p) => p.nav);
  const min = Math.min(...navs);
  const max = Math.max(...navs);
  const range = max - min || 1;

  // Chart area padding
  const padLeft = 60;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 40;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const step = chartW / (clean.length - 1);
  const xPos = (i: number) => padLeft + i * step;
  const yPos = (v: number) => padTop + chartH - ((v - min) / range) * chartH;

  const line = clean.map((p, i) => `${xPos(i).toFixed(1)},${yPos(p.nav).toFixed(1)}`).join(" ");
  const area = `${xPos(0).toFixed(1)},${(padTop + chartH).toFixed(1)} ${line} ${xPos(clean.length - 1).toFixed(1)},${(padTop + chartH).toFixed(1)}`;
  const up = navs[navs.length - 1] >= navs[0];
  const stroke = up ? "#137a37" : "#c81e1e";

  // Y-axis ticks (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = min + (range * i) / 4;
    return { val, y: yPos(val) };
  });

  // X-axis labels (pick ~5 evenly spaced dates)
  const xLabelCount = Math.min(5, clean.length);
  const xLabels = Array.from({ length: xLabelCount }, (_, i) => {
    const idx = Math.round((i * (clean.length - 1)) / (xLabelCount - 1));
    return { idx, x: xPos(idx), date: clean[idx].date };
  });

  // Format date for axis
  const fmtAxisDate = (d: string) => {
    const dt = toDate(d);
    if (!dt) return "";
    return dt.toLocaleDateString("en-IN", { month: "short", year: "2-digit", timeZone: "UTC" });
  };

  // Format NAV for axis
  const fmtAxisNav = (v: number) => {
    if (v >= 1000) return v.toFixed(0);
    if (v >= 100) return v.toFixed(1);
    return v.toFixed(2);
  };

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {RANGES.map((r) => {
          const active = rangeMonths === r.months;
          return (
            <button
              key={r.label}
              type="button"
              onClick={() => setRangeMonths(r.months)}
              aria-pressed={active}
              className={`rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                active
                  ? "bg-ink text-white"
                  : "border border-border text-dim hover:border-accent hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
      <NavChartInteractive
        clean={clean}
        width={width}
        height={height}
        label={label}
        padLeft={padLeft}
        padTop={padTop}
        chartW={chartW}
        chartH={chartH}
        xPos={xPos}
        yPos={yPos}
        line={line}
        area={area}
        stroke={stroke}
        yTicks={yTicks}
        xLabels={xLabels}
        fmtAxisDate={fmtAxisDate}
        fmtAxisNav={fmtAxisNav}
      />
    </div>
  );
}

function NavChartInteractive({
  clean,
  width,
  height,
  label,
  padLeft,
  padTop,
  chartW,
  chartH,
  xPos,
  yPos,
  line,
  area,
  stroke,
  yTicks,
  xLabels,
  fmtAxisDate,
  fmtAxisNav,
}: {
  clean: { date: string; nav: number }[];
  width: number;
  height: number;
  label: string;
  padLeft: number;
  padTop: number;
  chartW: number;
  chartH: number;
  xPos: (i: number) => number;
  yPos: (v: number) => number;
  line: string;
  area: string;
  stroke: string;
  yTicks: { val: number; y: number }[];
  xLabels: { idx: number; x: number; date: string }[];
  fmtAxisDate: (d: string) => string;
  fmtAxisNav: (v: number) => string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * width;
      // Find nearest point
      const relX = mouseX - padLeft;
      if (relX < 0 || relX > chartW) {
        setHoverIdx(null);
        return;
      }
      const idx = Math.round((relX / chartW) * (clean.length - 1));
      const clampedIdx = Math.max(0, Math.min(clean.length - 1, idx));
      setHoverIdx(clampedIdx);
    },
    [width, padLeft, chartW, clean.length],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverIdx(null);
  }, []);

  const hoverPoint = hoverIdx !== null ? clean[hoverIdx] : null;
  const hoverX = hoverIdx !== null ? xPos(hoverIdx) : 0;
  const hoverY = hoverIdx !== null ? yPos(clean[hoverIdx].nav) : 0;

  const fmtTooltipDate = (d: string) => {
    const dt = toDate(d);
    if (!dt) return "";
    return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: "crosshair" }}
    >
      {/* Y-axis grid lines and labels */}
      {yTicks.map((tick) => (
        <g key={tick.val}>
          <line
            x1={padLeft}
            y1={tick.y}
            x2={padLeft + chartW}
            y2={tick.y}
            stroke="#e5e7eb"
            strokeWidth={0.5}
            strokeDasharray="4,3"
          />
          <text
            x={padLeft - 8}
            y={tick.y + 4}
            textAnchor="end"
            className="fill-gray-500"
            fontSize={10}
          >
            {fmtAxisNav(tick.val)}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {xLabels.map((xl) => (
        <text
          key={xl.idx}
          x={xl.x}
          y={height - 8}
          textAnchor="middle"
          className="fill-gray-500"
          fontSize={10}
        >
          {fmtAxisDate(xl.date)}
        </text>
      ))}

      {/* Area fill */}
      <polygon points={area} fill={stroke} opacity={0.08} />

      {/* Line */}
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Hover elements */}
      {hoverPoint && hoverIdx !== null && (
        <>
          {/* Vertical guide line */}
          <line
            x1={hoverX}
            y1={padTop}
            x2={hoverX}
            y2={padTop + chartH}
            stroke="#6b7280"
            strokeWidth={0.8}
            strokeDasharray="3,2"
          />
          {/* Dot on the line */}
          <circle cx={hoverX} cy={hoverY} r={4} fill={stroke} stroke="#fff" strokeWidth={2} />
          {/* Tooltip background */}
          <rect
            x={Math.min(hoverX + 10, width - 150)}
            y={Math.max(hoverY - 38, padTop)}
            width={135}
            height={36}
            rx={4}
            fill="#1f2937"
            opacity={0.92}
          />
          {/* Tooltip date */}
          <text
            x={Math.min(hoverX + 18, width - 142)}
            y={Math.max(hoverY - 22, padTop + 14)}
            fontSize={10}
            fill="#d1d5db"
          >
            {fmtTooltipDate(hoverPoint.date)}
          </text>
          {/* Tooltip NAV */}
          <text
            x={Math.min(hoverX + 18, width - 142)}
            y={Math.max(hoverY - 8, padTop + 28)}
            fontSize={12}
            fontWeight="bold"
            fill="#fff"
          >
            NAV: {fmtAxisNav(hoverPoint.nav)}
          </text>
        </>
      )}
    </svg>
  );
}
