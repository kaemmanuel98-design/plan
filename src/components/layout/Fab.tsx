import { useStore } from '../../store/useStore';
import { IconAdd } from '../brand/AppIcons';

export function Fab() {
  const openWizard = useStore((s) => s.openWizard);

  return (
    <button className="fab" onClick={openWizard} aria-label="Nouvelle vision">
      <IconAdd />
    </button>
  );
}
