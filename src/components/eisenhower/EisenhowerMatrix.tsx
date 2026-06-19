import { Clock } from 'lucide-react';
import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useRootVisions, useSpaceGoals } from '../../hooks/useSpaceGoals';
import {
  classifyTodayTasks,
  countQuadrantTasks,
  getPillarColorForTask,
  getQuadrantMeta,
  groupByQuadrant,
  type EisenhowerQuadrant,
} from '../../lib/eisenhower';
import { getPeriodContext, getTodayTasks } from '../../lib/currentFocus';
import { formatFocusDate } from '../../lib/focusDay';
import { getShabbatMessage, isDuringShabbat } from '../../lib/sabbath';
import { FadeIn } from '../ui/SectionHeader';
import { ProgressRing } from '../ui/ProgressRing';

const ORDER: EisenhowerQuadrant[] = ['do', 'schedule', 'delegate', 'eliminate'];

export function EisenhowerMatrix() {
  const goals = useSpaceGoals(useStore((s) => s.currentSpace));
  const rootVisions = useRootVisions(useStore((s) => s.currentSpace));
  const toggleGoal = useStore((s) => s.toggleGoal);

  const featuredVision = rootVisions[0];
  const visionIds = useMemo(() => rootVisions.map((v) => v.id), [rootVisions]);
  const date = formatFocusDate();

  const ctx = useMemo(
    () => (featuredVision ? getPeriodContext(featuredVision, goals) : null),
    [featuredVision, goals]
  );

  const today = useMemo(
    () => getTodayTasks(goals, visionIds),
    [goals, visionIds]
  );

  const groups = useMemo(() => {
    const classified = classifyTodayTasks(goals, visionIds, featuredVision?.id);
    return groupByQuadrant(classified);
  }, [goals, visionIds, featuredVision?.id]);

  const total = countQuadrantTasks(groups);
  const shabbat = isDuringShabbat();

  return (
    <div className="mobile-container pt-4 pb-6 space-y-5">
      <FadeIn>
        <p className="text-[11px] text-aw-faint tracking-[0.2em] uppercase mb-1">Priorités</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="aw-display text-[1.75rem] capitalize leading-tight">{date.weekday}</h1>
            <p className="text-[11px] text-aw-faint mt-1 capitalize">
              {date.day} {date.month}
            </p>
          </div>
          {today.total > 0 && !shabbat && (
            <ProgressRing progress={today.progress} size={48} stroke={3} />
          )}
        </div>
        <p className="text-[10px] text-aw-faint mt-3 leading-relaxed">
          Tri des tâches du jour selon urgence et lien avec votre objectif du mois.
        </p>
      </FadeIn>

      {ctx && (ctx.monthly || ctx.weekly) && (
        <FadeIn delay={0.03}>
          <div className="space-y-2">
            {ctx.monthly && (
              <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: 'var(--aw-warm)' }}>
                <p className="text-[9px] text-aw-faint uppercase tracking-wider">Mois</p>
                <p className="text-[12px] font-medium leading-snug line-clamp-2">{ctx.monthly.title}</p>
              </div>
            )}
            {ctx.weekly && (
              <div className="rounded-xl px-3 py-2.5 border border-aw-line">
                <p className="text-[9px] text-aw-faint uppercase tracking-wider">Semaine</p>
                <p className="text-[12px] font-medium leading-snug line-clamp-2">{ctx.weekly.title}</p>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {shabbat ? (
        <div className="aw-card-inner !py-14 text-center px-6">
          <p className="aw-display text-lg">Shabbat shalom</p>
          <p className="text-sm text-aw-muted mt-3 leading-relaxed">{getShabbatMessage()}</p>
        </div>
      ) : total === 0 ? (
        <div className="aw-card-inner !py-14 text-center px-6">
          <p className="text-sm text-aw-muted">Aucune tâche pour aujourd&apos;hui.</p>
          <p className="text-[10px] text-aw-faint mt-2 leading-relaxed">
            Générez ou recalculez le plan depuis l&apos;accueil pour alimenter la matrice.
          </p>
        </div>
      ) : (
        <div className="eisenhower-grid">
          {ORDER.map((quadrant, qi) => {
            const meta = getQuadrantMeta(quadrant);
            const items = groups[quadrant];
            if (items.length === 0) return null;

            return (
              <FadeIn key={quadrant} delay={0.04 * qi}>
                <section
                  className="eisenhower-quadrant"
                  style={{
                    borderColor: `color-mix(in srgb, ${meta.color} 35%, var(--aw-line))`,
                  }}
                >
                  <header className="eisenhower-quadrant-header">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold">{meta.label}</p>
                      <p className="text-[9px] text-aw-faint">{meta.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-aw-faint tabular-nums">{items.length}</span>
                  </header>
                  <p className="text-[9px] text-aw-faint mb-2 leading-relaxed">{meta.hint}</p>
                  <ul className="eisenhower-task-list">
                    {items.map(({ goal, context }) => (
                      <li key={goal.id}>
                        <label className="eisenhower-task">
                          <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={() => toggleGoal(goal.id)}
                            className="checkbox-custom !w-[18px] !h-[18px] shrink-0"
                          />
                          <span
                            className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: getPillarColorForTask(goal) }}
                          />
                          <span className="min-w-0 flex-1">
                            <span
                              className={`text-[12px] font-medium block leading-snug ${
                                goal.completed ? 'line-through text-aw-faint' : ''
                              }`}
                            >
                              {goal.title}
                            </span>
                            {context && (
                              <span className="text-[9px] text-aw-faint flex items-center gap-1 mt-0.5">
                                {goal.level === 'time_block' && (
                                  <Clock className="w-2.5 h-2.5 shrink-0" />
                                )}
                                {context}
                              </span>
                            )}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              </FadeIn>
            );
          })}
        </div>
      )}

      {total > 0 && !shabbat && (
        <FadeIn delay={0.1}>
          <p className="text-[10px] text-aw-faint text-center tabular-nums">
            {today.done}/{today.total} tâches du jour complétées
          </p>
        </FadeIn>
      )}
    </div>
  );
}
