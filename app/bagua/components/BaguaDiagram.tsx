'use client';

/**
 * SVG Bagua (Eight Trigrams) diagram.
 * Uses CSS variables from globals.css: --accent-primary (#D4A853), --accent-secondary (#7C3AED).
 * Purely presentational — no business logic.
 */

const BAGUA_POSITIONS = [
  { name: '乾', symbol: '☰', angle: 0, element: '金' },     // top
  { name: '兑', symbol: '☱', angle: 45, element: '金' },    // top-right
  { name: '离', symbol: '☲', angle: 90, element: '火' },    // right
  { name: '震', symbol: '☳', angle: 135, element: '木' },   // bottom-right
  { name: '巽', symbol: '☴', angle: 180, element: '木' },   // bottom
  { name: '坎', symbol: '☵', angle: 225, element: '水' },   // bottom-left
  { name: '艮', symbol: '☶', angle: 270, element: '土' },   // left
  { name: '坤', symbol: '☷', angle: 315, element: '土' },   // top-left
];

const TRIGRAM_LINES: Record<string, number[]> = {
  '乾': [6, 6, 6],
  '兑': [5, 6, 6],
  '离': [6, 5, 6],
  '震': [5, 5, 6],
  '巽': [6, 6, 5],
  '坎': [5, 6, 5],
  '艮': [6, 5, 5],
  '坤': [5, 5, 5],
};

function TrigramLinesSVG({ trigram }: { trigram: string }) {
  const lines = TRIGRAM_LINES[trigram] || [6, 6, 6];
  const w = 60;
  const lineH = 4;
  const gap = 6;
  const totalH = lines.length * lineH + (lines.length - 1) * gap;
  const startY = -totalH / 2;

  return (
    <svg width={w} height={totalH} viewBox={`0 0 ${w} ${totalH}`}>
      {lines.map((line, i) => {
        const y = startY + i * (lineH + gap) + lineH / 2;
        if (line === 6) {
          return <rect key={i} x={4} y={y - lineH / 2} width={w - 8} height={lineH} rx={1} fill="var(--accent-primary)" />;
        } else {
          return (
            <g key={i}>
              <rect x={4} y={y - lineH / 2} width={(w - 24) / 2} height={lineH} rx={1} fill="var(--accent-primary)" />
              <rect x={(w + 8) / 2} y={y - lineH / 2} width={(w - 24) / 2} height={lineH} rx={1} fill="var(--accent-primary)" />
            </g>
          );
        }
      })}
    </svg>
  );
}

export default function BaguaDiagram({ size = 320 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.42;
  const innerR = size * 0.28;
  const ringR = size * 0.14;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(212,168,83,0.2)" strokeWidth={1} />

      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(212,168,83,0.15)" strokeWidth={1} />

      {/* Taiji center */}
      <circle cx={cx} cy={cy} r={ringR} fill="rgba(21,17,33,0.8)" stroke="rgba(212,168,83,0.3)" strokeWidth={1.5} />
      {/* Taiji swirl */}
      <path d={`M ${cx} ${cy - ringR} A ${ringR} ${ringR} 0 0 1 ${cx} ${cy + ringR} A ${ringR / 2} ${ringR / 2} 0 0 0 ${cx} ${cy} A ${ringR / 2} ${ringR / 2} 0 0 1 ${cx} ${cy - ringR}`} fill="rgba(124,58,237,0.3)" />

      {/* Trigram positions */}
      {BAGUA_POSITIONS.map((bg, i) => {
        const rad = (bg.angle - 90) * (Math.PI / 180);
        const x = cx + outerR * Math.cos(rad);
        const y = cy + outerR * Math.sin(rad);
        const lineRad = bg.angle * (Math.PI / 180);

        return (
          <g key={bg.name} transform={`translate(${x}, ${y}) rotate(${bg.angle})`}>
            <g transform="translate(-30, -12)">
              <TrigramLinesSVG trigram={bg.name} />
            </g>
            <text
              y={30}
              textAnchor="middle"
              fill="var(--accent-primary)"
              fontSize={14}
              fontWeight={600}
              fontFamily="var(--font-heading), Playfair Display, serif"
            >
              {bg.symbol} {bg.name}
            </text>
            <text
              y={46}
              textAnchor="middle"
              fill="var(--glow-light)"
              opacity={0.7}
              fontSize={10}
              fontFamily="var(--font-body), Inter, sans-serif"
            >
              {bg.element}
            </text>
            <line
              x1={-15 * Math.cos(lineRad)}
              y1={-15 * Math.sin(lineRad)}
              x2={-30 * Math.cos(lineRad)}
              y2={-30 * Math.sin(lineRad)}
              stroke="rgba(212,168,83,0.12)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
          </g>
        );
      })}

      {/* Direction labels */}
      {['南', '西南', '西', '西北', '北', '东北', '东', '东南'].map((dir, i) => {
        const angle = [90, 135, 180, 225, 270, 315, 0, 45][i];
        const rad = (angle - 90) * (Math.PI / 180);
        const r = outerR + 36;
        return (
          <text
            key={dir}
            x={cx + r * Math.cos(rad)}
            y={cy + r * Math.sin(rad)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--text-tertiary)"
            opacity={0.6}
            fontSize={9}
            fontFamily="var(--font-body), Inter, sans-serif"
          >
            {dir}
          </text>
        );
      })}
    </svg>
  );
}
