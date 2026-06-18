import { useThemeStore } from '../../store/useThemeStore';
import type { ThemeMode } from '../../types/premium';
import { IconThemeAuto, IconThemeMoon, IconThemeSun } from '../brand/AppIcons';

const MODE_META: Record<ThemeMode, { label: string; Icon: typeof IconThemeSun }> = {
  light: { label: 'Clair', Icon: IconThemeSun },
  dark: { label: 'Sombre', Icon: IconThemeMoon },
  auto: { label: 'Auto', Icon: IconThemeAuto },
};

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const cycleMode = useThemeStore((s) => s.cycleMode);
  const { Icon, label } = MODE_META[mode];

  return (
    <button
      type="button"
      onClick={cycleMode}
      className="btn-ghost !min-w-[36px] !min-h-[36px] !rounded-full relative"
      aria-label={`Thème : ${label}`}
      title={label}
    >
      <Icon />
      {mode === 'auto' && (
        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-aw-accent" />
      )}
    </button>
  );
}
