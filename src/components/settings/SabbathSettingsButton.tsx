import { useState } from 'react';
import { Moon } from 'lucide-react';
import { isDuringShabbat } from '../../lib/sabbath';
import { SabbathSettingsModal } from './SabbathSettingsModal';

import { useSabbathStore } from '../../store/useSabbathStore';

export function SabbathSettingsButton() {
  const [open, setOpen] = useState(false);
  const sunsetTime = useSabbathStore((s) => s.sunsetTime);
  const shabbatActive = isDuringShabbat(undefined, sunsetTime);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Réglages sabbat et coucher du soleil"
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          shabbatActive ? 'text-aw-accent bg-aw-warm' : 'text-aw-faint hover:text-aw-black'
        }`}
      >
        <Moon className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>
      <SabbathSettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
