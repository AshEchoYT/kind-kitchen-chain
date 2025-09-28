import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, Package, Truck } from 'lucide-react';

interface RealTimeUpdatesProps {
  userRole: 'hotel' | 'agent' | 'admin';
  userId: string;
}

export const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({ userRole, userId }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Set up real-time listeners based on user role
    const channels: any[] = [];

    if (userRole === 'agent') {
      // Listen for new food reports that can be assigned
      const foodReportsChannel = supabase
        .channel('food-reports-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'food_reports'
          },
          (payload) => {
            toast({
              title: "New Food Available!",
              description: `${payload.new.food_name} available for pickup`,
              duration: 5000,
            });
            
            // Add notification
            setNotifications(prev => [...prev, {
              id: Date.now(),
              type: 'new_food',
              message: `New food available: ${payload.new.food_name}`,
              timestamp: new Date(),
              data: payload.new
            }]);
          }
        )
        .subscribe();

      channels.push(foodReportsChannel);

      // Listen for assignment updates
      const assignmentChannel = supabase
        .channel('assignment-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'food_reports',
            filter: `assigned_agent_id=eq.${userId}`
          },
          (payload) => {
            if (payload.new.status === 'assigned') {
              toast({
                title: "New Assignment!",
                description: `You've been assigned to pick up ${payload.new.food_name}`,
                duration: 5000,
              });
            }
          }
        )
        .subscribe();

      channels.push(assignmentChannel);
    }

    if (userRole === 'hotel') {
      // Listen for status updates on their food reports
      const statusUpdatesChannel = supabase
        .channel('status-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'food_reports'
          },
          (payload) => {
            const statusMessages = {
              assigned: 'has been assigned to an agent',
              picked: 'has been picked up',
              delivered: 'has been delivered successfully'
            };

            const message = statusMessages[payload.new.status as keyof typeof statusMessages];
            if (message) {
              toast({
                title: "Status Update",
                description: `${payload.new.food_name} ${message}`,
                duration: 5000,
              });
            }
          }
        )
        .subscribe();

      channels.push(statusUpdatesChannel);
    }

    if (userRole === 'admin') {
      // Listen for all platform activities
      const platformUpdatesChannel = supabase
        .channel('platform-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'food_reports'
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              toast({
                title: "New Food Report",
                description: `${payload.new.food_name} reported by a hotel`,
                duration: 3000,
              });
            }
          }
        )
        .subscribe();

      channels.push(platformUpdatesChannel);
    }

    // Cleanup function
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [userRole, userId, toast]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.slice(-3).map((notification) => (
            <div
              key={notification.id}
              className="bg-primary text-primary-foreground p-3 rounded-lg shadow-lg animate-slide-in-right max-w-sm"
            >
              <div className="flex items-start gap-2">
                {notification.type === 'new_food' && <Package className="h-4 w-4 mt-0.5" />}
                {notification.type === 'assignment' && <Truck className="h-4 w-4 mt-0.5" />}
                {notification.type === 'status' && <Bell className="h-4 w-4 mt-0.5" />}
                <div className="flex-1 text-sm">
                  {notification.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};