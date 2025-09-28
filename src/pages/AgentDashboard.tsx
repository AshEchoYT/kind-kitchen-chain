import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Navigation, Package, Clock, CheckCircle, User, Search } from 'lucide-react';
import { MapView } from '@/components/map/MapView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';

const AgentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agentData, setAgentData] = useState<any>(null);
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    if (user) {
      fetchAgentData();
    }
  }, [user]);

  useEffect(() => {
    if (agentData) {
      fetchTasks();
      // Set up real-time subscription for available tasks
      const subscription = supabase
        .channel('food_reports_channel')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'food_reports' 
          }, 
          (payload) => {
            console.log('Real-time update:', payload);
            fetchTasks(); // Refresh tasks on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [agentData]);

  const fetchAgentData = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_agents')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setAgentData(data);
    } catch (error) {
      console.error('Error fetching agent data:', error);
    }
  };

  const fetchTasks = async () => {
    if (!agentData) return;
    
    try {
      // Fetch available tasks in agent's area
      const { data: available, error: availableError } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels (name, street, city, landmark, contact, latitude, longitude)
        `)
        .eq('status', 'new')
        .is('assigned_agent_id', null)
        .gte('pickup_time', new Date().toISOString())
        .order('pickup_time', { ascending: true });

      if (availableError) throw availableError;

      // Filter by agent's location (if location data available)
      const filteredAvailable = available?.filter(task => {
        if (!task.hotels?.latitude || !task.hotels?.longitude) {
          return true; // Include all if no location data
        }
        // All tasks in the city are considered available
        return true;
      }) || [];

      // Fetch assigned tasks
      const { data: assigned, error: assignedError } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels (name, street, city, landmark, contact, latitude, longitude)
        `)
        .eq('assigned_agent_id', agentData?.id)
        .in('status', ['assigned', 'picked'])
        .order('pickup_time', { ascending: true });

      if (assignedError) throw assignedError;

      // Fetch completed tasks
      const { data: completed, error: completedError } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels (name, street, city, landmark, contact)
        `)
        .eq('assigned_agent_id', agentData?.id)
        .eq('status', 'delivered')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (completedError) throw completedError;

      setAvailableTasks(filteredAvailable);
      setAssignedTasks(assigned || []);
      setCompletedTasks(completed || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickUpTask = async (taskId: string) => {
    if (!agentData) return;
    
    try {
      const { error } = await supabase
        .from('food_reports')
        .update({ 
          assigned_agent_id: agentData.id,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('status', 'new') // Ensure task is still available
        .is('assigned_agent_id', null);

      if (error) throw error;

      toast({
        title: "Task Picked Up!",
        description: "The task has been assigned to you successfully.",
        variant: "default"
      });

      fetchTasks(); // Refresh all tasks
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not pick up task. It may have been assigned to another agent.",
        variant: "destructive"
      });
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'new' | 'assigned' | 'picked' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('food_reports')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Status Updated!",
        description: `Task marked as ${newStatus}.`,
        variant: "default"
      });

      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-500';
      case 'picked': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getNextAction = (status: string): { action: string; nextStatus: 'assigned' | 'picked' | 'delivered' } | null => {
    switch (status) {
      case 'assigned': return { action: 'Mark as Picked Up', nextStatus: 'picked' };
      case 'picked': return { action: 'Mark as Delivered', nextStatus: 'delivered' };
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const locations = assignedTasks.map(task => ({
    id: task.id,
    name: task.hotels?.name || 'Restaurant',
    address: `${task.hotels?.street}, ${task.hotels?.city}`,
    type: 'hotel' as const,
    status: task.status,
    lat: task.hotels?.latitude ? parseFloat(task.hotels.latitude) : 28.6139 + Math.random() * 0.1,
    lng: task.hotels?.longitude ? parseFloat(task.hotels.longitude) : 77.2090 + Math.random() * 0.1
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Agent Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {agentData?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{agentData?.name || 'Agent Dashboard'}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Zone: {agentData?.zone || 'N/A'} | Area: {agentData?.area || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Tasks</p>
                    <p className="text-2xl font-bold">{availableTasks.length}</p>
                  </div>
                  <Search className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Tasks</p>
                    <p className="text-2xl font-bold">{assignedTasks.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Today</p>
                    <p className="text-2xl font-bold">
                      {completedTasks.filter(task => 
                        new Date(task.updated_at).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-20">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Available Food Rescue Tasks
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Pick up tasks in your service area. Once picked, they will appear in "My Tasks".
                  </p>
                </CardHeader>
              </Card>

              {availableTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-green-700">{task.food_name}</h3>
                        <p className="text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {task.hotels?.name} - {task.hotels?.street}, {task.hotels?.city}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Available
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{task.quantity} portions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Pickup: {new Date(task.pickup_time).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {task.food_type.toUpperCase()}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${task.food_type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${task.hotels?.contact}`, '_self')}
                      >
                        Call Restaurant
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://maps.google.com/maps/dir/?api=1&destination=${task.hotels?.street}, ${task.hotels?.city}`, '_blank')}
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        View Location
                      </Button>
                      <Button
                        size="sm"
                        className="ml-auto bg-green-600 hover:bg-green-700"
                        onClick={() => pickUpTask(task.id)}
                      >
                        Pick This Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {availableTasks.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Available Tasks</h3>
                    <p className="text-muted-foreground">
                      There are currently no food rescue tasks available in your area. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <div className="grid gap-6">
              {assignedTasks.map((task) => {
                const nextAction = getNextAction(task.status);
                return (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{task.food_name}</h3>
                          <p className="text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {task.hotels?.name} - {task.hotels?.street}, {task.hotels?.city}
                            </span>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(task.status)} text-white`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{task.quantity} portions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Pickup: {new Date(task.pickup_time).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${task.hotels?.contact}`, '_self')}
                        >
                          Call Restaurant
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://maps.google.com/maps/dir/?api=1&destination=${task.hotels?.street}, ${task.hotels?.city}`, '_blank')}
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Navigate
                        </Button>
                        {nextAction && (
                          <Button
                            size="sm"
                            className="ml-auto"
                            onClick={() => updateTaskStatus(task.id, nextAction.nextStatus)}
                          >
                            {nextAction.action}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {assignedTasks.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Tasks</h3>
                    <p className="text-muted-foreground">
                      You don't have any assigned tasks right now. Check the "Available" tab to pick up new tasks!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pickup Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <MapView locations={locations} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="grid gap-6">
              {completedTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{task.food_name}</h3>
                        <p className="text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {task.hotels?.name} - {task.hotels?.street}, {task.hotels?.city}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        Delivered
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{task.quantity} portions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Delivered: {new Date(task.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {task.food_type.toUpperCase()}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${task.food_type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {completedTasks.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Delivery History</h3>
                    <p className="text-muted-foreground">
                      Your completed deliveries will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AgentDashboard;