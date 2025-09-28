import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Camera, 
  CheckCircle,
  Clock,
  Truck,
  ArrowRight,
  Star,
  MessageCircle,
  Route,
  Timer,
  Package,
  Users,
  AlertTriangle
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface DeliveryDetails {
  id: string;
  food_name: string;
  quantity: number;
  description: string;
  pickup_time: string;
  expiry_time: string;
  status: string;
  hotel: {
    name: string;
    contact: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  estimated_earnings: number;
}

const SwiggyDeliveryFlow = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'pickup' | 'transit' | 'delivered'>('pickup');
  const [pickupPhoto, setPickupPhoto] = useState<string | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(15); // minutes
  const [startTime] = useState(new Date());

  // Simulated location tracking
  const [agentLocation, setAgentLocation] = useState({
    latitude: 28.6139,
    longitude: 77.2090
  });

  useEffect(() => {
    if (!taskId) {
      navigate('/agent-task-board');
      return;
    }

    fetchDeliveryDetails();
    startLocationTracking();

    return () => {
      // Cleanup location tracking
    };
  }, [taskId]);

  const fetchDeliveryDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels (
            name,
            contact,
            street,
            city,
            landmark,
            latitude,
            longitude
          )
        `)
        .eq('id', taskId)
        .single();

      if (error) throw error;

      const transformed = {
        id: data.id,
        food_name: data.food_name,
        quantity: data.quantity,
        description: data.description || '',
        pickup_time: data.pickup_time,
        expiry_time: data.expiry_time,
        status: data.status,
        hotel: {
          name: data.hotels?.name || 'Unknown Hotel',
          contact: data.hotels?.contact || '',
          address: `${data.hotels?.street || ''}, ${data.hotels?.city || ''}${data.hotels?.landmark ? ', ' + data.hotels.landmark : ''}`.replace(/^, |, $/, ''),
          latitude: data.hotels?.latitude,
          longitude: data.hotels?.longitude
        },
        estimated_earnings: 150 // Mock calculation
      };

      setDeliveryDetails(transformed);
      
      // Set current step based on status
      if (data.status === 'assigned') setCurrentStep('pickup');
      else if (data.status === 'picked') setCurrentStep('transit');
      else if (data.status === 'delivered') setCurrentStep('delivered');

    } catch (error) {
      console.error('Error fetching delivery details:', error);
      toast.error('Failed to load delivery details');
      navigate('/agent-task-board');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setAgentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.error('Location tracking error:', error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  };

  const startPickup = async () => {
    try {
      await supabase
        .from('food_reports')
        .update({ status: 'picked' })
        .eq('id', taskId);

      setCurrentStep('transit');
      toast.success('🚚 Pickup started! Navigate to delivery location');
    } catch (error) {
      console.error('Error starting pickup:', error);
      toast.error('Failed to start pickup');
    }
  };

  const completeDelivery = async () => {
    if (!deliveryPhoto) {
      toast.error('Please take a delivery confirmation photo');
      return;
    }

    try {
      await supabase
        .from('food_reports')
        .update({ 
          status: 'delivered',
          notes: notes 
        })
        .eq('id', taskId);

      setCurrentStep('delivered');
      toast.success('🎉 Delivery completed! Great job!');
      
      setTimeout(() => {
        navigate('/agent-task-board');
      }, 3000);
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error('Failed to complete delivery');
    }
  };

  const takePhoto = (type: 'pickup' | 'delivery') => {
    // In a real app, this would open camera
    const mockPhotoUrl = `https://via.placeholder.com/300x200?text=${type}+Photo`;
    
    if (type === 'pickup') {
      setPickupPhoto(mockPhotoUrl);
      toast.success('📸 Pickup photo captured!');
    } else {
      setDeliveryPhoto(mockPhotoUrl);
      toast.success('📸 Delivery photo captured!');
    }
  };

  const openMaps = () => {
    if (deliveryDetails?.hotel.latitude && deliveryDetails?.hotel.longitude) {
      const url = `https://www.google.com/maps/dir/${agentLocation.latitude},${agentLocation.longitude}/${deliveryDetails.hotel.latitude},${deliveryDetails.hotel.longitude}`;
      window.open(url, '_blank');
    } else {
      toast.error('Location not available');
    }
  };

  const callHotel = () => {
    if (deliveryDetails?.hotel.contact) {
      window.location.href = `tel:${deliveryDetails.hotel.contact}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Truck className="h-16 w-16 text-blue-500 animate-bounce mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Delivery Details</h3>
            <p className="text-gray-600">Preparing your delivery journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!deliveryDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-600 mb-2">Delivery Not Found</h3>
              <p className="text-gray-600 mb-4">This delivery task could not be loaded.</p>
              <Button onClick={() => navigate('/agent-task-board')}>
                Back to Task Board
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Delivery in Progress</h1>
                  <p className="opacity-90">Task ID: {taskId?.slice(0, 8)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">₹{deliveryDetails.estimated_earnings}</div>
                <div className="text-sm opacity-90">Estimated Earnings</div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${currentStep === 'pickup' ? 'text-yellow-200' : 'text-white'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'pickup' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {currentStep === 'pickup' ? <Package className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                </div>
                <span className="font-medium">Pickup</span>
              </div>
              
              <div className="flex-1 h-1 bg-white/30 mx-4">
                <div className={`h-full transition-all duration-500 ${
                  currentStep === 'pickup' ? 'w-0 bg-yellow-500' : 'w-full bg-green-500'
                }`}></div>
              </div>
              
              <div className={`flex items-center gap-2 ${currentStep === 'transit' ? 'text-yellow-200' : currentStep === 'delivered' ? 'text-white' : 'text-white/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'transit' ? 'bg-yellow-500' : 
                  currentStep === 'delivered' ? 'bg-green-500' : 'bg-white/30'
                }`}>
                  {currentStep === 'delivered' ? <CheckCircle className="h-4 w-4" /> : <Route className="h-4 w-4" />}
                </div>
                <span className="font-medium">In Transit</span>
              </div>
              
              <div className="flex-1 h-1 bg-white/30 mx-4">
                <div className={`h-full transition-all duration-500 ${
                  currentStep === 'delivered' ? 'w-full bg-green-500' : 'w-0 bg-yellow-500'
                }`}></div>
              </div>
              
              <div className={`flex items-center gap-2 ${currentStep === 'delivered' ? 'text-white' : 'text-white/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'delivered' ? 'bg-green-500' : 'bg-white/30'
                }`}>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="font-medium">Delivered</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delivery Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-500" />
                  Food Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{deliveryDetails.food_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{deliveryDetails.quantity} servings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span>Expires {formatDistanceToNow(new Date(deliveryDetails.expiry_time), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                
                {deliveryDetails.description && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{deliveryDetails.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{deliveryDetails.hotel.name}</h3>
                  <p className="text-gray-600">{deliveryDetails.hotel.address}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={openMaps} className="flex-1">
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>
                  <Button onClick={callHotel} variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6 text-center">
                <Timer className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">
                  {Math.max(0, estimatedTime - Math.floor((Date.now() - startTime.getTime()) / 60000))} min
                </div>
                <div className="text-sm text-gray-600">Estimated time remaining</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            {currentStep === 'pickup' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-purple-500" />
                    Pickup Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Package className="h-4 w-4" />
                    <AlertDescription>
                      Please verify the food items match the order and take a photo before pickup.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => takePhoto('pickup')}
                      variant="outline"
                      className="w-full"
                      disabled={!!pickupPhoto}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {pickupPhoto ? '✅ Photo Captured' : 'Take Pickup Photo'}
                    </Button>

                    {pickupPhoto && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <img src={pickupPhoto} alt="Pickup verification" className="w-full h-40 object-cover rounded-lg" />
                      </div>
                    )}

                    <Button 
                      onClick={startPickup}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                      disabled={!pickupPhoto}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Pickup & Start Transit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 'transit' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5 text-blue-500" />
                    In Transit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Truck className="h-4 w-4" />
                    <AlertDescription>
                      You're on the way! Take a delivery confirmation photo when you reach the destination.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => takePhoto('delivery')}
                      variant="outline"
                      className="w-full"
                      disabled={!!deliveryPhoto}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {deliveryPhoto ? '✅ Delivery Photo Captured' : 'Take Delivery Photo'}
                    </Button>

                    {deliveryPhoto && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <img src={deliveryPhoto} alt="Delivery confirmation" className="w-full h-40 object-cover rounded-lg" />
                      </div>
                    )}

                    <textarea
                      placeholder="Add delivery notes (optional)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                    />

                    <Button 
                      onClick={completeDelivery}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                      disabled={!deliveryPhoto}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Delivery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 'delivered' && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Delivery Completed! 🎉</h3>
                  <p className="text-green-600 mb-4">Great job! You've successfully delivered the food.</p>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-2xl font-bold text-green-600">₹{deliveryDetails.estimated_earnings}</div>
                    <div className="text-sm text-gray-600">Earned from this delivery</div>
                  </div>
                  <Button onClick={() => navigate('/agent-task-board')}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Back to Task Board
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Real-time Updates */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  Live Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">Agent location updated</span>
                    <span className="text-xs text-gray-400 ml-auto">Just now</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Task accepted</span>
                    <span className="text-xs text-gray-400 ml-auto">2 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwiggyDeliveryFlow;