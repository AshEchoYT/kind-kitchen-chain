import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Route } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'hotel' | 'beggar' | 'agent';
  address?: string;
}

interface MapViewProps {
  locations?: Location[];
  center?: { lat: number; lng: number };
  onLocationSelect?: (location: Location) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  locations = [],
  center = { lat: 28.6139, lng: 77.2090 }, // Delhi default
  onLocationSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Simulated map functionality - in a real app you'd use Google Maps or Leaflet
  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  };

  const getLocationIcon = (type: Location['type']) => {
    switch (type) {
      case 'hotel':
        return '🏨';
      case 'beggar':
        return '👤';
      case 'agent':
        return '🚚';
      default:
        return '📍';
    }
  };

  const getLocationColor = (type: Location['type']) => {
    switch (type) {
      case 'hotel':
        return 'bg-primary';
      case 'beggar':
        return 'bg-accent';
      case 'agent':
        return 'bg-warning';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Live Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Simulated Map Container */}
          <div
            ref={mapRef}
            className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-muted overflow-hidden"
          >
            {/* Background pattern to simulate map */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-8 grid-rows-6 h-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-muted"></div>
                ))}
              </div>
            </div>

            {/* Location markers */}
            {locations.map((location, index) => (
              <div
                key={location.id}
                className={`absolute w-8 h-8 rounded-full ${getLocationColor(location.type)} 
                          flex items-center justify-center text-white text-xs font-bold
                          cursor-pointer hover:scale-110 transition-transform
                          animate-bounce-in shadow-lg`}
                style={{
                  left: `${20 + (index % 4) * 20}%`,
                  top: `${20 + Math.floor(index / 4) * 25}%`,
                }}
                onClick={() => handleLocationClick(location)}
              >
                {getLocationIcon(location.type)}
              </div>
            ))}

            {/* Center marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>

            {/* Map overlay message */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
                <Navigation className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Interactive Map Simulation
                </p>
                <p className="text-xs text-muted-foreground">
                  Click markers to view details
                </p>
              </div>
            </div>
          </div>

          {/* Map Controls */}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              <Route className="h-4 w-4 mr-1" />
              Plan Route
            </Button>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-1" />
              My Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Location Details */}
      {selectedLocation && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">
              {getLocationIcon(selectedLocation.type)} {selectedLocation.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Type: {selectedLocation.type.charAt(0).toUpperCase() + selectedLocation.type.slice(1)}
            </p>
            {selectedLocation.address && (
              <p className="text-sm text-muted-foreground">
                {selectedLocation.address}
              </p>
            )}
            <Button className="mt-3 w-full" size="sm">
              Navigate Here
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};