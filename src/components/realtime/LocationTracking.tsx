import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Navigation, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Square,
  Smartphone,
  Satellite
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

interface LocationTrackingProps {
  taskId: string;
  taskStatus: 'assigned' | 'picked' | 'delivered';
  restaurantLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deliveryLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onLocationUpdate?: (location: LocationData) => void;
  onArrival?: (locationType: 'pickup' | 'delivery') => void;
}

export const LocationTracking: React.FC<LocationTrackingProps> = ({
  taskId,
  taskStatus,
  restaurantLocation,
  deliveryLocation,
  onLocationUpdate,
  onArrival
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [watchId, setWatchId] = useState<number | null>(null);
  const [distanceToPickup, setDistanceToPickup] = useState<number | null>(null);
  const [distanceToDelivery, setDistanceToDelivery] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // Arrival detection thresholds (in meters)
  const ARRIVAL_THRESHOLD = 50; // 50 meters
  const HIGH_ACCURACY_THRESHOLD = 20; // 20 meters

  useEffect(() => {
    checkLocationPermission();
    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    if (currentLocation) {
      calculateDistances();
      checkForArrival();
      updateLocationInDatabase();
    }
  }, [currentLocation, restaurantLocation, deliveryLocation]);

  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your device doesn't support location tracking.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(permission.state);
      
      permission.addEventListener('change', () => {
        setLocationPermission(permission.state);
      });
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000, // 30 seconds
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        };

        setCurrentLocation(locationData);
        setAccuracy(position.coords.accuracy);
        
        if (onLocationUpdate) {
          onLocationUpdate(locationData);
        }
      },
      (error) => {
        console.error('Location error:', error);
        let message = "Unable to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location permissions.";
            setLocationPermission('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      options
    );

    setWatchId(watchId);
    setIsTracking(true);
    
    toast({
      title: "🛰️ Tracking Started",
      description: "Your location is now being tracked for this delivery.",
    });
  }, [onLocationUpdate, toast]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    
    toast({
      title: "Tracking Stopped",
      description: "Location tracking has been turned off.",
    });
  }, [watchId, toast]);

  const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const calculateDistances = () => {
    if (!currentLocation) return;

    if (restaurantLocation) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        restaurantLocation.latitude,
        restaurantLocation.longitude
      );
      setDistanceToPickup(distance);
    }

    if (deliveryLocation) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        deliveryLocation.latitude,
        deliveryLocation.longitude
      );
      setDistanceToDelivery(distance);
    }
  };

  const checkForArrival = () => {
    if (!currentLocation || !accuracy) return;

    // Only check for arrival if accuracy is good enough
    if (accuracy > HIGH_ACCURACY_THRESHOLD * 2) return;

    // Check pickup arrival
    if (taskStatus === 'assigned' && distanceToPickup && distanceToPickup <= ARRIVAL_THRESHOLD) {
      if (onArrival) {
        onArrival('pickup');
      }
      toast({
        title: "📍 Arrived at Restaurant",
        description: "You've arrived at the pickup location!",
      });
    }

    // Check delivery arrival
    if (taskStatus === 'picked' && distanceToDelivery && distanceToDelivery <= ARRIVAL_THRESHOLD) {
      if (onArrival) {
        onArrival('delivery');
      }
      toast({
        title: "🎯 Arrived at Destination",
        description: "You've reached the delivery location!",
      });
    }
  };

  const updateLocationInDatabase = async () => {
    if (!currentLocation || !user) return;

    try {
      // For now, we'll store location updates in the delivery_agents table
      // In production, we'd use the dedicated agent_locations table
      const { error } = await supabase
        .from('delivery_agents')
        .update({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating location:', error);
      }
    } catch (error) {
      console.error('Database error:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      setLocationPermission('granted');
      startTracking();
    } catch (error: any) {
      setLocationPermission('denied');
      toast({
        title: "Permission Denied",
        description: "Please enable location access in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const getAccuracyStatus = () => {
    if (!accuracy) return { status: 'unknown', color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
    
    if (accuracy <= HIGH_ACCURACY_THRESHOLD) {
      return { status: 'high', color: 'bg-green-100 text-green-800', text: 'High Precision' };
    } else if (accuracy <= HIGH_ACCURACY_THRESHOLD * 3) {
      return { status: 'medium', color: 'bg-yellow-100 text-yellow-800', text: 'Medium Precision' };
    } else {
      return { status: 'low', color: 'bg-red-100 text-red-800', text: 'Low Precision' };
    }
  };

  const formatDistance = (distance: number | null): string => {
    if (!distance) return 'Unknown';
    
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const accuracyStatus = getAccuracyStatus();

  return (
    <div className="space-y-4">
      {/* Location Permission */}
      {locationPermission !== 'granted' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Location access is required for delivery tracking.</span>
            <Button 
              size="sm" 
              onClick={requestLocationPermission}
              className="ml-2"
            >
              Enable Location
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tracking Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              Location Tracking
            </div>
            <div className="flex items-center gap-2">
              {isTracking && (
                <Badge className="bg-green-100 text-green-800 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  LIVE
                </Badge>
              )}
              <Badge className={accuracyStatus.color}>
                {accuracyStatus.text}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {currentLocation && (
                <div className="text-sm">
                  <div className="font-medium">Current Location</div>
                  <div className="text-muted-foreground">
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </div>
                  {accuracy && (
                    <div className="text-xs text-muted-foreground">
                      Accuracy: ±{Math.round(accuracy)}m
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isTracking ? (
                <Button 
                  onClick={startTracking}
                  disabled={locationPermission !== 'granted'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Tracking
                </Button>
              ) : (
                <Button 
                  onClick={stopTracking}
                  variant="outline"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Tracking
                </Button>
              )}
            </div>
          </div>

          {/* Distance Information */}
          {isTracking && currentLocation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurantLocation && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          Pickup Location
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {restaurantLocation.address}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatDistance(distanceToPickup)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {distanceToPickup && distanceToPickup <= ARRIVAL_THRESHOLD && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Arrived
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {deliveryLocation && (
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          <Target className="h-4 w-4 text-green-600" />
                          Delivery Location
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {deliveryLocation.address}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatDistance(distanceToDelivery)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {distanceToDelivery && distanceToDelivery <= ARRIVAL_THRESHOLD && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Arrived
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {currentLocation && (
            <div className="flex gap-2 mt-4">
              {restaurantLocation && taskStatus === 'assigned' && (
                <Button
                  variant="outline"
                  onClick={() => window.open(
                    `https://maps.google.com/maps/dir/${currentLocation.latitude},${currentLocation.longitude}/${restaurantLocation.latitude},${restaurantLocation.longitude}`,
                    '_blank'
                  )}
                  className="flex-1"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate to Pickup
                </Button>
              )}
              
              {deliveryLocation && taskStatus === 'picked' && (
                <Button
                  variant="outline"
                  onClick={() => window.open(
                    `https://maps.google.com/maps/dir/${currentLocation.latitude},${currentLocation.longitude}/${deliveryLocation.latitude},${deliveryLocation.longitude}`,
                    '_blank'
                  )}
                  className="flex-1"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate to Delivery
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Tips */}
      <Alert>
        <Smartphone className="h-4 w-4" />
        <AlertDescription>
          <strong>Location Tips:</strong> Keep your phone charged and ensure GPS is enabled for accurate tracking. 
          Location data helps restaurants and recipients know when to expect you.
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Create the agent_locations table migration
export const createLocationTrackingMigration = `
-- Create agent_locations table for real-time location tracking
CREATE TABLE IF NOT EXISTS agent_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES food_reports(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2) DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, task_id)
);

-- Create indexes for performance
CREATE INDEX idx_agent_locations_agent_id ON agent_locations(agent_id);
CREATE INDEX idx_agent_locations_task_id ON agent_locations(task_id);
CREATE INDEX idx_agent_locations_timestamp ON agent_locations(timestamp);

-- Enable RLS
ALTER TABLE agent_locations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Agents can insert their own locations" ON agent_locations
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own locations" ON agent_locations
  FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "Users can view locations for their tasks" ON agent_locations
  FOR SELECT USING (
    auth.uid() = agent_id OR 
    EXISTS (
      SELECT 1 FROM food_reports fr 
      JOIN hotels h ON fr.hotel_id = h.id 
      WHERE fr.id = agent_locations.task_id 
      AND h.user_id = auth.uid()
    )
  );
`;