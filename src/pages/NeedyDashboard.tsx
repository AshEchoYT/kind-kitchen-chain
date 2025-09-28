import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, Utensils, User, Phone, Plus, RefreshCw, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';

interface NeedyPerson {
  id: string;
  name: string;
  contact: string;
  street: string;
  city: string;
  landmark: string | null;
  preferred_food_time: string | null;
  notes: string | null;
  created_at: string;
}

interface FoodReport {
  id: string;
  food_type: string;
  food_name: string;
  quantity: number;
  expiry_time: string;
  pickup_location: string;
  description: string;
  status: string;
  created_at: string;
  hotels: {
    name: string;
    phone: string;
  };
}

const NeedyDashboard = () => {
  const [needyPeople, setNeedyPeople] = useState<NeedyPerson[]>([]);
  const [availableFood, setAvailableFood] = useState<FoodReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setError('');
      
      // Fetch all needy people (in a real app, you'd filter by logged-in user)
      const { data: beggarsData, error: beggarsError } = await supabase
        .from('beggars')
        .select('*')
        .order('created_at', { ascending: false });

      if (beggarsError) throw beggarsError;

      // Fetch available food reports
      const { data: foodData, error: foodError } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels!inner(name, contact, street, city)
        `)
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(10);

      if (foodError) throw foodError;

      setNeedyPeople(beggarsData || []);
      // Transform the data to include pickup_location and fix hotels type
      const transformedData = foodData?.map(item => ({
        ...item,
        pickup_location: `${item.hotels.street}, ${item.hotels.city}`,
        hotels: {
          name: item.hotels.name,
          phone: item.hotels.contact
        }
      })) || [];
      
      setAvailableFood(transformedData);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const getUrgencyColor = (notes: string | null) => {
    if (!notes) return 'bg-gray-100 text-gray-700';
    const lower = notes.toLowerCase();
    if (lower.includes('urgent')) return 'bg-red-100 text-red-700';
    if (lower.includes('high')) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  const getTimePreference = (time: string | null) => {
    if (!time) return 'Anytime';
    return time.charAt(0).toUpperCase() + time.slice(1);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Assistance Dashboard</h1>
                <p className="text-gray-600">Manage your food requests and see available donations</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={refresh}
                  variant="outline"
                  disabled={refreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => navigate('/needy-registration')}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Plus className="h-4 w-4" />
                  New Request
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Food Requests */}
            <div>
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="h-5 w-5 text-blue-600" />
                    Recent Food Requests
                  </CardTitle>
                  <CardDescription>
                    People who have requested food assistance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {needyPeople.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No food requests yet</p>
                      <Button
                        onClick={() => navigate('/needy-registration')}
                        className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        Make First Request
                      </Button>
                    </div>
                  ) : (
                    needyPeople.slice(0, 5).map((person) => (
                      <Card key={person.id} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{person.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {person.street}, {person.city}
                              {person.landmark && ` (Near ${person.landmark})`}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" />
                              {person.contact}
                            </p>
                          </div>
                          <Badge className={getUrgencyColor(person.notes)}>
                            {person.notes?.toLowerCase().includes('urgent') ? 'Urgent' :
                             person.notes?.toLowerCase().includes('high') ? 'High Priority' :
                             'Normal'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimePreference(person.preferred_food_time)}
                          </span>
                          <span>{new Date(person.created_at).toLocaleDateString()}</span>
                        </div>
                        {person.notes && (
                          <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                            {person.notes}
                          </p>
                        )}
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Available Food */}
            <div>
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Utensils className="h-5 w-5 text-green-600" />
                    Available Food
                  </CardTitle>
                  <CardDescription>
                    Surplus food available for collection in your area
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableFood.length === 0 ? (
                    <div className="text-center py-8">
                      <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No food available right now</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Check back later or enable notifications
                      </p>
                    </div>
                  ) : (
                    availableFood.map((food) => (
                      <Card key={food.id} className="p-4 hover:shadow-lg transition-shadow border-green-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{food.hotels.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {food.pickup_location}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" />
                              {food.hotels.phone}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">
                            Available
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">
                              <strong>Food Type:</strong> {food.food_type}
                            </span>
                            <span className="text-gray-700">
                              <strong>Quantity:</strong> {food.quantity} portions
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Best before: {new Date(food.expiry_time).toLocaleDateString()}
                            </span>
                            <span className="text-gray-600">
                              Posted: {new Date(food.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <Button 
                            size="sm" 
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Notify Me When Available
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-white/90 backdrop-blur-sm text-center p-6">
              <div className="text-3xl font-bold text-blue-600">{needyPeople.length}</div>
              <div className="text-gray-600">Total Requests</div>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm text-center p-6">
              <div className="text-3xl font-bold text-green-600">{availableFood.length}</div>
              <div className="text-gray-600">Available Food Items</div>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm text-center p-6">
              <div className="text-3xl font-bold text-orange-600">
                {needyPeople.filter(p => p.notes?.toLowerCase().includes('urgent')).length}
              </div>
              <div className="text-gray-600">Urgent Requests</div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default NeedyDashboard;