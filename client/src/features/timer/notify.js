// Browser notifications for when a session ends while you're in another tab.

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Ask for permission. Resolves to 'granted', 'denied', 'default' or 'unsupported'. */
export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported';
  if (Notification.permission === 'default') {
    return Notification.requestPermission();
  }
  return Notification.permission;
}

/**
 * Show a notification, but only when the user isn't looking at Pomelle.
 * If the tab is visible and focused, the sound and on-screen celebration
 * are enough.
 */
export function sendNotification(title, body) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  const userIsHere = document.visibilityState === 'visible' && document.hasFocus();
  if (userIsHere) return;
  try {
    // `tag` replaces an older Pomelle notification instead of stacking them.
    new Notification(title, { body, tag: 'pomelle-timer' });
  } catch {
    // Some mobile browsers only allow notifications from a service worker.
  }
}
