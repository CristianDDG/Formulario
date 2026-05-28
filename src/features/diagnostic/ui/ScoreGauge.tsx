import { describeArc, polarPoint } from "@/lib/gauge";

const NAVY_DARK = "#061a36";
const GREEN = "#22c55e";
const YELLOW = "#facc15";
const RED = "#ef4444";

export function ScoreGauge({ porcentaje }: { porcentaje: number }) {
  const cx = 124;
  const cy = 118;
  const r = 86;
  const value = Math.max(0, Math.min(100, porcentaje));
  const needle = polarPoint(cx, cy, r - 12, (value / 100) * 180);
  const ticks = [0, 25, 50, 75, 100];

  return (
    <svg
      viewBox="0 0 248 152"
      className="h-[160px] w-full max-w-[300px]"
      role="img"
      aria-label={`Puntuación total ${porcentaje}%`}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="centerBoxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#f8f9fa", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      <path
        d={describeArc(cx, cy, r, 0, 124.2)}
        stroke={RED}
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={describeArc(cx, cy, r, 124.2, 151.2)}
        stroke={YELLOW}
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={describeArc(cx, cy, r, 151.2, 180)}
        stroke={GREEN}
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />

      {ticks.map((tick) => {
        const angle = (tick / 100) * 180;
        const outer = polarPoint(cx, cy, r + 15, angle);
        const labelDistance = tick === 50 ? r + 30 : r + 38;
        const label = polarPoint(cx, cy, labelDistance, angle);

        return (
          <g key={tick}>
            <circle cx={outer.x} cy={outer.y} r="3.2" fill="#ffffff" opacity="0.95" />
            <text
              x={label.x}
              y={label.y + 3}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white text-[12px] font-bold"
              style={{ paintOrder: "stroke", stroke: NAVY_DARK, strokeWidth: 0.5 }}
            >
              {tick}%
            </text>
          </g>
        );
      })}

      <line
        x1={cx}
        y1={cy}
        x2={needle.x}
        y2={needle.y}
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      <circle cx={cx} cy={cy} r="11" fill={NAVY_DARK} stroke="#ffffff" strokeWidth="4" />

      <rect
        x="73"
        y="94"
        width="94"
        height="54"
        rx="14"
        fill="url(#centerBoxGradient)"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
      />
      <text x={cx} y="132" textAnchor="middle" className="fill-[#082247] text-[42px] font-black">
        {porcentaje}%
      </text>
    </svg>
  );
}
