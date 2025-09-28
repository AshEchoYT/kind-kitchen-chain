import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Building, Truck, Navigation, User } from 'lucide-react';
import { tamilNaduAreas, getCities, getAreasByCity } from '@/lib/tamilNaduAreas';

interface ProfileSetupProps {
  role: 'hotel' | 'agent';
  onComplete: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ role, onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [availableAreas, setAvailableAreas] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    street: '',
    city: '',
    landmark: '',
    area: '',
    zone: '',
    uniqueId: '',
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    if (selectedCity) {
      const areas = getAreasByCity(selectedCity);
      setAvailableAreas(areas);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (currentLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng
      }));
    }
  }, [currentLocation]);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGettingLocation(false);
          toast({
            title: "Location Found!",
            description: "Your current location has been detected.",
          });
        },
        (error) => {
          setGettingLocation(false);
          toast({
            title: "Location Error",
            description: "Could not get your location. Please enable location services.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setGettingLocation(false);
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!currentLocation && role === 'hotel') {
      toast({
        title: "Location Required",
        description: "Please allow location access or manually enter coordinates.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (role === 'hotel') {
        const { error } = await supabase.from('hotels').insert({
          user_id: user.id,
          name: formData.name,
          contact: formData.contact,
          street: formData.street,
          city: formData.city,
          landmark: formData.landmark,
          latitude: formData.latitude,
          longitude: formData.longitude,
        });
        if (error) throw error;
      } else {
        console.log('Attempting to insert agent with data:', {
          user_id: user.id,
          name: formData.name,
          contact: formData.contact,
          area: formData.area,
          zone: formData.zone,
          unique_id: formData.uniqueId,
          latitude: formData.latitude,
          longitude: formData.longitude,
        });
        
        const { error } = await supabase.from('delivery_agents').insert({
          user_id: user.id,
          name: formData.name,
          contact: formData.contact,
          area: formData.area,
          zone: formData.zone,
          unique_id: formData.uniqueId,
          latitude: formData.latitude,
          longitude: formData.longitude,
        });
        
        if (error) {
          console.error('Agent insert error:', error);
          throw error;
        }
      }

      toast({
        title: "Profile Created!",
        description: `Your ${role} profile has been set up successfully.`,
      });
      onComplete();
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cities = getCities();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl animate-bounce-in glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            {role === 'hotel' ? (
              <Building className="h-8 w-8 text-primary" />
            ) : (
              <Truck className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <p className="text-muted-foreground">
            Set up your {role} profile to get started with EllarukumFood
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  {role === 'hotel' ? 'Restaurant Name' : 'Your Name'}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={role === 'hotel' ? 'Restaurant Name' : 'Your Full Name'}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Phone Number"
                  required
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City/District</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tamil Nadu City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {availableAreas.length > 0 && (
                  <div>
                    <Label htmlFor="area">Specific Area</Label>
                    <Select 
                      value={formData.area} 
                      onValueChange={(value) => setFormData({ ...formData, area: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Area" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAreas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="street">Street Address</Label>
                <Textarea
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Complete address"
                  required
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="landmark">Landmark (Optional)</Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Nearby landmark for easy identification"
                />
              </div>

              {/* GPS Location */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>GPS Location</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="flex items-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    {gettingLocation ? 'Getting Location...' : 'Get Current Location'}
                  </Button>
                </div>
                
                {currentLocation && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-green-700">
                      📍 Location Found: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Role Specific Fields */}
            {role === 'agent' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Agent Information
                </h3>
                
                <div>
                  <Label htmlFor="uniqueId">Agent ID</Label>
                  <Input
                    id="uniqueId"
                    value={formData.uniqueId}
                    onChange={(e) => setFormData({ ...formData, uniqueId: e.target.value })}
                    placeholder="Your unique agent identifier"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="zone">Service Zone</Label>
                  <Input
                    id="zone"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    placeholder="Primary service zone"
                    required
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full gradient-hover"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};