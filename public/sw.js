// Service Worker for Push Notifications
const CACHE_NAME = 'elite-barbershop-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let data = {
    title: 'Nouvelle Réservation!',
    body: 'Un client vient de faire une réservation.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'booking-notification',
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: '/admin/dashboard'
    }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      requireInteraction: data.requireInteraction,
      vibrate: data.vibrate,
      data: data.data,
      actions: [
        { action: 'view', title: 'Voir' },
        { action: 'close', title: 'Fermer' }
      ]
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/admin/dashboard';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre est déjà ouverte, la focus
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Fetch event (pour le cache offline basique)
self.addEventListener('fetch', (event) => {
  // Pour l'instant, on laisse passer toutes les requêtes
  // On peut ajouter du caching plus tard si nécessaire
});
