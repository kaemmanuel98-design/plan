import type { Goal } from '../../types';
import { getPillar } from '../../data/pillars';
import { ProgressRing } from '../ui/ProgressRing';
import { VisionBoard } from '../vision/VisionBoard';
import { PlanningCascade } from './PlanningCascade';
import { calculateProgress } from '../../lib/progress';

interface VisionHeroProps {
  vision: Goal;
  allGoals: Goal[];
}

export function VisionHero({ vision, allGoals }: VisionHeroProps) {
  const pillar = getPillar(vision.pillarId);
  const progress = calculateProgress(allGoals, vision.id);
  const Icon = pillar.icon;

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
          <p className="text-[11px] text-aw-faint mt-2 tabular-nums">{progress}% · 2 ans</p>
        </div>

        <ProgressRing progress={progress} color={pillar.color} size={72} stroke={4} />
      </div>

      <PlanningCascade vision={vision} allGoals={allGoals} />
    </article>
  );
}
