import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  newTasks: boolean;
  statusUpdates: boolean;
  proximityAlerts: boolean;
  urgentTasks: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface NotificationSystemProps {
  userRole: 'hotel' | 'agent' | 'admin';
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ userRole }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newTasks: true,
    statusUpdates: true,
    proximityAlerts: true,
    urgentTasks: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);

  useEffect(() => {
    checkNotificationPermission();
    loadUserPreferences();
    setupRealtimeNotifications();

    return () => {
      if (realtimeSubscription) {
        supabase.removeChannel(realtimeSubscription);
      }
    };
  }, [user]);

  const checkNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive",
      });
      return;
    }

    setNotificationPermission(Notification.permission);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "🔔 Notifications Enabled",
          description: "You'll now receive real-time notifications for important updates.",
        });
        
        // Show welcome notification
        showNotification({
          title: "FoodShare Notifications",
          body: "You're all set! You'll receive updates about your food rescue activities.",
          icon: "/placeholder.svg"
        });
      } else {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings for the best experience.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const loadUserPreferences = async () => {
    // In production, load from user profile or settings table
    const saved = localStorage.getItem(`notification_prefs_${user?.id}`);
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  };

  const saveUserPreferences = async (newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem(`notification_prefs_${user?.id}`, JSON.stringify(newPreferences));
    
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const setupRealtimeNotifications = () => {
    if (!user) return;

    let channel;

    if (userRole === 'agent') {
      // Agent notifications: new tasks, status updates
      channel = supabase
        .channel('agent_notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'food_reports' 
          }, 
          (payload) => {
            if (preferences.newTasks) {
              handleNewTaskNotification(payload.new);
            }
          }
        )
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'food_reports',
            filter: `assigned_agent_id=eq.${user.id}`
          }, 
          (payload) => {
            if (preferences.statusUpdates) {
              handleStatusUpdateNotification(payload.new, payload.old);
            }
          }
        )
        .subscribe();
    } else if (userRole === 'hotel') {
      // Hotel notifications: task assignments, status updates
      channel = supabase
        .channel('hotel_notifications')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'food_reports' 
          }, 
          (payload) => {
            if (preferences.statusUpdates) {
              handleHotelStatusUpdate(payload.new, payload.old);
            }
          }
        )
        .subscribe();
    }

    setRealtimeSubscription(channel);
  };

  const handleNewTaskNotification = (task: any) => {
    const urgency = getTaskUrgency(task);
    
    if (urgency === 'urgent' && !preferences.urgentTasks) return;
    if (urgency !== 'urgent' && !preferences.newTasks) return;

    const isUrgent = urgency === 'urgent';
    
    showNotification({
      title: isUrgent ? "🚨 URGENT: New Food Available!" : "🔔 New Food Available!",
      body: `${task.food_name} - ${task.quantity} servings${isUrgent ? ' (Expires soon!)' : ''}`,
      icon: "/placeholder.svg",
      tag: `task-${task.id}`,
      requireInteraction: isUrgent,
    });

    if (preferences.soundEnabled) {
      playNotificationSound(isUrgent ? 'urgent' : 'normal');
    }

    if (preferences.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(isUrgent ? [200, 100, 200, 100, 200] : [200]);
    }
  };

  const handleStatusUpdateNotification = (newTask: any, oldTask: any) => {
    if (newTask.status === oldTask.status) return;

    const statusMessages = {
      'assigned': 'Task has been assigned to an agent',
      'picked': 'Food has been picked up from the restaurant',
      'delivered': '✅ Food has been successfully delivered!',
      'cancelled': '❌ Task has been cancelled',
    };

    const message = statusMessages[newTask.status as keyof typeof statusMessages];
    if (!message) return;

    showNotification({
      title: "Status Update",
      body: `${newTask.food_name}: ${message}`,
      icon: "/placeholder.svg",
      tag: `status-${newTask.id}`,
    });

    if (preferences.soundEnabled) {
      playNotificationSound('update');
    }
  };

  const handleHotelStatusUpdate = (newTask: any, oldTask: any) => {
    // Similar to agent status updates but for hotel perspective
    if (newTask.status === oldTask.status) return;

    const statusMessages = {
      'assigned': '👤 An agent has accepted your food donation',
      'picked': '📦 Your food has been picked up by the agent',
      'delivered': '🎉 Your food has been successfully delivered to those in need!',
      'cancelled': '❌ The food pickup has been cancelled',
    };

    const message = statusMessages[newTask.status as keyof typeof statusMessages];
    if (!message) return;

    showNotification({
      title: "Food Donation Update",
      body: `${newTask.food_name}: ${message}`,
      icon: "/placeholder.svg",
      tag: `hotel-${newTask.id}`,
    });
  };

  const getTaskUrgency = (task: any): 'urgent' | 'normal' => {
    if (!task.expiry_time) return 'normal';
    
    const now = new Date();
    const expiry = new Date(task.expiry_time);
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilExpiry <= 2 ? 'urgent' : 'normal';
  };

  const showNotification = (options: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
  }) => {
    if (notificationPermission !== 'granted') return;

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/placeholder.svg',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        badge: '/placeholder.svg',
      });

      // Auto close after 5 seconds unless it requires interaction
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const playNotificationSound = (type: 'urgent' | 'normal' | 'update') => {
    if (!preferences.soundEnabled) return;

    try {
      const audio = new Audio();
      
      switch (type) {
        case 'urgent':
          // High-pitched urgent sound
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARQAAAEAAAAABAAAAAGQAYQB0AGEAAAAA';
          audio.play();
          setTimeout(() => audio.play(), 300);
          setTimeout(() => audio.play(), 600);
          break;
        case 'normal':
          // Pleasant notification sound
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARQAAAEAAAAABAAAAAGQAYQB0AGEAAAAA';
          audio.play();
          break;
        case 'update':
          // Subtle update sound
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARQAAAEAAAAABAAAAAGQAYQB0AGEAAAAA';
          audio.play();
          break;
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    saveUserPreferences(newPreferences);
  };

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Alert className={notificationPermission === 'granted' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <div className="flex items-center gap-2">
          {notificationPermission === 'granted' ? 
            <CheckCircle className="h-4 w-4 text-green-600" /> : 
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          }
          <AlertDescription className="flex items-center justify-between w-full">
            <span>
              {notificationPermission === 'granted' 
                ? "Push notifications are enabled" 
                : "Enable notifications for real-time updates"
              }
            </span>
            {notificationPermission !== 'granted' && (
              <Button size="sm" onClick={requestNotificationPermission}>
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            )}
          </AlertDescription>
        </div>
      </Alert>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agent-specific preferences */}
          {userRole === 'agent' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">New Food Available</Label>
                  <div className="text-sm text-muted-foreground">
                    Get notified when new food rescue tasks are posted in your area
                  </div>
                </div>
                <Switch
                  checked={preferences.newTasks}
                  onCheckedChange={(checked) => updatePreference('newTasks', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Urgent Tasks Only</Label>
                  <div className="text-sm text-muted-foreground">
                    Only notify me about urgent tasks that expire within 2 hours
                  </div>
                </div>
                <Switch
                  checked={preferences.urgentTasks}
                  onCheckedChange={(checked) => updatePreference('urgentTasks', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Proximity Alerts</Label>
                  <div className="text-sm text-muted-foreground">
                    Get notified when you're near pickup or delivery locations
                  </div>
                </div>
                <Switch
                  checked={preferences.proximityAlerts}
                  onCheckedChange={(checked) => updatePreference('proximityAlerts', checked)}
                />
              </div>
            </div>
          )}

          {/* Hotel-specific preferences */}
          {userRole === 'hotel' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Task Assignments</Label>
                  <div className="text-sm text-muted-foreground">
                    Get notified when an agent accepts your food donations
                  </div>
                </div>
                <Switch
                  checked={preferences.newTasks}
                  onCheckedChange={(checked) => updatePreference('newTasks', checked)}
                />
              </div>
            </div>
          )}

          {/* Universal preferences */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Status Updates</Label>
                <div className="text-sm text-muted-foreground">
                  Get notified about changes in task status and progress
                </div>
              </div>
              <Switch
                checked={preferences.statusUpdates}
                onCheckedChange={(checked) => updatePreference('statusUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  {preferences.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  Sound Notifications
                </Label>
                <div className="text-sm text-muted-foreground">
                  Play sound alerts for notifications
                </div>
              </div>
              <Switch
                checked={preferences.soundEnabled}
                onCheckedChange={(checked) => updatePreference('soundEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Vibration
                </Label>
                <div className="text-sm text-muted-foreground">
                  Use vibration for notifications (mobile devices)
                </div>
              </div>
              <Switch
                checked={preferences.vibrationEnabled}
                onCheckedChange={(checked) => updatePreference('vibrationEnabled', checked)}
              />
            </div>
          </div>

          {/* Test Notifications */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => showNotification({
                title: "Test Notification",
                body: "This is how your notifications will look!",
                icon: "/placeholder.svg"
              })}
              disabled={notificationPermission !== 'granted'}
            >
              <Bell className="h-4 w-4 mr-2" />
              Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Tips */}
      <Alert>
        <Smartphone className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tips:</strong> For the best experience, keep the FoodShare tab open or bookmark it. 
          Notifications work even when the app is in the background on mobile devices.
        </AlertDescription>
      </Alert>
    </div>
  );
};