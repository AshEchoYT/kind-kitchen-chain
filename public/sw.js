// Service Worker for handling push notifications
self.addEventListener('push', event => {
  if (!event.data) return;

  try {
    const options = event.data.json();
    const title = options.title || 'FoodShare Notification';
    
    const notificationOptions = {
      body: options.body,
      icon: options.icon || '/placeholder.svg',
      badge: '/placeholder.svg',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      actions: options.actions || [],
      silent: false,
    };

    event.waitUntil(
      self.registration.showNotification(title, notificationOptions)
    );
  } catch (error) {
    console.error('Error handling push notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('FoodShare', {
        body: 'You have a new notification',
        icon: '/placeholder.svg',
        badge: '/placeholder.svg',
      })
    );
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  let clickAction = 'default';
  if (event.action) {
    clickAction = event.action;
  }

  const notificationData = event.notification.data || {};

  event.waitUntil(
    clients.matchAll().then(clientsArr => {
      // Check if the app is already open
      const hadWindowToFocus = clientsArr.some(windowClient => {
        if (windowClient.url === self.location.origin) {
          windowClient.focus();
          return true;
        }
        return false;
      });

      // Handle different actions
      switch (clickAction) {
        case 'accept':
          // Handle task acceptance
          if (notificationData.taskId) {
            return clients.openWindow(`/agent/tasks/${notificationData.taskId}?action=accept`);
          }
          break;
          
        case 'view':
          // View task details
          if (notificationData.taskId) {
            return clients.openWindow(`/agent/tasks/${notificationData.taskId}`);
          }
          break;
          
        case 'update_status':
          // Quick status update
          if (notificationData.taskId) {
            return clients.openWindow(`/agent/tasks/${notificationData.taskId}?action=update`);
          }
          break;
          
        case 'call_contact':
          // Initiate call (would need to pass phone number in data)
          if (notificationData.phone) {
            return clients.openWindow(`tel:${notificationData.phone}`);
          }
          break;
          
        case 'navigate':
          // Open navigation
          if (notificationData.coordinates) {
            const { lat, lng } = notificationData.coordinates;
            return clients.openWindow(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
          }
          break;
          
        case 'dismiss':
          // Just close the notification
          return Promise.resolve();
          
        default:
          // Default action - open the app
          if (notificationData.url) {
            return clients.openWindow(notificationData.url);
          } else if (!hadWindowToFocus) {
            return clients.openWindow('/');
          }
      }
    })
  );
});

self.addEventListener('notificationclose', event => {
  // Track notification dismissal if needed
  console.log('Notification was closed:', event.notification.tag);
});

// Handle background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'task-status-update') {
    event.waitUntil(syncTaskStatusUpdates());
  }
});

async function syncTaskStatusUpdates() {
  try {
    // In production, sync pending status updates from IndexedDB
    console.log('Syncing task status updates...');
    
    // This would typically:
    // 1. Get pending updates from IndexedDB
    // 2. Send them to the server
    // 3. Clear them from local storage on success
  } catch (error) {
    console.error('Failed to sync task status updates:', error);
  }
}

// Cache management for offline functionality
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('foodshare-v1').then(cache => {
      return cache.addAll([
        '/',
        '/agent/dashboard',
        '/hotel/dashboard',
        '/placeholder.svg',
        // Add other critical resources
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  // Only handle same-origin requests for the app
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});