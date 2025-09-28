import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, Utensils, User, Phone, Navigation, CheckCircle, Truck, ArrowRight, RefreshCw, MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCity } from '@/contexts/CityContext';
import Navbar from '@/components/layout/Navbar';

interface DeliveryTask {
  id: string;
  food_report: {
    id: string;
    food_name: string;
    food_type: string;
    quantity: number;
    expiry_time: string;
    pickup_location: string;
    description: string;
    hotels: {
      name: string;
      phone: string;
      address: string;
      city: string;
    };
  };
  needy_person: {
    id: string;
    name: string;
    contact: string;
    street: string;
    city: string;
    landmark: string;
    preferred_food_time: string;
    notes: string;
  };
  status: string;
  created_at: string;
  distance_estimate?: string;
}

const AgentTaskBoard = () => {
  const [availableTasks, setAvailableTasks] = useState<DeliveryTask[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<DeliveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { selectedCity } = useCity();
  const navigate = useNavigate();

  // Simulated task creation - in real app, this would be triggered by database triggers
  const createSimulatedTasks = async () => {
    try {
      // Get food reports that need delivery
      const { data: foodReports, error: foodError } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels!inner(name, contact, street, city)
        `)
        .eq('status', 'new')
        .eq('hotels.city', selectedCity)
        .limit(5);

      if (foodError) throw foodError;

      // Get needy people who need food
      const { data: needyPeople, error: needyError } = await supabase
        .from('beggars')
        .select('*')
        .eq('city', selectedCity)
        .limit(5);

      if (needyError) throw needyError;

      // Create simulated matched tasks
      const simulatedTasks: DeliveryTask[] = [];
      
      if (foodReports && needyPeople) {
        for (let i = 0; i < Math.min(foodReports.length, needyPeople.length); i++) {
          const food = foodReports[i];
          const person = needyPeople[i];
          
          simulatedTasks.push({
            id: `task_${food.id}_${person.id}`,
            food_report: {
              id: food.id,
              food_name: food.food_name,
              food_type: food.food_type,
              quantity: food.quantity,
              expiry_time: food.expiry_time || '',
              pickup_location: food.hotels.street + ', ' + food.hotels.city,
              description: food.description || '',
              hotels: {
                name: food.hotels.name,
                phone: food.hotels.contact,
                address: food.hotels.street,
                city: food.hotels.city
              }
            },
            needy_person: {
              id: person.id,
              name: person.name,
              contact: person.contact || '',
              street: person.street,
              city: person.city,
              landmark: person.landmark || '',
              preferred_food_time: person.preferred_food_time || 'anytime',
              notes: person.notes || ''
            },
            status: 'available',
            created_at: new Date().toISOString(),
            distance_estimate: `${(Math.random() * 10 + 1).toFixed(1)} km`
          });
        }
      }

      setAvailableTasks(simulatedTasks);

    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchTasks = async () => {
    try {
      setError('');
      
      // In a real system, we'd fetch actual delivery_tasks from the database
      await createSimulatedTasks();
      
      // For now, assigned tasks are empty - would fetch agent's assigned tasks here
      setAssignedTasks([]);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedCity]);

  const refresh = async () => {
    setRefreshing(true);
    await fetchTasks();
  };

  const acceptTask = async (taskId: string) => {
    try {
      // Move task from available to assigned
      const task = availableTasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = { ...task, status: 'assigned' };
        setAvailableTasks(prev => prev.filter(t => t.id !== taskId));
        setAssignedTasks(prev => [...prev, updatedTask]);
        
        // In real app, update database here
        // Navigate to pickup flow
        navigate(`/agent-pickup/${taskId}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getUrgencyBadge = (notes: string) => {
    const lower = notes.toLowerCase();
    if (lower.includes('urgent')) return <Badge className="bg-red-100 text-red-700">Urgent</Badge>;
    if (lower.includes('high')) return <Badge className="bg-orange-100 text-orange-700">High Priority</Badge>;
    return <Badge className="bg-green-100 text-green-700">Normal</Badge>;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600">Loading delivery tasks...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Task Board</h1>
                <p className="text-gray-600">Available food pickup and delivery tasks in {selectedCity}</p>
              </div>
              <Button
                onClick={refresh}
                variant="outline"
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Tasks */}
            <div>
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Available Tasks ({availableTasks.length})
                  </CardTitle>
                  <CardDescription>
                    Food pickup and delivery tasks waiting for agents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                  {availableTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No available tasks in {selectedCity}</p>
                      <Button
                        onClick={refresh}
                        className="mt-4 bg-blue-500 hover:bg-blue-600"
                      >
                        Check for New Tasks
                      </Button>
                    </div>
                  ) : (
                    availableTasks.map((task) => (
                      <Card key={task.id} className="p-4 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg">
                        {/* Task Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {task.food_report.hotels.name} → {task.needy_person.name}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapIcon className="h-3 w-3" />
                              Distance: {task.distance_estimate}
                            </p>
                          </div>
                          <div className="text-right">
                            {getUrgencyBadge(task.needy_person.notes)}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(task.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Pickup Information */}
                        <div className="bg-orange-50 p-3 rounded-lg mb-3">
                          <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                            <Utensils className="h-4 w-4" />
                            Pickup from Hotel
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Food:</strong> {task.food_report.food_name} ({task.food_report.food_type})</p>
                            <p><strong>Quantity:</strong> {task.food_report.quantity} portions</p>
                            <p><strong>Location:</strong> {task.food_report.pickup_location}</p>
                            <p><strong>Phone:</strong> {task.food_report.hotels.phone}</p>
                            <p><strong>Expires:</strong> {new Date(task.food_report.expiry_time).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Delivery Information */}
                        <div className="bg-green-50 p-3 rounded-lg mb-4">
                          <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Deliver to Person
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Name:</strong> {task.needy_person.name}</p>
                            <p><strong>Location:</strong> {task.needy_person.street}, {task.needy_person.city}</p>
                            {task.needy_person.landmark && <p><strong>Landmark:</strong> {task.needy_person.landmark}</p>}
                            <p><strong>Phone:</strong> {task.needy_person.contact}</p>
                            <p><strong>Preferred time:</strong> {task.needy_person.preferred_food_time}</p>
                            {task.needy_person.notes && (
                              <p><strong>Notes:</strong> {task.needy_person.notes}</p>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button 
                          onClick={() => acceptTask(task.id)}
                          className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold py-3"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Task & Start Pickup
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Assigned/Active Tasks */}
            <div>
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Navigation className="h-5 w-5 text-green-600" />
                    Your Active Tasks ({assignedTasks.length})
                  </CardTitle>
                  <CardDescription>
                    Tasks you've accepted and are currently working on
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignedTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No active tasks</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Accept a task from the available list to get started
                      </p>
                    </div>
                  ) : (
                    assignedTasks.map((task) => (
                      <Card key={task.id} className="p-4 border-2 border-green-200">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {task.food_report.hotels.name} → {task.needy_person.name}
                          </h3>
                          <Badge className="bg-green-100 text-green-700">
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Status: Working on delivery
                        </p>
                        <Button 
                          size="sm"
                          className="w-full bg-green-500 hover:bg-green-600"
                          onClick={() => navigate(`/agent-pickup/${task.id}`)}
                        >
                          Continue Task
                        </Button>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-white/90 backdrop-blur-sm text-center p-6">
              <div className="text-3xl font-bold text-blue-600">{availableTasks.length}</div>
              <div className="text-gray-600">Available Tasks</div>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm text-center p-6">
              <div className="text-3xl font-bold text-green-600">{assignedTasks.length}</div>
              <div className="text-gray-600">Active Tasks</div>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm text-center p-6">
              <div className="text-3xl font-bold text-orange-600">{selectedCity}</div>
              <div className="text-gray-600">Current City</div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentTaskBoard;