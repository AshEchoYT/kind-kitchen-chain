import { supabase } from '@/integrations/supabase/client';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  timestamp?: number;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;

  private constructor() {
    this.checkSupport();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private checkSupport(): void {
    this.isSupported = 
      'serviceWorker' in navigator && 
      'PushManager' in window && 
      'Notification' in window;
  }

  public async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      console.log('Push notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize push notification service:', error);
      return false;
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  public async subscribeToServerPush(userId: string): Promise<PushSubscription | null> {
    if (!this.registration || Notification.permission !== 'granted') {
      return null;
    }

    try {
      // Generate VAPID keys in production
      const applicationServerKey = this.urlBase64ToUint8Array(
        'BEl62iUYgUivxIkv69yViEuiBIa40HI0DLLk__a1U9a8dEn0SuIzFe1tqQa8b2Mv9O3JBzME_DxYu6mczr3wNEY'
      );

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      });

      // Store subscription in Supabase
      await this.storePushSubscription(userId, subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  private async storePushSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      const subscriptionData = {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.getKey('p256dh') ? 
          btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null,
        auth: subscription.getKey('auth') ? 
          btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null,
        created_at: new Date().toISOString()
      };

      // In production, you'd have a push_subscriptions table
      // For now, store in localStorage as fallback
      localStorage.setItem(`push_subscription_${userId}`, JSON.stringify(subscriptionData));

      console.log('Push subscription stored successfully');
    } catch (error) {
      console.error('Failed to store push subscription:', error);
    }
  }

  public async sendLocalNotification(payload: PushNotificationPayload): Promise<void> {
    if (Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/placeholder.svg',
        badge: payload.badge || '/placeholder.svg',
        tag: payload.tag,
        data: payload.data,
        requireInteraction: payload.requireInteraction || false,
        silent: false,
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
        
        notification.close();
      };

      // Auto close after 8 seconds unless it requires interaction
      if (!payload.requireInteraction) {
        setTimeout(() => notification.close(), 8000);
      }

    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  public async sendTaskNotification(task: any, type: 'new' | 'update' | 'urgent'): Promise<void> {
    const baseData = { 
      taskId: task.id,
      url: `/agent/tasks/${task.id}` 
    };

    switch (type) {
      case 'new':
        await this.sendLocalNotification({
          title: '🔔 New Food Available!',
          body: `${task.food_name} - ${task.quantity} servings at ${task.restaurant_name}`,
          tag: `task-${task.id}`,
          data: baseData,
          actions: [
            { action: 'accept', title: '✅ Accept Task' },
            { action: 'view', title: '👀 View Details' }
          ]
        });
        break;

      case 'urgent':
        await this.sendLocalNotification({
          title: '🚨 URGENT: Food Expiring Soon!',
          body: `${task.food_name} expires in ${this.getTimeUntilExpiry(task.expiry_time)}!`,
          tag: `task-${task.id}`,
          data: baseData,
          requireInteraction: true,
          actions: [
            { action: 'accept', title: '⚡ Accept Now' },
            { action: 'dismiss', title: '❌ Dismiss' }
          ]
        });
        break;

      case 'update':
        const statusMessage = this.getStatusMessage(task.status);
        await this.sendLocalNotification({
          title: '📱 Task Update',
          body: `${task.food_name}: ${statusMessage}`,
          tag: `task-${task.id}`,
          data: baseData,
          actions: [
            { action: 'view', title: '👀 View Task' }
          ]
        });
        break;
    }
  }

  public async sendLocationNotification(type: 'arrived' | 'nearby', location: string): Promise<void> {
    const notifications = {
      arrived: {
        title: '📍 Arrived at Location',
        body: `You've arrived at ${location}. Don't forget to update the task status!`,
        actions: [
          { action: 'update_status', title: '✅ Update Status' },
          { action: 'call_contact', title: '📞 Call Contact' }
        ]
      },
      nearby: {
        title: '🚗 Approaching Destination',
        body: `You're within 200m of ${location}`,
        actions: [
          { action: 'navigate', title: '🗺️ Get Directions' }
        ]
      }
    };

    const notification = notifications[type];
    await this.sendLocalNotification({
      ...notification,
      tag: `location-${type}`,
      data: { location }
    });
  }

  public async sendDeliveryNotification(
    recipientType: 'hotel' | 'agent',
    task: any,
    status: string
  ): Promise<void> {
    const isHotel = recipientType === 'hotel';
    const statusMessages = {
      assigned: isHotel ? 
        '👤 An agent has accepted your food donation' : 
        '📦 You have been assigned a new pickup task',
      picked: isHotel ? 
        '📦 Your food has been picked up by the agent' : 
        '✅ Pickup confirmed - head to delivery location',
      delivered: isHotel ? 
        '🎉 Your food has been successfully delivered!' : 
        '🎉 Delivery completed successfully!',
      cancelled: isHotel ? 
        '❌ The food pickup has been cancelled' : 
        '❌ Task has been cancelled'
    };

    await this.sendLocalNotification({
      title: isHotel ? 'Food Donation Update' : 'Task Update',
      body: `${task.food_name}: ${statusMessages[status as keyof typeof statusMessages]}`,
      tag: `delivery-${task.id}`,
      data: { 
        taskId: task.id,
        url: isHotel ? `/hotel/dashboard` : `/agent/tasks/${task.id}`
      }
    });
  }

  public async scheduleExpiryReminder(task: any): Promise<void> {
    if (!task.expiry_time) return;

    const expiryTime = new Date(task.expiry_time);
    const now = new Date();
    const hoursUntilExpiry = (expiryTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Schedule reminder 2 hours before expiry
    if (hoursUntilExpiry > 2) {
      const reminderTime = expiryTime.getTime() - (2 * 60 * 60 * 1000);
      const delay = reminderTime - now.getTime();

      if (delay > 0) {
        setTimeout(() => {
          this.sendTaskNotification(task, 'urgent');
        }, delay);
      }
    }
  }

  private getTimeUntilExpiry(expiryTime: string): string {
    const expiry = new Date(expiryTime);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  private getStatusMessage(status: string): string {
    const messages = {
      assigned: 'Assigned to agent',
      picked: 'Picked up from restaurant',
      delivered: 'Successfully delivered',
      cancelled: 'Task cancelled'
    };
    return messages[status as keyof typeof messages] || 'Status updated';
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  public getNotificationHistory(): PushNotificationPayload[] {
    try {
      const history = localStorage.getItem('notification_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  public clearNotificationHistory(): void {
    localStorage.removeItem('notification_history');
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();