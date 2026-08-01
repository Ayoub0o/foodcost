/**
 * Original branded infographic (inline SVG, server-rendered) of target food cost
 * % by restaurant type. Uses Bringer accent tokens. Accessible via <title>/<desc>
 * carrying the keyword. Pairs with ImageObjectSchema in ToolPageLayout.
 */
export interface BenchmarkRow {
  type: string;
  /** midpoint percentage used for the bar length */
  pct: number;
  /** human-readable range shown as the label, e.g. "28–32%" */
  range: string;
}

export function BenchmarkInfographic({
  rows,
  title,
  id = "benchmark-infographic",
}: {
  rows: BenchmarkRow[];
  title: string;
  id?: string;
}) {
  const barHeight = 28;
  const gap = 16;
  const top = 48;
  const width = 720;
  const leftLabel = 200;
  const chartWidth = width - leftLabel - 80;
  const maxPct = Math.max(50, ...rows.map((r) => r.pct));
  const height = top + rows.length * (barHeight + gap);

  return (
    <svg
      id={id}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby={`${id}-title`}
    >
      <title id={`${id}-title`}>{title}</title>
      <desc>{title}</desc>
      <text x="0" y="24" fill="#F5F7FA" fontSize="18" fontWeight="600" fontFamily="Inter, sans-serif">
        {title}
      </text>
      {rows.map((r, i) => {
        const y = top + i * (barHeight + gap);
        const w = Math.max(2, (r.pct / maxPct) * chartWidth);
        return (
          <g key={r.type}>
            <text
              x="0"
              y={y + barHeight * 0.7}
              fill="#C5C7CE"
              fontSize="14"
              fontFamily="Inter, sans-serif"
            >
              {r.type}
            </text>
            <rect x={leftLabel} y={y} width={w} height={barHeight} rx="6" fill="#3F6EE9" />
            <text
              x={leftLabel + w + 10}
              y={y + barHeight * 0.7}
              fill="#F5F7FA"
              fontSize="13"
              fontWeight="600"
              fontFamily="Inter, sans-serif"
            >
              {r.range}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
