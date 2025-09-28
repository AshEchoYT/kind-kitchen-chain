import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Clock, 
  Package, 
  Phone, 
  Navigation, 
  Filter,
  Search,
  Bell,
  Zap,
  Timer,
  AlertTriangle,
  Star,
  Camera
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TaskData {
  id: string;
  food_name: string;
  food_type: 'veg' | 'non_veg' | 'snacks' | 'beverages' | 'dairy' | 'bakery';
  quantity: number;
  pickup_time: string;
  expiry_time?: string;
  description?: string;
  image_url?: string;
  status: 'new' | 'assigned' | 'picked' | 'delivered' | 'cancelled';
  created_at: string;
  hotels?: {
    id: string;
    name: string;
    street: string;
    city: string;
    contact: string;
    latitude?: number;
    longitude?: number;
  };
}

interface EnhancedTaskBoardProps {
  agentData: any;
  onTaskAccepted?: (taskId: string) => void;
}

export const EnhancedTaskBoard: React.FC<EnhancedTaskBoardProps> = ({
  agentData,
  onTaskAccepted
}) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('pickup_time');

  // Real-time subscription
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  // Sound notification
  const playNotificationSound = useCallback(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARQAAAEAAAAABAAAAAGQAYQB0AGEAAAAA');
    audio.play().catch(() => {}); // Ignore errors if audio fails
  }, []);

  useEffect(() => {
    fetchAvailableTasks();
    setupRealTimeSubscription();
    
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [agentData]);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery, foodTypeFilter, urgencyFilter, distanceFilter, sortBy]);

  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel('enhanced_task_board')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'food_reports' 
        }, 
        (payload) => {
          console.log('New task available:', payload.new);
          handleNewTask(payload.new);
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'food_reports' 
        }, 
        (payload) => {
          console.log('Task updated:', payload.new);
          handleTaskUpdate(payload.new);
        }
      )
      .subscribe();

    setRealtimeChannel(channel);
  };

  const handleNewTask = (newTask: any) => {
    // Only show if it's a new unassigned task
    if (newTask.status === 'new' && !newTask.assigned_agent_id) {
      playNotificationSound();
      toast({
        title: "🔔 New Food Available!",
        description: `${newTask.food_name} - ${newTask.quantity} servings`,
        duration: 5000,
      });
      fetchAvailableTasks(); // Refresh the task list
    }
  };

  const handleTaskUpdate = (updatedTask: any) => {
    // Update local state if task status changed
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const fetchAvailableTasks = async () => {
    if (!agentData?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels!inner (
            id,
            name,
            street,
            city,
            contact,
            latitude,
            longitude
          )
        `)
        .eq('status', 'new')
        .is('assigned_agent_id', null)
        .gte('pickup_time', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load available tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (task: TaskData): number => {
    // Simple distance calculation (would use proper geolocation in production)
    if (!task.hotels?.latitude || !task.hotels?.longitude) return 0;
    // Mock distance for demo - in real app would use user's location
    return Math.random() * 10 + 1; // 1-11 km
  };

  const getUrgencyLevel = (task: TaskData) => {
    if (!task.expiry_time) return { level: 'flexible', color: 'bg-green-100 text-green-800', priority: 0 };
    
    const now = new Date();
    const expiry = new Date(task.expiry_time);
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry <= 2) return { level: 'urgent', color: 'bg-red-100 text-red-800', priority: 3 };
    if (hoursUntilExpiry <= 6) return { level: 'medium', color: 'bg-orange-100 text-orange-800', priority: 2 };
    return { level: 'flexible', color: 'bg-green-100 text-green-800', priority: 1 };
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.hotels?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Food type filter
    if (foodTypeFilter !== 'all') {
      filtered = filtered.filter(task => task.food_type === foodTypeFilter);
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(task => getUrgencyLevel(task).level === urgencyFilter);
    }

    // Distance filter (mock implementation)
    if (distanceFilter !== 'all') {
      const maxDistance = parseInt(distanceFilter);
      filtered = filtered.filter(task => calculateDistance(task) <= maxDistance);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          return getUrgencyLevel(b).priority - getUrgencyLevel(a).priority;
        case 'distance':
          return calculateDistance(a) - calculateDistance(b);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: // pickup_time
          return new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime();
      }
    });

    setFilteredTasks(filtered);
  };

  const handleAcceptTask = async (taskId: string) => {
    if (!agentData?.id) return;

    try {
      const { error } = await supabase
        .from('food_reports')
        .update({ 
          assigned_agent_id: agentData.id,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('status', 'new');

      if (error) throw error;

      toast({
        title: "✅ Task Accepted!",
        description: "The task has been assigned to you. Check 'My Tasks' to get started.",
      });

      // Remove from available tasks
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setSelectedTask(null);
      
      if (onTaskAccepted) {
        onTaskAccepted(taskId);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to accept task",
        variant: "destructive",
      });
    }
  };

  const getFoodTypeIcon = (type: string) => {
    const icons = {
      'veg': '🥬',
      'non_veg': '🍖',
      'snacks': '🍿',
      'beverages': '🥤',
      'dairy': '🥛',
      'bakery': '🍞'
    };
    return icons[type as keyof typeof icons] || '🍽️';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Food Rescue Tasks
            <Badge variant="outline" className="ml-auto">
              {filteredTasks.length} available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by food name, restaurant, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Select value={foodTypeFilter} onValueChange={setFoodTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Food Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="veg">🥬 Vegetarian</SelectItem>
                <SelectItem value="non_veg">🍖 Non-Veg</SelectItem>
                <SelectItem value="snacks">🍿 Snacks</SelectItem>
                <SelectItem value="beverages">🥤 Beverages</SelectItem>
                <SelectItem value="dairy">🥛 Dairy</SelectItem>
                <SelectItem value="bakery">🍞 Bakery</SelectItem>
              </SelectContent>
            </Select>

            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="urgent">🔴 Urgent (2hrs)</SelectItem>
                <SelectItem value="medium">🟠 Medium (6hrs)</SelectItem>
                <SelectItem value="flexible">🟢 Flexible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={distanceFilter} onValueChange={setDistanceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Distance</SelectItem>
                <SelectItem value="2">Within 2km</SelectItem>
                <SelectItem value="5">Within 5km</SelectItem>
                <SelectItem value="10">Within 10km</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pickup_time">⏰ Pickup Time</SelectItem>
                <SelectItem value="urgency">🚨 Urgency</SelectItem>
                <SelectItem value="distance">📍 Distance</SelectItem>
                <SelectItem value="quantity">📦 Quantity</SelectItem>
                <SelectItem value="newest">🆕 Newest</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setFoodTypeFilter('all');
                setUrgencyFilter('all');
                setDistanceFilter('all');
                setSortBy('pickup_time');
              }}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task Cards */}
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tasks Available</h3>
              <p className="text-muted-foreground">
                {tasks.length === 0 
                  ? "No food rescue tasks are currently available in your area."
                  : "No tasks match your current filters. Try adjusting your search criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const urgency = getUrgencyLevel(task);
            const distance = calculateDistance(task);
            
            return (
              <Card 
                key={task.id} 
                className="hover:shadow-md transition-all duration-300 border-l-4 border-l-green-500 relative overflow-hidden"
              >
                {/* Urgency indicator */}
                {urgency.level === 'urgent' && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-red-500 text-white animate-pulse">
                      <Zap className="h-3 w-3 mr-1" />
                      URGENT
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span className="text-xl">{getFoodTypeIcon(task.food_type)}</span>
                        {task.food_name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {task.quantity} servings
                        </div>
                        <Badge variant="outline">
                          {task.food_type.replace('_', '-')}
                        </Badge>
                        <Badge className={urgency.color}>
                          {urgency.level.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  {task.hotels && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{task.hotels.name}</h4>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {task.hotels.street}, {task.hotels.city}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{distance.toFixed(1)} km away</div>
                          <div className="text-muted-foreground">~{Math.round(distance * 3)} min</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timing Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">Available from</div>
                        <div className="text-muted-foreground">
                          {formatDistanceToNow(new Date(task.pickup_time), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    {task.expiry_time && (
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-orange-600" />
                        <div>
                          <div className="font-medium">Best before</div>
                          <div className="text-muted-foreground">
                            {formatDistanceToNow(new Date(task.expiry_time), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <span className="text-xl">{getFoodTypeIcon(task.food_type)}</span>
                            {task.food_name}
                          </DialogTitle>
                        </DialogHeader>
                        <TaskDetailModal task={task} onAccept={() => handleAcceptTask(task.id)} />
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleAcceptTask(task.id)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Accept Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

// Task Detail Modal Component
const TaskDetailModal: React.FC<{ task: TaskData; onAccept: () => void }> = ({ task, onAccept }) => {
  const urgency = task.expiry_time ? (() => {
    const now = new Date();
    const expiry = new Date(task.expiry_time);
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilExpiry <= 2) return { level: 'urgent', color: 'bg-red-100 text-red-800' };
    if (hoursUntilExpiry <= 6) return { level: 'medium', color: 'bg-orange-100 text-orange-800' };
    return { level: 'flexible', color: 'bg-green-100 text-green-800' };
  })() : null;

  return (
    <div className="space-y-6">
      {/* Food Image */}
      {task.image_url ? (
        <img 
          src={task.image_url} 
          alt={task.food_name}
          className="w-full h-48 object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-500">No photo available</span>
          </div>
        </div>
      )}

      {/* Task Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Food Details</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Type:</strong> {task.food_type.replace('_', ' ')}</div>
            <div><strong>Quantity:</strong> {task.quantity} servings</div>
            {urgency && (
              <div className="flex items-center gap-2">
                <strong>Urgency:</strong>
                <Badge className={urgency.color}>{urgency.level.toUpperCase()}</Badge>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Restaurant</h4>
          {task.hotels && (
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {task.hotels.name}</div>
              <div><strong>Address:</strong> {task.hotels.street}, {task.hotels.city}</div>
              <div><strong>Contact:</strong> {task.hotels.contact}</div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div>
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </div>
      )}

      {/* Timing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Pickup Time</h4>
          <p className="text-sm">{new Date(task.pickup_time).toLocaleString()}</p>
        </div>
        {task.expiry_time && (
          <div>
            <h4 className="font-semibold mb-2">Best Before</h4>
            <p className="text-sm">{new Date(task.expiry_time).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-4 border-t">
        {task.hotels && (
          <>
            <Button
              variant="outline"
              onClick={() => window.open(`tel:${task.hotels?.contact}`, '_self')}
              className="flex-1"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Restaurant
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(
                `https://maps.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.hotels?.street + ', ' + task.hotels?.city)}`, 
                '_blank'
              )}
              className="flex-1"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </>
        )}
      </div>

      <Button onClick={onAccept} className="w-full bg-green-600 hover:bg-green-700">
        <Star className="h-4 w-4 mr-2" />
        Accept This Task
      </Button>
    </div>
  );
};