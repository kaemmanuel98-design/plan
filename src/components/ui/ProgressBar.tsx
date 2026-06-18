import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  color?: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  color = 'var(--aw-accent)',
  size = 'md',
  showLabel = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  const height = size === 'sm' ? 'h-px' : 'h-0.5';

  return (
    <div className="flex items-center gap-3 w-full">
      <div className={`flex-1 ${height} bg-aw-line rounded-full overflow-hidden`}>
        <motion.div
          className={`${height} rounded-full`}
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] text-aw-faint tabular-nums w-8 text-right">{clamped}%</span>
      )}
    </div>
  );
}
