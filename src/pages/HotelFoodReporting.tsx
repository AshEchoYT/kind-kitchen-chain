import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Utensils, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  MapPin,
  Package,
  Plus,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCity } from '@/contexts/CityContext';
import Navbar from '@/components/layout/Navbar';

interface FoodReport {
  id: string;
  food_name: string;
  food_type: string;
  quantity: number;
  pickup_time: string;
  expiry_time: string;
  description: string;
  status: string;
  created_at: string;
}

const HotelFoodReporting = () => {
  const { selectedCity } = useCity();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    food_name: '',
    food_type: 'veg',
    quantity: '',
    pickup_time: '',
    expiry_hours: '4',
    description: '',
    hotel_contact: '+91 ',
    hotel_address: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Mock existing reports for demonstration
  const [existingReports] = useState<FoodReport[]>([
    {
      id: '1',
      food_name: 'Vegetable Biryani',
      food_type: 'veg',
      quantity: 20,
      pickup_time: '2024-09-28T18:00:00',
      expiry_time: '2024-09-28T22:00:00',
      description: 'Fresh biryani with raita and pickle',
      status: 'new',
      created_at: '2024-09-28T16:00:00'
    },
    {
      id: '2',
      food_name: 'Mixed Curry & Rice',
      food_type: 'veg',
      quantity: 15,
      pickup_time: '2024-09-28T19:30:00',
      expiry_time: '2024-09-28T23:30:00',
      description: 'Dal, vegetable curry, rice, chapati',
      status: 'assigned',
      created_at: '2024-09-28T17:30:00'
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Calculate expiry time
      const pickupDate = new Date(formData.pickup_time);
      const expiryDate = new Date(pickupDate.getTime() + (parseInt(formData.expiry_hours) * 60 * 60 * 1000));
      
      // In real app, you'd insert into food_reports table
      // For demo, just show success message
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuccess(true);
      setFormData({
        food_name: '',
        food_type: 'veg',
        quantity: '',
        pickup_time: '',
        expiry_hours: '4',
        description: '',
        hotel_contact: '+91 ',
        hotel_address: ''
      });
      
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to submit food report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-700">Available</Badge>;
      case 'assigned':
        return <Badge className="bg-orange-100 text-orange-700">Agent Assigned</Badge>;
      case 'picked':
        return <Badge className="bg-green-100 text-green-700">Picked Up</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500 text-white">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hotel Food Reporting</h1>
            <p className="text-gray-600">Report surplus food for pickup and distribution in {selectedCity}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Food Report Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-orange-600" />
                    Report Surplus Food
                  </CardTitle>
                  <CardDescription>
                    Help distribute unused food to those in need
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {success && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        🎉 Food report submitted successfully! Our agents will contact you soon for pickup.
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Food Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="food_name">Food Item Name *</Label>
                        <Input
                          id="food_name"
                          value={formData.food_name}
                          onChange={(e) => setFormData({...formData, food_name: e.target.value})}
                          placeholder="e.g., Chicken Biryani"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="food_type">Food Type *</Label>
                        <Select value={formData.food_type} onValueChange={(value) => setFormData({...formData, food_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="veg">🥗 Vegetarian</SelectItem>
                            <SelectItem value="non_veg">🍗 Non-Vegetarian</SelectItem>
                            <SelectItem value="snacks">🍪 Snacks</SelectItem>
                            <SelectItem value="beverages">🥤 Beverages</SelectItem>
                            <SelectItem value="dairy">🥛 Dairy</SelectItem>
                            <SelectItem value="bakery">🍞 Bakery</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quantity">Number of Portions *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                          placeholder="e.g., 25"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="expiry_hours">Food Good For (Hours) *</Label>
                        <Select value={formData.expiry_hours} onValueChange={(value) => setFormData({...formData, expiry_hours: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Hours</SelectItem>
                            <SelectItem value="4">4 Hours</SelectItem>
                            <SelectItem value="6">6 Hours</SelectItem>
                            <SelectItem value="8">8 Hours</SelectItem>
                            <SelectItem value="12">12 Hours</SelectItem>
                            <SelectItem value="24">24 Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Timing */}
                    <div>
                      <Label htmlFor="pickup_time">Available for Pickup From *</Label>
                      <Input
                        id="pickup_time"
                        type="datetime-local"
                        value={formData.pickup_time}
                        onChange={(e) => setFormData({...formData, pickup_time: e.target.value})}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                      />
                    </div>

                    {/* Hotel Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hotel_contact">Contact Number *</Label>
                        <Input
                          id="hotel_contact"
                          value={formData.hotel_contact}
                          onChange={(e) => setFormData({...formData, hotel_contact: e.target.value})}
                          placeholder="+91 9876543210"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="hotel_address">Pickup Address *</Label>
                        <Input
                          id="hotel_address"
                          value={formData.hotel_address}
                          onChange={(e) => setFormData({...formData, hotel_address: e.target.value})}
                          placeholder="Restaurant address for pickup"
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description">Additional Details</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Any special instructions, ingredients, serving suggestions..."
                        rows={3}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 h-12"
                    >
                      {loading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Submitting Report...
                        </>
                      ) : (
                        <>
                          <Utensils className="h-4 w-4 mr-2" />
                          Submit Food Report
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Existing Reports Sidebar */}
            <div>
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Your Recent Reports
                  </CardTitle>
                  <CardDescription>
                    Track status of your submitted food reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                  {existingReports.length === 0 ? (
                    <div className="text-center py-8">
                      <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No reports yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Submit your first food report using the form
                      </p>
                    </div>
                  ) : (
                    existingReports.map((report) => (
                      <Card key={report.id} className="p-4 border-l-4 border-l-orange-400">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{report.food_name}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          <p>📦 {report.quantity} portions</p>
                          <p>🕐 Pickup: {new Date(report.pickup_time).toLocaleString()}</p>
                          <p>⏰ Expires: {new Date(report.expiry_time).toLocaleString()}</p>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            Contact Agent
                          </Button>
                          {report.status === 'new' && (
                            <Button variant="ghost" size="sm" className="h-8 text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6 bg-white/95 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">12</div>
                    <div className="text-sm text-gray-600">Total Meals Donated</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">8</div>
                      <div className="text-xs text-gray-600">Delivered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">2</div>
                      <div className="text-xs text-gray-600">Active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How it Works Section */}
          <Card className="mt-8 bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4">
                  <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Utensils className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Report Food</h3>
                  <p className="text-sm text-gray-600">Submit details about surplus food available for pickup</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Phone className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Agent Contact</h3>
                  <p className="text-sm text-gray-600">Delivery agent will call you to confirm pickup details</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Food Pickup</h3>
                  <p className="text-sm text-gray-600">Agent arrives at your location to collect the food</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">4. Distribution</h3>
                  <p className="text-sm text-gray-600">Food is delivered to people in need across the city</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default HotelFoodReporting;