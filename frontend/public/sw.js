self.addEventListener('push', function (event) {
  const data = event.data.json();
  console.log('[Service Worker] Push recibido:', data);

  const title = data.title || 'Nueva actualización';
  const options = {
    body: data.body || 'Tienes un nuevo cambio en la app.',
    icon: '/icon-192x192.png', // puedes personalizar tu icono
    badge: '/badge-72x72.png'  // también puedes personalizar el badge
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
