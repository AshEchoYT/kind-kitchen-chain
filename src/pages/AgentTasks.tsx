import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, Package, User, Phone, Navigation, CheckCircle, Timer, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';

interface FoodTask {
  id: string;
  food_name: string;
  food_type: string;
  quantity: number;
  pickup_time: string;
  status: 'new' | 'assigned' | 'picked' | 'delivered' | 'cancelled';
  created_at: string;
  assigned_agent_id?: string;
  hotel: {
    name: string;
    contact: string;
    street: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  expiry_time?: string;
  description?: string;
}

const AgentTasks = () => {
  const [tasks, setTasks] = useState<FoodTask[]>([]);
  const [myTasks, setMyTasks] = useState<FoodTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('food_reports')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'food_reports' }, 
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      // Fetch available food reports with hotel information
      const { data: availableTasks, error: availableError } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels (
            name,
            contact,
            street,
            city,
            latitude,
            longitude
          )
        `)
        .eq('status', 'new')
        .order('created_at', { ascending: false });

      if (availableError) throw availableError;

      // Fetch agent's assigned tasks
      const { data: assignedTasks, error: assignedError } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels (
            name,
            contact,
            street,
            city,
            latitude,
            longitude
          )
        `)
        .eq('assigned_agent_id', user?.id)
        .in('status', ['assigned', 'picked'])
        .order('created_at', { ascending: false });

      if (assignedError) throw assignedError;

      // Transform data to match our interface
      const transformedAvailable = (availableTasks || []).map(task => ({
        id: task.id,
        food_name: task.food_name,
        food_type: task.food_type,
        quantity: task.quantity,
        pickup_time: task.pickup_time,
        status: task.status,
        created_at: task.created_at,
        assigned_agent_id: task.assigned_agent_id,
        expiry_time: task.expiry_time,
        description: task.description,
        hotel: {
          name: task.hotels?.name || 'Unknown Hotel',
          contact: task.hotels?.contact || '',
          street: task.hotels?.street || '',
          city: task.hotels?.city || '',
          latitude: task.hotels?.latitude,
          longitude: task.hotels?.longitude
        }
      }));

      const transformedAssigned = (assignedTasks || []).map(task => ({
        id: task.id,
        food_name: task.food_name,
        food_type: task.food_type,
        quantity: task.quantity,
        pickup_time: task.pickup_time,
        status: task.status,
        created_at: task.created_at,
        assigned_agent_id: task.assigned_agent_id,
        expiry_time: task.expiry_time,
        description: task.description,
        hotel: {
          name: task.hotels?.name || 'Unknown Hotel',
          contact: task.hotels?.contact || '',
          street: task.hotels?.street || '',
          city: task.hotels?.city || '',
          latitude: task.hotels?.latitude,
          longitude: task.hotels?.longitude
        }
      }));
      
      setTasks(transformedAvailable);
      setMyTasks(transformedAssigned);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const assignTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('food_reports')
        .update({ 
          status: 'assigned', 
          assigned_agent_id: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Refresh tasks
      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateTaskStatus = async (taskId: string, status: 'picked' | 'delivered') => {
    try {
      const { error } = await supabase
        .from('food_reports')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      fetchTasks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800 border-green-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picked': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const openMaps = (street: string, city: string, latitude?: number, longitude?: number) => {
    if (latitude && longitude) {
      // Open in Google Maps with coordinates
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    } else {
      // Fallback to address search
      const address = `${street}, ${city}`;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            Delivery Agent Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Pick up food from hotels and deliver to communities in Tamil Nadu
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* My Active Tasks */}
        {myTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Active Tasks ({myTasks.length})</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myTasks.map((task) => (
                <Card key={task.id} className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-blue-700">
                        {task.hotel.name}
                      </CardTitle>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{task.hotel.street}, {task.hotel.city}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <p className="text-sm"><span className="font-medium">Food:</span> {task.food_name} ({task.food_type})</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <p className="text-sm"><span className="font-medium">Quantity:</span> {task.quantity} servings</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <p className="text-sm"><span className="font-medium">Pickup:</span> {new Date(task.pickup_time).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm"><span className="font-medium">Contact:</span> {task.hotel.contact}</p>
                    </div>
                    
                    <div className="flex space-x-2 pt-3">
                      <Button
                        onClick={() => openMaps(task.hotel.street, task.hotel.city, task.hotel.latitude, task.hotel.longitude)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Navigate
                      </Button>
                      
                      {task.status === 'assigned' && (
                        <Button
                          onClick={() => updateTaskStatus(task.id, 'picked')}
                          size="sm"
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Picked Up
                        </Button>
                      )}
                      
                      {task.status === 'picked' && (
                        <Button
                          onClick={() => updateTaskStatus(task.id, 'delivered')}
                          size="sm"
                          className="flex-1 bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Delivered
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Tasks */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Available Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <Timer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No tasks available</h3>
                <p className="text-gray-500">
                  Check back later for new food rescue opportunities in your area.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <Card key={task.id} className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-green-700">
                        {task.hotel.name}
                      </CardTitle>
                      <Badge className={getStatusColor(task.status)}>
                        AVAILABLE
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{task.hotel.street}, {task.hotel.city}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <p className="text-sm"><span className="font-medium">Food:</span> {task.food_name} ({task.food_type})</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <p className="text-sm"><span className="font-medium">Serves:</span> {task.quantity} people</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <p className="text-sm"><span className="font-medium">Pickup by:</span> {new Date(task.pickup_time).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm"><span className="font-medium">Contact:</span> {task.hotel.contact}</p>
                    </div>
                    
                    <div className="pt-3">
                      <Button
                        onClick={() => assignTask(task.id)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentTasks;