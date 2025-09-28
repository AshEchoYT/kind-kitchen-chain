import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MapPin, 
  Clock, 
  Utensils, 
  Phone, 
  Navigation, 
  CheckCircle, 
  Truck, 
  ArrowRight, 
  RefreshCw, 
  MapIcon,
  Timer,
  Star,
  Users,
  Package,
  Route,
  Camera,
  MessageCircle,
  Bell,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DeliveryTask {
  id: string;
  food_name: string;
  food_type: string;
  quantity: number;
  description: string;
  pickup_time: string;
  expiry_time: string;
  status: string;
  created_at: string;
  hotel: {
    id: string;
    name: string;
    contact: string;
    street: string;
    city: string;
    landmark: string;
    latitude?: number;
    longitude?: number;
  };
  estimated_distance?: number;
  priority_score?: number;
  agent_earnings?: number;
}

const RealTimeTaskBoard = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [availableTasks, setAvailableTasks] = useState<DeliveryTask[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<DeliveryTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [filterRadius, setFilterRadius] = useState(10); // km
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get agent's current location (mock for now)
  const [agentLocation, setAgentLocation] = useState({
    latitude: 28.6139, // Delhi
    longitude: 77.2090
  });

  useEffect(() => {
    // Allow access even without authentication but show demo mode
    if (user && userProfile?.role !== 'agent') {
      toast.error('This page is designed for delivery agents');
    }

    initializeAgent();
    setupRealTimeSubscription();
    
    // Request location permission
    requestLocationPermission();

    return () => {
      // Cleanup subscriptions
    };
  }, [user, userProfile]);

  const initializeAgent = async () => {
    try {
      // Get agent profile
      const { data: agent } = await supabase
        .from('delivery_agents')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setAgentProfile(agent);
      
      // Fetch tasks
      await fetchTasks();
    } catch (error) {
      console.error('Error initializing agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    // Real-time subscription for new tasks
    const taskSubscription = supabase
      .channel('food_reports')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'food_reports',
          filter: 'status=eq.new' 
        },
        (payload) => {
          console.log('New task available!', payload);
          playNotificationSound();
          toast.success('🔥 New food pickup available nearby!', {
            description: 'Check the Available Tasks tab',
            action: {
              label: 'View',
              onClick: () => fetchTasks()
            }
          });
          fetchTasks();
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'food_reports'
        },
        (payload) => {
          console.log('Task updated!', payload);
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(taskSubscription);
    };
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAgentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast.success('Location enabled for better task matching!');
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Location access denied. Using default location.');
        }
      );
    }
  };

  const playNotificationSound = () => {
    // Create notification sound
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);
  };

  const fetchTasks = async () => {
    try {
      setRefreshing(true);

      // Fetch available tasks
      const { data: available, error: availableError } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels (
            id,
            name,
            contact,
            street,
            city,
            landmark,
            latitude,
            longitude
          )
        `)
        .eq('status', 'new')
        .gte('expiry_time', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (availableError) throw availableError;

      // Fetch assigned tasks
      const { data: assigned, error: assignedError } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels (
            id,
            name,
            contact,
            street,
            city,
            landmark,
            latitude,
            longitude
          )
        `)
        .eq('assigned_agent_id', agentProfile?.id)
        .in('status', ['assigned', 'picked'])
        .order('pickup_time', { ascending: true });

      if (assignedError) throw assignedError;

      // Fetch completed tasks (last 10)
      const { data: completed, error: completedError } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels (
            id,
            name,
            contact,
            street,
            city,
            landmark,
            latitude,
            longitude
          )
        `)
        .eq('assigned_agent_id', agentProfile?.id)
        .eq('status', 'delivered')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (completedError) throw completedError;

      // Transform data and calculate distances/priorities
      const transformedAvailable = available?.map(task => transformTask(task)) || [];
      const transformedAssigned = assigned?.map(task => transformTask(task)) || [];
      const transformedCompleted = completed?.map(task => transformTask(task)) || [];

      setAvailableTasks(transformedAvailable);
      setAssignedTasks(transformedAssigned);
      setCompletedTasks(transformedCompleted);

    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setRefreshing(false);
    }
  };

  const transformTask = (task: any): DeliveryTask => {
    const distance = calculateDistance(
      agentLocation.latitude,
      agentLocation.longitude,
      task.hotels?.latitude || 28.6139,
      task.hotels?.longitude || 77.2090
    );

    const priority = calculatePriority(task, distance);
    const earnings = calculateEarnings(task, distance);

    return {
      id: task.id,
      food_name: task.food_name,
      food_type: task.food_type,
      quantity: task.quantity,
      description: task.description || '',
      pickup_time: task.pickup_time,
      expiry_time: task.expiry_time,
      status: task.status,
      created_at: task.created_at,
      hotel: {
        id: task.hotels?.id || '',
        name: task.hotels?.name || 'Unknown Hotel',
        contact: task.hotels?.contact || '',
        street: task.hotels?.street || '',
        city: task.hotels?.city || '',
        landmark: task.hotels?.landmark || '',
        latitude: task.hotels?.latitude,
        longitude: task.hotels?.longitude
      },
      estimated_distance: distance,
      priority_score: priority,
      agent_earnings: earnings
    };
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculatePriority = (task: any, distance: number): number => {
    const hoursUntilExpiry = (new Date(task.expiry_time).getTime() - Date.now()) / (1000 * 60 * 60);
    const urgencyScore = Math.max(0, 10 - hoursUntilExpiry); // Higher score for more urgent
    const proximityScore = Math.max(0, 10 - distance); // Higher score for closer
    const quantityScore = Math.min(10, task.quantity / 2); // More food = higher score
    
    return Math.round((urgencyScore * 0.5 + proximityScore * 0.3 + quantityScore * 0.2) * 10) / 10;
  };

  const calculateEarnings = (task: any, distance: number): number => {
    const baseEarning = 50; // Base ₹50
    const distanceBonus = distance * 10; // ₹10 per km
    const quantityBonus = task.quantity * 5; // ₹5 per serving
    const urgencyBonus = (() => {
      const hoursUntilExpiry = (new Date(task.expiry_time).getTime() - Date.now()) / (1000 * 60 * 60);
      return hoursUntilExpiry < 2 ? 30 : hoursUntilExpiry < 4 ? 15 : 0;
    })();
    
    return Math.round(baseEarning + distanceBonus + quantityBonus + urgencyBonus);
  };

  const acceptTask = async (taskId: string) => {
    if (!user || userProfile?.role !== 'agent') {
      toast.error('Please login as an agent to accept tasks');
      return;
    }

    try {
      // Get the task details with hotel info
      const task = availableTasks.find(t => t.id === taskId);
      if (!task || !task.hotel) {
        toast.error('Task details not found');
        return;
      }

      const { error } = await supabase
        .from('food_reports')
        .update({ 
          assigned_agent_id: agentProfile?.id,
          status: 'assigned' 
        })
        .eq('id', taskId);

      if (error) throw error;

      // Show detailed pickup information
      const hotel = task.hotel;
      const fullAddress = `${hotel.street}, ${hotel.city}, ${hotel.landmark}`;
      
      toast.success('🎉 Task accepted! Pickup Details:', {
        description: `📍 ${hotel.name}\n🏠 ${fullAddress}\n📞 ${hotel.contact}`,
        duration: 8000,
        action: {
          label: 'Start Navigation',
          onClick: () => {
            // Open Google Maps with hotel location
            if (hotel.latitude && hotel.longitude) {
              window.open(`https://maps.google.com?q=${hotel.latitude},${hotel.longitude}`, '_blank');
            }
          }
        }
      });

      // Play success sound
      playNotificationSound();
      
      fetchTasks();
    } catch (error) {
      console.error('Error accepting task:', error);
      toast.error('Failed to accept task');
    }
  };

  const startDelivery = (taskId: string) => {
    navigate(`/delivery/${taskId}`);
  };

  const filteredAvailableTasks = availableTasks
    .filter(task => 
      task.food_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(task => !filterRadius || (task.estimated_distance || 0) <= filterRadius)
    .sort((a, b) => {
      if (sortBy === 'priority') return (b.priority_score || 0) - (a.priority_score || 0);
      if (sortBy === 'distance') return (a.estimated_distance || 0) - (b.estimated_distance || 0);
      if (sortBy === 'earnings') return (b.agent_earnings || 0) - (a.agent_earnings || 0);
      if (sortBy === 'expiry') return new Date(a.expiry_time).getTime() - new Date(b.expiry_time).getTime();
      return 0;
    });

  const getUrgencyColor = (expiryTime: string) => {
    const hoursUntilExpiry = (new Date(expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilExpiry < 2) return 'bg-red-500 animate-pulse';
    if (hoursUntilExpiry < 4) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getPriorityColor = (score: number) => {
    if (score >= 8) return 'text-red-600 font-bold';
    if (score >= 6) return 'text-orange-600 font-semibold';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-16 h-16 relative mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <Truck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Task Board</h3>
            <p className="text-gray-600">Fetching real-time delivery opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with Agent Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                  <Truck className="h-8 w-8 text-blue-600 animate-bounce" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Delivery Task Board
                </h1>
                <p className="text-gray-600">
                  Welcome back, {agentProfile?.name || 'Agent'}! Ready to make a difference?
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={fetchTasks}
                disabled={refreshing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border">
                <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-600">ONLINE</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{availableTasks.length}</div>
                <div className="text-sm opacity-90">Available Tasks</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <CardContent className="p-4 text-center">
                <Truck className="h-6 w-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{assignedTasks.length}</div>
                <div className="text-sm opacity-90">Active Deliveries</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{agentProfile?.total_deliveries || 0}</div>
                <div className="text-sm opacity-90">Completed Today</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{agentProfile?.rating || 5.0}</div>
                <div className="text-sm opacity-90">Your Rating</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Task Tabs */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Available ({availableTasks.length})
            </TabsTrigger>
            <TabsTrigger value="assigned" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              My Deliveries ({assignedTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          {/* Available Tasks */}
          <TabsContent value="available" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Search food or restaurant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  
                  <select 
                    className="px-3 py-2 border rounded-md"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="priority">🔥 Priority</option>
                    <option value="distance">📍 Distance</option>
                    <option value="earnings">💰 Earnings</option>
                    <option value="expiry">⏰ Expires Soon</option>
                  </select>
                  
                  <select 
                    className="px-3 py-2 border rounded-md"
                    value={filterRadius}
                    onChange={(e) => setFilterRadius(Number(e.target.value))}
                  >
                    <option value={0}>All Areas</option>
                    <option value={2}>Within 2 km</option>
                    <option value={5}>Within 5 km</option>
                    <option value={10}>Within 10 km</option>
                  </select>
                  
                  <Button variant="outline">
                    <MapIcon className="h-4 w-4 mr-2" />
                    Map View
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Available Tasks Grid */}
            {filteredAvailableTasks.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tasks Available</h3>
                  <p className="text-gray-500">New delivery opportunities will appear here in real-time!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAvailableTasks.map((task, index) => (
                  <Card 
                    key={task.id}
                    className="bg-white hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 animate-fade-in"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                            <Utensils className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-800">
                              {task.food_name}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span className="font-medium">{task.hotel.name}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <Badge className={`text-white ${getUrgencyColor(task.expiry_time)}`}>
                            Priority {task.priority_score}
                          </Badge>
                          <div className="text-lg font-bold text-green-600">
                            ₹{task.agent_earnings}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {task.description && (
                        <p className="text-gray-600 text-sm">{task.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span><strong>{task.quantity}</strong> servings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-green-500" />
                          <span><strong>{task.estimated_distance?.toFixed(1)}</strong> km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-orange-500" />
                          <span>Expires {formatDistanceToNow(new Date(task.expiry_time), { addSuffix: true })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <span>Pickup {formatDistanceToNow(new Date(task.pickup_time), { addSuffix: true })}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium">Pickup Address:</span>
                        </div>
                        <p className="text-sm text-gray-700">{`${task.hotel.street}, ${task.hotel.city}, ${task.hotel.landmark}`}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Phone className="h-3 w-3 text-blue-500" />
                          <span className="text-sm text-blue-600">{task.hotel.contact}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => acceptTask(task.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Task
                        </Button>
                        <Button variant="outline" size="sm">
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Assigned Tasks */}
          <TabsContent value="assigned">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assignedTasks.map((task) => (
                <Card key={task.id} className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-blue-600" />
                        {task.food_name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        {task.status === 'assigned' ? 'Ready for Pickup' : 'In Transit'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{task.hotel.name} - {`${task.hotel.street}, ${task.hotel.city}`}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => startDelivery(task.id)}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Start Delivery
                      </Button>
                      <Button variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Completed Tasks */}
          <TabsContent value="completed">
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <Card key={task.id} className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">{task.food_name}</div>
                          <div className="text-sm text-gray-600">{task.hotel.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{task.agent_earnings}</div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RealTimeTaskBoard;