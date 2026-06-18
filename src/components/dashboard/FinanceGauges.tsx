import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Goal, PillarId } from '../../types';
import { getPillar } from '../../data/pillars';
import { getFinanceGauges, getFinanceGlobalProgress } from '../../lib/financeGauges';
import { ProgressRing } from '../ui/ProgressRing';

interface FinanceGaugesProps {
  goals: Goal[];
  pillarId?: PillarId;
}

export function FinanceGauges({ goals, pillarId = 'financier' }: FinanceGaugesProps) {
  const pillar = getPillar(pillarId);
  const gauges = useMemo(() => getFinanceGauges(goals, pillarId), [goals, pillarId]);
  const globalProgress = useMemo(
    () => getFinanceGlobalProgress(goals, pillarId),
    [goals, pillarId]
  );

  if (gauges.length === 0) return null;

  return (
    <article className="aw-card-inner !p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${pillar.color}14`, color: pillar.color }}
          >
            <pillar.icon className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-medium">{pillar.label}</h3>
            <p className="text-[11px] text-aw-faint">Jauges de progression</p>
          </div>
        </div>
        <ProgressRing progress={globalProgress} color={pillar.color} size={52} stroke={3} />
      </div>

      <div className="space-y-4">
        {gauges.map((item, i) => (
          <div key={item.id}>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-[12px] font-medium truncate flex-1">{item.title}</p>
              <span className="text-[10px] text-aw-faint tabular-nums shrink-0">
                {item.progress}%
              </span>
            </div>
            <div className="finance-gauge-track">
              <motion.div
                className="finance-gauge-fill"
                style={{ backgroundColor: pillar.color }}
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
                transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="text-[9px] text-aw-faint mt-1 uppercase tracking-wide">{item.level}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
