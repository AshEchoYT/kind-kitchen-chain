import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, User, Phone, Mail, Navigation, Heart, Utensils, Loader2, MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { tamilNaduAreas } from '@/constants/tamilNadu';
import { useCity } from '@/contexts/CityContext';
import Navbar from '@/components/layout/Navbar';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

const NeedyRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const { selectedCity, setSelectedCity } = useCity();

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    streetAddress: '',
    area: '',
    landmark: '',
    city: selectedCity,
    foodType: 'any' as 'veg' | 'non-veg' | 'any',
    quantityNeeded: 1,
    preferredTime: 'anytime' as 'morning' | 'afternoon' | 'evening' | 'anytime',
    specialNotes: '',
    urgencyLevel: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setGettingLocation(false);
        console.log('Location captured:', { latitude, longitude });
      },
      (error) => {
        setError(`Location error: ${error.message}`);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, register the needy person using the existing 'beggars' table
      const { data: needyPerson, error: needyError } = await supabase
        .from('beggars')
        .insert({
          name: formData.fullName,
          contact: formData.phone,
          street: formData.streetAddress,
          city: formData.city,
          landmark: formData.landmark || null,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          preferred_food_time: formData.preferredTime,
          notes: `${formData.specialNotes ? formData.specialNotes + ' | ' : ''}Food Preference: ${formData.foodType}, Quantity: ${formData.quantityNeeded} people, Urgency: ${formData.urgencyLevel}${formData.email ? ` | Email: ${formData.email}` : ''}`
        })
        .select()
        .single();

      if (needyError) throw needyError;

      setSuccess('Registration successful! You will be notified when food is available in your area.');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/needy-dashboard');
      }, 2000);

    } catch (err: any) {
      if (err.code === '23505') {
        setError('Email already registered. Please use a different email.');
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Heart className="h-10 w-10 text-red-500 animate-pulse" />
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Request Food Assistance
                  </CardTitle>
                </div>
                <CardDescription className="text-lg text-gray-600">
                  Register to receive free surplus food from hotels across Tamil Nadu
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 border-b border-gray-200 pb-2">
                      <User className="h-6 w-6 text-blue-600" />
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-semibold">Full Name *</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="h-12"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email" className="text-sm font-semibold">Email (Optional)</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your.email@example.com (optional)"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="pl-10 h-12"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 border-b border-gray-200 pb-2">
                      <MapPin className="h-6 w-6 text-green-600" />
                      Location Details
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="streetAddress" className="text-sm font-semibold">Street Address *</Label>
                        <Input
                          id="streetAddress"
                          name="streetAddress"
                          type="text"
                          placeholder="House/Building number, Street name"
                          value={formData.streetAddress}
                          onChange={handleInputChange}
                          className="h-12"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="area" className="text-sm font-semibold">Area/Locality *</Label>
                          <Input
                            id="area"
                            name="area"
                            type="text"
                            placeholder="Area or locality name"
                            value={formData.area}
                            onChange={handleInputChange}
                            className="h-12"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="landmark" className="text-sm font-semibold">Nearby Landmark</Label>
                          <Input
                            id="landmark"
                            name="landmark"
                            type="text"
                            placeholder="Temple, School, Hospital etc."
                            value={formData.landmark}
                            onChange={handleInputChange}
                            className="h-12"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-semibold">City *</Label>
                        <Select value={formData.city} onValueChange={(value) => {
                          setFormData({...formData, city: value});
                          setSelectedCity(value);
                        }}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select your city" />
                          </SelectTrigger>
                          <SelectContent>
                            {tamilNaduAreas.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">GPS Location (Recommended for better delivery)</Label>
                        <div className="flex gap-3 items-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={getCurrentLocation}
                            disabled={gettingLocation}
                            className="flex items-center gap-2 h-12"
                          >
                            {gettingLocation ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Navigation className="h-4 w-4" />
                            )}
                            {gettingLocation ? 'Getting Location...' : 'Get Current Location'}
                          </Button>
                          {location && (
                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                              <MapIcon className="h-4 w-4" />
                              Location captured successfully!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Food Requirements */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 border-b border-gray-200 pb-2">
                      <Utensils className="h-6 w-6 text-purple-600" />
                      Food Requirements
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="foodType" className="text-sm font-semibold">Food Preference</Label>
                        <Select value={formData.foodType} onValueChange={(value: 'veg' | 'non-veg' | 'any') => setFormData({...formData, foodType: value})}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select food type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Food</SelectItem>
                            <SelectItem value="veg">Vegetarian Only</SelectItem>
                            <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quantityNeeded" className="text-sm font-semibold">People to Feed</Label>
                        <Select value={formData.quantityNeeded.toString()} onValueChange={(value) => setFormData({...formData, quantityNeeded: parseInt(value)})}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Number of people" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'person' : 'people'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="preferredTime" className="text-sm font-semibold">Preferred Time</Label>
                        <Select value={formData.preferredTime} onValueChange={(value: 'morning' | 'afternoon' | 'evening' | 'anytime') => setFormData({...formData, preferredTime: value})}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="When do you need food?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="anytime">Anytime</SelectItem>
                            <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
                            <SelectItem value="evening">Evening (6 PM - 10 PM)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="urgencyLevel" className="text-sm font-semibold">Urgency Level</Label>
                        <Select value={formData.urgencyLevel} onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => setFormData({...formData, urgencyLevel: value})}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="How urgent is your need?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="specialNotes" className="text-sm font-semibold">Special Notes (Optional)</Label>
                      <Textarea
                        id="specialNotes"
                        name="specialNotes"
                        placeholder="Any specific requirements, allergies, or health conditions..."
                        value={formData.specialNotes}
                        onChange={handleInputChange}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02]"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Register for Food Assistance'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default NeedyRegistration;