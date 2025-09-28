import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Package, 
  Filter,
  Heart,
  Utensils,
  Star,
  Navigation,
  Phone,
  Timer
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { formatDistanceToNow } from 'date-fns';

interface FoodItem {
  id: string;
  food_name: string;
  quantity: number;
  description: string;
  pickup_time: string;
  expiry_time: string;
  status: string;
  created_at: string;
  hotel: {
    name: string;
    address: string;
    contact: string;
    latitude?: number;
    longitude?: number;
  };
  distance?: number;
}

const AvailableFoodPage = () => {
  const { user } = useAuth();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchAvailableFood();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('food_reports')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'food_reports' },
        () => {
          fetchAvailableFood();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAvailableFood = async () => {
    try {
      const { data, error } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels (
            name,
            street,
            city,
            landmark,
            contact,
            latitude,
            longitude
          )
        `)
        .eq('status', 'new')
        .gte('expiry_time', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map(item => ({
        id: item.id,
        food_name: item.food_name,
        quantity: item.quantity,
        description: item.description || '',
        pickup_time: item.pickup_time,
        expiry_time: item.expiry_time,
        status: item.status,
        created_at: item.created_at,
        hotel: {
          name: item.hotels?.name || 'Unknown Hotel',
          address: `${item.hotels?.street || ''}, ${item.hotels?.city || ''}${item.hotels?.landmark ? ', ' + item.hotels.landmark : ''}`.replace(/^, |, $/, '') || 'Address not available',
          contact: item.hotels?.contact || 'Contact not available',
          latitude: item.hotels?.latitude,
          longitude: item.hotels?.longitude,
        },
        distance: Math.random() * 10 + 0.5 // Mock distance for now
      })) || [];

      setFoodItems(transformedData);
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedItems = foodItems
    .filter(item => {
      const matchesSearch = item.food_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.hotel.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterType === 'all') return matchesSearch;
      if (filterType === 'urgent') {
        const hoursUntilExpiry = (new Date(item.expiry_time).getTime() - Date.now()) / (1000 * 60 * 60);
        return matchesSearch && hoursUntilExpiry < 4;
      }
      if (filterType === 'nearby') return matchesSearch && item.distance! < 3;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'expiry') return new Date(a.expiry_time).getTime() - new Date(b.expiry_time).getTime();
      if (sortBy === 'distance') return a.distance! - b.distance!;
      if (sortBy === 'quantity') return b.quantity - a.quantity;
      return 0;
    });

  const requestFood = async (foodId: string) => {
    if (!user) {
      // Redirect to auth or show message
      return;
    }

    try {
      // Here you would implement the food request logic
      console.log('Requesting food:', foodId);
      // You might want to create a food_requests table or similar
    } catch (error) {
      console.error('Error requesting food:', error);
    }
  };

  const getUrgencyColor = (expiryTime: string) => {
    const hoursUntilExpiry = (new Date(expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilExpiry < 2) return 'bg-red-500';
    if (hoursUntilExpiry < 4) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getUrgencyText = (expiryTime: string) => {
    const hoursUntilExpiry = (new Date(expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilExpiry < 1) return 'URGENT - Expires soon!';
    if (hoursUntilExpiry < 4) return 'Pick up soon';
    return 'Available';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl">
              <Utensils className="h-8 w-8 text-green-600 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Available Food
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Fresh meals from generous restaurants and hotels, ready for pickup
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">{foodItems.length} items available</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              <span className="text-sm text-gray-600">Updated in real-time</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 bg-white/80 backdrop-blur border-2">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search food or restaurant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="urgent">Urgent (&lt; 4 hours)</SelectItem>
                  <SelectItem value="nearby">Nearby (&lt; 3 km)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="expiry">Expires Soon</SelectItem>
                  <SelectItem value="distance">Nearest</SelectItem>
                  <SelectItem value="quantity">Most Food</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={fetchAvailableFood}>
                <Timer className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300">
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{foodItems.length}</div>
              <div className="text-sm text-green-600">Total Available</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">
                {foodItems.filter(item => {
                  const hours = (new Date(item.expiry_time).getTime() - Date.now()) / (1000 * 60 * 60);
                  return hours < 4;
                }).length}
              </div>
              <div className="text-sm text-orange-600">Urgent Items</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {Math.round(foodItems.reduce((acc, item) => acc + item.distance!, 0) / foodItems.length || 0 * 10) / 10}km
              </div>
              <div className="text-sm text-blue-600">Avg Distance</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">
                {foodItems.reduce((acc, item) => acc + item.quantity, 0)}
              </div>
              <div className="text-sm text-purple-600">Total Servings</div>
            </CardContent>
          </Card>
        </div>

        {/* Food Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-20 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Food Available</h3>
              <p className="text-gray-500">Check back later for fresh meals from our partner restaurants!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedItems.map((item, index) => (
              <Card 
                key={item.id} 
                className="bg-white/80 backdrop-blur border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-bold text-gray-800">
                      {item.food_name}
                    </CardTitle>
                    <Badge 
                      className={`${getUrgencyColor(item.expiry_time)} text-white animate-pulse`}
                    >
                      {getUrgencyText(item.expiry_time)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{item.hotel.name}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {item.description && (
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span><strong>{item.quantity}</strong> servings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-green-500" />
                      <span><strong>{item.distance?.toFixed(1)}</strong> km away</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Expires {formatDistanceToNow(new Date(item.expiry_time), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-purple-500" />
                      <span className="truncate">{item.hotel.contact}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span className="font-medium">Pickup Location:</span>
                    </div>
                    <p className="text-sm text-gray-700">{item.hotel.address}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      onClick={() => requestFood(item.id)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Request Food
                    </Button>
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableFoodPage;