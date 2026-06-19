import { Check, Clock, Repeat } from 'lucide-react';
import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useRootVisions, useSpaceGoals } from '../../hooks/useSpaceGoals';
import { formatFocusDate, getFocusItems } from '../../lib/focusDay';
import { getPeriodContext, getTomorrowPreview, getWeekDayStatuses } from '../../lib/currentFocus';
import { getShabbatMessage } from '../../lib/sabbath';
import { isRecurring, recurrenceShort } from '../../lib/recurrence';
import { FadeIn } from '../ui/SectionHeader';
import { ProgressRing } from '../ui/ProgressRing';

export function FocusDay() {
  const currentSpace = useStore((s) => s.currentSpace);
  const goals = useSpaceGoals(currentSpace);
  const rootVisions = useRootVisions(currentSpace);
  const toggleGoal = useStore((s) => s.toggleGoal);
  const { daily, timeBlocks, progress, total, done, shabbat } = getFocusItems(goals);
  const date = formatFocusDate();

  const vision = rootVisions[0];
  const ctx = useMemo(
    () => (vision ? getPeriodContext(vision, goals) : null),
    [vision, goals]
  );
  const tomorrow = useMemo(
    () => (vision ? getTomorrowPreview(vision.id, goals) : null),
    [vision, goals]
  );
  const weekDays = useMemo(
    () => (vision ? getWeekDayStatuses(vision.id, goals) : []),
    [vision, goals]
  );

  const dayComplete = total > 0 && done === total;

  return (
    <div className="mobile-container pt-4 pb-6 space-y-6">
      {ctx && (ctx.monthly || ctx.weekly) && (
        <FadeIn>
          <div className="space-y-2">
            {ctx.monthly && (
              <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--aw-warm)' }}>
                <p className="text-[10px] text-aw-faint uppercase tracking-wider mb-1">Ce mois</p>
                <p className="text-[13px] font-medium leading-snug line-clamp-2">{ctx.monthly.title}</p>
              </div>
            )}
            {ctx.weekly && (
              <div className="rounded-xl px-4 py-3 border border-aw-line">
                <p className="text-[10px] text-aw-faint uppercase tracking-wider mb-1">Cette semaine</p>
                <p className="text-[13px] font-medium leading-snug line-clamp-2">{ctx.weekly.title}</p>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.03}>
        <p className="text-[11px] text-aw-faint tracking-[0.2em] uppercase mb-2">Focus</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="aw-display text-[2.5rem] capitalize leading-none">{date.weekday}</h1>
            <p className="text-sm text-aw-muted mt-1 capitalize">
              {date.day} {date.month}
            </p>
          </div>
          {total > 0 && !shabbat && <ProgressRing progress={progress} size={56} stroke={3} />}
        </div>
        {shabbat ? (
          <p
            className="text-[12px] text-aw-muted mt-4 leading-relaxed rounded-xl px-3 py-2.5"
            style={{ backgroundColor: 'var(--aw-warm)' }}
          >
            {getShabbatMessage()}
          </p>
        ) : (
          total > 0 && (
            <p className="text-[11px] text-aw-faint mt-3 tabular-nums">
              {done}/{total} complété{done > 1 ? 's' : ''}
            </p>
          )
        )}
      </FadeIn>

      {shabbat ? (
        <div className="aw-card-inner !py-16 flex flex-col items-center text-center px-6">
          <p className="aw-display text-xl">Shabbat shalom</p>
          <p className="text-sm text-aw-muted mt-3 leading-relaxed">{getShabbatMessage()}</p>
        </div>
      ) : total === 0 ? (
        <div className="aw-card-inner !py-16 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border border-aw-line flex items-center justify-center mb-4">
            <Check className="w-4 h-4 text-aw-faint" strokeWidth={1.5} />
          </div>
          <p className="aw-display text-lg">Rien pour aujourd&apos;hui</p>
        </div>
      ) : dayComplete ? (
        <div className="aw-card-inner !py-12 text-center px-6 space-y-3">
          <p className="aw-display text-xl">Journée terminée</p>
          {tomorrow?.title && (
            <p className="text-[11px] text-aw-faint">
              Demain ({tomorrow.dayLabel}) : {tomorrow.title}
            </p>
          )}
          {weekDays.length > 0 && (
            <div className="flex gap-1 pt-3">
              {weekDays.map(({ day, done: d, isToday }) => (
                <span
                  key={day}
                  className={`flex-1 text-center text-[9px] py-1 rounded-md ${
                    isToday
                      ? 'bg-aw-primary text-aw-primary-fg font-semibold'
                      : d
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
      ) : (
        <>
          {daily.length > 0 && (
            <section className="space-y-2">
              {daily.map((task, i) => (
                <FadeIn key={task.id} delay={0.03 * i}>
                  <label className={`focus-task ${task.completed ? 'focus-task--done' : ''}`}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleGoal(task.id)}
                      className="checkbox-custom shrink-0"
                    />
                    <span className="flex-1 text-[15px] font-medium leading-snug">{task.title}</span>
                    {isRecurring(task) && task.recurrence && (
                      <span className="focus-recurrence" title="Récurrent">
                        <Repeat className="w-3 h-3" />
                        {recurrenceShort(task.recurrence)}
                      </span>
                    )}
                  </label>
                </FadeIn>
              ))}
            </section>
          )}

          {timeBlocks.length > 0 && (
            <section>
              {daily.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-aw-faint" strokeWidth={1.5} />
                  <span className="text-[11px] text-aw-faint tracking-[0.15em] uppercase">Créneaux</span>
                </div>
              )}
              <div className="space-y-2">
                {timeBlocks.map((block, i) => (
                  <FadeIn key={block.id} delay={0.04 * i}>
                    <label className={`focus-block ${block.completed ? 'focus-block--done' : ''}`}>
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
                  </FadeIn>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
