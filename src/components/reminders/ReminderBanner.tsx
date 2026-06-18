import { X, Bell, Clock, Sun, AlertTriangle } from 'lucide-react';
import { useReminderStore } from '../../store/useReminderStore';
import type { ReminderKind } from '../../lib/reminders';

const ICONS: Record<ReminderKind, typeof Bell> = {
  time_block: Clock,
  morning_brief: Sun,
  period_end: AlertTriangle,
  trajectory: Bell,
};

export function ReminderBanner() {
  const active = useReminderStore((s) => s.active);
  const dismiss = useReminderStore((s) => s.dismiss);

  if (active.length === 0) return null;

  const top = active.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.urgency] - order[b.urgency];
  })[0];

  const Icon = ICONS[top.kind];

  return (
    <div
      className={`reminder-banner reminder-banner--${top.urgency}`}
      role="status"
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold truncate">{top.title}</p>
        <p className="text-[10px] opacity-90 line-clamp-2 leading-relaxed">{top.body}</p>
      </div>
      <button
        type="button"
        className="reminder-dismiss"
        onClick={() => dismiss(top.id)}
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
