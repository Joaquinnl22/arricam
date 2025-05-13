async function notifyUser(title, body) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  registration.showNotification(title, {
    body,
    icon: '/arricam.png',
  });
}
