/** Enregistrement SW + notifications système (Android / iOS PWA installée). */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch {
    return null;
  }
}

export async function showPhoneNotification(
  title: string,
  body: string,
  tag: string
): Promise<void> {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  const options: NotificationOptions = {
    body,
    tag,
    icon: '/icon-192.svg',
    badge: '/favicon.svg',
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return;
    }
    new Notification(title, options);
  } catch {
    try {
      new Notification(title, options);
    } catch {
      /* ignore */
    }
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function isNotificationSupported(): boolean {
  return typeof Notification !== 'undefined';
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}
