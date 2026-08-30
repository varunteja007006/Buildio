const DONUT_SEGMENTS = [
  { pct: 0.3, color: "var(--chart-1)" },
  { pct: 0.2, color: "var(--chart-2)" },
  { pct: 0.35, color: "var(--chart-3)" },
  { pct: 0.15, color: "var(--chart-4)" },
];

export function Donut() {
  const r = 54;
  const c = 2 * Math.PI * r;
  const gap = 5;

  let offset = 0;

  return (
    <div className="relative size-40 shrink-0">
      <svg viewBox="0 0 112 112" className="size-full -rotate-90">
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          strokeWidth="12"
          className="stroke-white/10"
        />
        {DONUT_SEGMENTS.map((seg) => {
          const len = seg.pct * c;
          const dash = Math.max(len - gap, 1);
          const el = (
            <circle
              key={seg.color}
              cx="56"
              cy="56"
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeLinecap="butt"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold tracking-tight text-white">
          32%
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/70">
          saved
        </span>
      </div>
    </div>
  );
}
