import type { Goal } from '../../types';
import { getPillar } from '../../data/pillars';
import { ProgressRing } from '../ui/ProgressRing';
import { VisionBoard } from '../vision/VisionBoard';
import { PlanningCascade } from './PlanningCascade';
import { VisionPlanActions } from '../vision/VisionPlanActions';
import { calculateProgress } from '../../lib/progress';
import { formatCountdown } from '../../lib/trajectory';
import { useScheduleStore } from '../../store/useScheduleStore';
import { Clock, AlertCircle } from 'lucide-react';

interface VisionHeroProps {
  vision: Goal;
  allGoals: Goal[];
}

export function VisionHero({ vision, allGoals }: VisionHeroProps) {
  const pillar = getPillar(vision.pillarId);
  const progress = calculateProgress(allGoals, vision.id);
  const Icon = pillar.icon;
  const countdown = formatCountdown(vision.createdAt);
  const isBehind = useScheduleStore((s) => s.isBehind(vision.id));
  const markBehind = useScheduleStore((s) => s.markBehind);

  return (
    <article className="aw-hero-card overflow-hidden">
      <VisionBoard vision={vision} editable />

      <div
        className="aw-hero-glow"
        style={{ background: `radial-gradient(circle at 80% 20%, ${pillar.color}18, transparent 55%)` }}
      />

      <div className="relative p-6 flex gap-5 items-start">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${pillar.color}14`, color: pillar.color }}
        >
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <h2 className="aw-display text-[1.5rem] leading-tight line-clamp-2">{vision.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <p className="text-[11px] text-aw-faint tabular-nums flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {countdown}
            </p>
            <span className="text-aw-line">·</span>
            <p className="text-[11px] text-aw-faint tabular-nums">{progress}% · 2 ans</p>
            {isBehind && (
              <span className="text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" />
                En retard
              </span>
            )}
          </div>
        </div>

        <ProgressRing progress={progress} color={pillar.color} size={72} stroke={4} />
      </div>

      <div className="px-6 pb-2">
        <button
          type="button"
          className={`text-[10px] underline-offset-2 ${isBehind ? 'text-aw-accent' : 'text-aw-faint hover:text-aw-muted'}`}
          onClick={() => markBehind(vision.id, !isBehind)}
        >
          {isBehind ? 'Repasser sur la bonne trajectoire' : 'Marquer en retard'}
        </button>
      </div>

      <VisionPlanActions vision={vision} allGoals={allGoals} />

      <PlanningCascade vision={vision} allGoals={allGoals} />
    </article>
  );
}
