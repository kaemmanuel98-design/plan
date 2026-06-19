import { ChevronDown, Clock, Plus, Repeat, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Goal } from '../../types';
import { useStore } from '../../store/useStore';
import { getPeriodContext, getTodayTasks, getTomorrowPreview, getWeekDayStatuses } from '../../lib/currentFocus';
import { formatFocusDate } from '../../lib/focusDay';
import { getShabbatMessage } from '../../lib/sabbath';
import { isRecurring, recurrenceShort } from '../../lib/recurrence';
import { getPillar } from '../../data/pillars';
import { formatCountdown } from '../../lib/trajectory';
import { FadeIn } from '../ui/SectionHeader';
import { ProgressRing } from '../ui/ProgressRing';
import { GoalNode } from './GoalTree';

interface TodayFocusProps {
  vision: Goal;
  allGoals: Goal[];
}

export function TodayFocus({ vision, allGoals }: TodayFocusProps) {
  const toggleGoal = useStore((s) => s.toggleGoal);
  const [planOpen, setPlanOpen] = useState(false);

  const ctx = useMemo(() => getPeriodContext(vision, allGoals), [vision, allGoals]);
  const tasks = useMemo(() => getTodayTasks(allGoals, [vision.id]), [allGoals, vision.id]);
  const tomorrow = useMemo(() => getTomorrowPreview(vision.id, allGoals), [vision.id, allGoals]);
  const weekDays = useMemo(() => getWeekDayStatuses(vision.id, allGoals), [vision.id, allGoals]);
  const date = formatFocusDate();
  const pillar = getPillar(vision.pillarId);

  return (
    <div className="space-y-6">
      {/* Vision — une ligne */}
      <FadeIn delay={0.02}>
        <div className="flex items-center gap-4 aw-card-inner !p-4">
          <ProgressRing progress={ctx.visionProgress} color={pillar.color} size={52} stroke={3} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-aw-faint uppercase tracking-wider mb-0.5">Vision 2 ans</p>
            <h2 className="text-sm font-medium leading-snug line-clamp-2">{vision.title}</h2>
            <p className="text-[10px] text-aw-faint mt-1 tabular-nums">{formatCountdown(vision.createdAt)}</p>
          </div>
        </div>
      </FadeIn>

      {/* Mois + semaine — contexte minimal */}
      {(ctx.monthly || ctx.weekly) && (
        <FadeIn delay={0.04}>
          <div className="space-y-2">
            {ctx.monthly && (
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--aw-warm)' }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[10px] text-aw-faint uppercase tracking-wider">Ce mois</p>
                  <span className="text-[10px] text-aw-faint tabular-nums">{ctx.monthProgress}%</span>
                </div>
                <p className="text-[13px] font-medium leading-snug">{ctx.monthly.title}</p>
              </div>
            )}
            {ctx.weekly && (
              <div className="rounded-xl px-4 py-3 border border-aw-line">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[10px] text-aw-faint uppercase tracking-wider">Cette semaine</p>
                  <span className="text-[10px] text-aw-faint tabular-nums">{ctx.weekProgress}%</span>
                </div>
                <p className="text-[13px] font-medium leading-snug">{ctx.weekly.title}</p>
                {weekDays.length > 0 && (
                  <div className="flex gap-1 mt-3">
                    {weekDays.map(({ day, done, isToday }) => (
                      <span
                        key={day}
                        className={`flex-1 text-center text-[9px] py-1 rounded-md tabular-nums ${
                          isToday
                            ? 'bg-aw-primary text-aw-primary-fg font-semibold'
                            : done
                              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                              : 'bg-aw-warm text-aw-faint'
                        }`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {/* Aujourd'hui — focus principal */}
      <FadeIn delay={0.06}>
        <section>
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-[11px] text-aw-faint tracking-[0.2em] uppercase mb-1">Aujourd&apos;hui</p>
              <h3 className="aw-display text-2xl capitalize leading-none">{date.weekday}</h3>
              <p className="text-[11px] text-aw-faint mt-1 capitalize">
                {date.day} {date.month}
              </p>
            </div>
            {tasks.total > 0 && !tasks.shabbat && (
              <ProgressRing progress={tasks.progress} size={48} stroke={3} />
            )}
          </div>

          {tasks.shabbat ? (
            <div className="aw-card-inner !py-12 text-center px-6">
              <p className="aw-display text-xl">Shabbat shalom</p>
              <p className="text-sm text-aw-muted mt-3 leading-relaxed">{getShabbatMessage()}</p>
            </div>
          ) : tasks.total === 0 ? (
            <div className="aw-card-inner !py-12 text-center px-6">
              <p className="text-sm text-aw-muted leading-relaxed">
                Aucune tâche pour aujourd&apos;hui. Générez ou recalculez le plan depuis la vision.
              </p>
            </div>
          ) : tasks.complete ? (
            <div className="aw-card-inner !py-10 text-center px-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="aw-display text-xl">Journée terminée</p>
              <p className="text-sm text-aw-muted leading-relaxed">
                Vous avez avancé vers votre objectif du mois. Revenez demain pour la suite.
              </p>
              {tomorrow?.title && (
                <p className="text-[11px] text-aw-faint pt-2 border-t border-aw-line">
                  Demain ({tomorrow.dayLabel}) : {tomorrow.title}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.daily.map((task) => (
                <label
                  key={task.id}
                  className={`focus-task ${task.completed ? 'focus-task--done' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleGoal(task.id)}
                    className="checkbox-custom shrink-0"
                  />
                  <span className="flex-1 text-[15px] font-medium leading-snug">{task.title}</span>
                  {isRecurring(task) && task.recurrence && (
                    <span className="focus-recurrence">
                      <Repeat className="w-3 h-3" />
                      {recurrenceShort(task.recurrence)}
                    </span>
                  )}
                </label>
              ))}

              {tasks.timeBlocks.length > 0 && (
                <>
                  {tasks.daily.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 pb-1">
                      <Clock className="w-3.5 h-3.5 text-aw-faint" strokeWidth={1.5} />
                      <span className="text-[10px] text-aw-faint uppercase tracking-wider">Créneaux</span>
                    </div>
                  )}
                  {tasks.timeBlocks.map((block) => (
                    <label
                      key={block.id}
                      className={`focus-block ${block.completed ? 'focus-block--done' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={block.completed}
                        onChange={() => toggleGoal(block.id)}
                        className="checkbox-custom shrink-0"
                      />
                      <span className="focus-block-time tabular-nums">
                        {block.startTime}
                        <span className="text-aw-faint mx-1">—</span>
                        {block.endTime}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate">{block.title}</span>
                    </label>
                  ))}
                </>
              )}

              {tasks.total > 0 && (
                <p className="text-[10px] text-aw-faint text-center pt-2 tabular-nums">
                  {tasks.done}/{tasks.total} complété{tasks.done > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </section>
      </FadeIn>

      {/* Plan complet — replié par défaut */}
      <FadeIn delay={0.08}>
        <button
          type="button"
          onClick={() => setPlanOpen(!planOpen)}
          className="w-full flex items-center justify-between text-[10px] text-aw-faint uppercase tracking-wider py-2"
        >
          <span>Plan détaillé (avancé)</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${planOpen ? 'rotate-180' : ''}`} />
        </button>
        {planOpen && (
          <div className="pt-2 pb-4">
            <GoalNode goal={vision} allGoals={allGoals} compact />
          </div>
        )}
      </FadeIn>
    </div>
  );
}

interface CompactEmptyProps {
  onCreate: () => void;
}

export function CompactEmpty({ onCreate }: CompactEmptyProps) {
  return (
    <button type="button" onClick={onCreate} className="aw-empty-state w-full group">
      <span className="w-14 h-14 rounded-full border border-aw-line flex items-center justify-center mb-5 group-active:scale-95 transition-transform">
        <Plus className="w-6 h-6 text-aw-faint" strokeWidth={1.5} />
      </span>
      <span className="aw-display text-xl">Première vision</span>
      <span className="text-[11px] text-aw-faint mt-2">Définissez votre objectif sur 2 ans</span>
    </button>
  );
}
