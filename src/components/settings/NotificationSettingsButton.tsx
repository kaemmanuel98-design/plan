import { Bell, BellOff, BellRing } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
  registerServiceWorker,
} from '../../lib/pushNotifications';
import { useToastStore } from '../../store/useToastStore';

export function NotificationSettingsButton() {
  const showToast = useToastStore((s) => s.show);
  const [permission, setPermission] = useState(getNotificationPermission());
  const supported = isNotificationSupported();

  useEffect(() => {
    void registerServiceWorker();
  }, []);

  const handleClick = useCallback(async () => {
    if (!supported) {
      showToast('Notifications non supportées sur ce navigateur.', 'err');
      return;
    }

    if (permission === 'granted') {
      showToast(
        'Notifications actives. Installez E&M sur l\'écran d\'accueil pour les recevoir sur téléphone.',
        'ok'
      );
      return;
    }

    if (permission === 'denied') {
      showToast('Autorisez les notifications dans les réglages du navigateur / téléphone.', 'err');
      return;
    }

    const result = await requestNotificationPermission();
    setPermission(result === 'unsupported' ? permission : result);

    if (result === 'granted') {
      await registerServiceWorker();
      showToast('Notifications activées — vous serez alerté pour vos actions du moment.', 'ok');
    } else {
      showToast('Permission refusée.', 'err');
    }
  }, [permission, showToast, supported]);

  if (!supported) return null;

  const Icon = permission === 'granted' ? BellRing : permission === 'denied' ? BellOff : Bell;
  const label =
    permission === 'granted'
      ? 'Notifications actives'
      : permission === 'denied'
        ? 'Notifications bloquées'
        : 'Activer les notifications';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
        permission === 'granted'
          ? 'text-aw-accent bg-aw-accent/10'
          : 'text-aw-faint hover:text-aw-black'
      }`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
    </button>
  );
}
