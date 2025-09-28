import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Truck, Phone, Timer, Route } from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  name: string;
}

interface GoogleMapsTrackerProps {
  pickupLocation: Location;
  deliveryLocation?: Location;
  agentLocation: Location;
  onNavigateToPickup: () => void;
  onCallHotel: () => void;
  deliveryStatus: 'pickup' | 'transit' | 'delivered';
}

const GoogleMapsTracker: React.FC<GoogleMapsTrackerProps> = ({
  pickupLocation,
  deliveryLocation,
  agentLocation,
  onNavigateToPickup,
  onCallHotel,
  deliveryStatus
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('15 min');
  const [distance, setDistance] = useState('2.3 km');

  // Google Maps API key - you'll need to get this from Google Cloud Console
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  const loadGoogleMaps = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
    script.onload = () => {
      setMapLoaded(true);
      initializeMap();
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps');
      // Fallback to static map or error handling
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!window.google || !window.google.maps) return;

    const map = new window.google.maps.Map(document.getElementById('delivery-map'), {
      zoom: 13,
      center: { lat: agentLocation.latitude, lng: agentLocation.longitude },
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Agent marker (moving truck)
    const agentMarker = new window.google.maps.Marker({
      position: { lat: agentLocation.latitude, lng: agentLocation.longitude },
      map: map,
      title: 'Delivery Agent',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%2300ff00"%3E%3Cpath d="M20 8h-3V6c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h3v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM5 12V6h10v2H8c-1.1 0-2 .9-2 2v2H5zm13 4h-8v-6h8v6z"/%3E%3C/svg%3E',
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });

    // Pickup location marker
    const pickupMarker = new window.google.maps.Marker({
      position: { lat: pickupLocation.latitude, lng: pickupLocation.longitude },
      map: map,
      title: pickupLocation.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23ff6b35"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/%3E%3C/svg%3E',
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });

    // Delivery location marker (if available)
    if (deliveryLocation) {
      const deliveryMarker = new window.google.maps.Marker({
        position: { lat: deliveryLocation.latitude, lng: deliveryLocation.longitude },
        map: map,
        title: deliveryLocation.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%232563eb"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/%3E%3C/svg%3E',
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });
    }

    // Draw route from agent to pickup/delivery
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: deliveryStatus === 'pickup' ? '#ff6b35' : '#2563eb',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });
    directionsRenderer.setMap(map);

    const destination = deliveryStatus === 'pickup' || !deliveryLocation 
      ? { lat: pickupLocation.latitude, lng: pickupLocation.longitude }
      : { lat: deliveryLocation.latitude, lng: deliveryLocation.longitude };

    directionsService.route({
      origin: { lat: agentLocation.latitude, lng: agentLocation.longitude },
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK' && result) {
        directionsRenderer.setDirections(result);
        
        // Calculate distance and time
        const route = result.routes[0];
        if (route && route.legs[0]) {
          setDistance(route.legs[0].distance?.text || '2.3 km');
          setEstimatedTime(route.legs[0].duration?.text || '15 min');
        }
      }
    });

    // Fit map to show all markers
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: agentLocation.latitude, lng: agentLocation.longitude });
    bounds.extend({ lat: pickupLocation.latitude, lng: pickupLocation.longitude });
    if (deliveryLocation) {
      bounds.extend({ lat: deliveryLocation.latitude, lng: deliveryLocation.longitude });
    }
    map.fitBounds(bounds);
  };

  const openInGoogleMaps = () => {
    const destination = deliveryStatus === 'pickup' || !deliveryLocation 
      ? `${pickupLocation.latitude},${pickupLocation.longitude}`
      : `${deliveryLocation!.latitude},${deliveryLocation!.longitude}`;
    
    const url = `https://www.google.com/maps/dir/${agentLocation.latitude},${agentLocation.longitude}/${destination}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Real-Time Tracking
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{estimatedTime}</span>
              <span className="text-gray-500">•</span>
              <span>{distance}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            id="delivery-map" 
            className="w-full h-64 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            {!mapLoaded && (
              <div className="text-center">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                <p className="text-gray-500">Loading interactive map...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={openInGoogleMaps}
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          Open in Maps
        </Button>
        
        <Button 
          onClick={onCallHotel}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          Call Restaurant
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${deliveryStatus === 'pickup' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}>
          <CardContent className="p-4 text-center">
            <MapPin className={`h-6 w-6 mx-auto mb-2 ${deliveryStatus === 'pickup' ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
            <div className="text-sm font-medium">Pickup Location</div>
            <div className="text-xs text-gray-600">{pickupLocation.name}</div>
          </CardContent>
        </Card>

        <Card className={`${deliveryStatus === 'transit' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
          <CardContent className="p-4 text-center">
            <Truck className={`h-6 w-6 mx-auto mb-2 ${deliveryStatus === 'transit' ? 'text-blue-500 animate-bounce' : 'text-gray-400'}`} />
            <div className="text-sm font-medium">In Transit</div>
            <div className="text-xs text-gray-600">On the way</div>
          </CardContent>
        </Card>

        <Card className={`${deliveryStatus === 'delivered' ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
          <CardContent className="p-4 text-center">
            <Route className={`h-6 w-6 mx-auto mb-2 ${deliveryStatus === 'delivered' ? 'text-green-500' : 'text-gray-400'}`} />
            <div className="text-sm font-medium">Delivered</div>
            <div className="text-xs text-gray-600">
              {deliveryLocation ? deliveryLocation.name : 'Destination'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fallback if Google Maps fails */}
      {!mapLoaded && GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Google Maps Integration</span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              To enable real-time map tracking, add your Google Maps API key to environment variables.
              For now, using navigation buttons to open external maps.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoogleMapsTracker;