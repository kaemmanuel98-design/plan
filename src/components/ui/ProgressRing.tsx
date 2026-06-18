import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number;
  color?: string;
  size?: number;
  stroke?: number;
  label?: string;
}

export function ProgressRing({
  progress,
  color = 'var(--aw-accent)',
  size = 88,
  stroke = 5,
  label,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--aw-line)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl tabular-nums leading-none">{progress}%</span>
        {label && <span className="text-[9px] text-aw-faint mt-0.5 tracking-wide">{label}</span>}
      </div>
    </div>
  );
}
