import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Navigation, Building, Truck, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCity } from '@/contexts/CityContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { tamilNaduAreas } from '@/constants/tamilNadu';
import Navbar from '@/components/layout/Navbar';

const ProfileSetup = () => {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { selectedCity, setSelectedCity } = useCity();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    address: '',
    city: selectedCity, // Auto-fill with selected city from navbar
    pincode: '',
    latitude: null as number | null,
    longitude: null as number | null,
    serviceRadius: [5], // For agents only
    businessName: '', // For hotels only
    businessType: '', // For hotels only
  });

  const userRole = user?.user_metadata?.role || 'hotel';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Auto-update city when navbar city changes
  useEffect(() => {
    setProfileData(prev => ({ ...prev, city: selectedCity }));
  }, [selectedCity]);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY&limit=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const result = data.results[0];
            
            setProfileData(prev => ({
              ...prev,
              latitude,
              longitude,
              address: result.formatted || '',
              pincode: result.components.postcode || '',
            }));
          } else {
            // Fallback - just set coordinates
            setProfileData(prev => ({
              ...prev,
              latitude,
              longitude,
            }));
          }
        } catch (err) {
          // Fallback - just set coordinates
          setProfileData(prev => ({
            ...prev,
            latitude,
            longitude,
          }));
        }
        
        setLocationLoading(false);
      },
      (error) => {
        setError(`Location error: ${error.message}`);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!profileData.city) {
        setError('Please select your city from Tamil Nadu areas');
        setLoading(false);
        return;
      }

      if (userRole === 'hotel' && (!profileData.businessName || !profileData.address)) {
        setError('Please provide business name and address for hotel registration');
        setLoading(false);
        return;
      }

      if (userRole === 'agent' && (!profileData.latitude || !profileData.longitude)) {
        setError('Please enable GPS location for delivery agent registration');
        setLoading(false);
        return;
      }

      // Save profile data to Supabase (simplified for existing schema)
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          address: profileData.address,
          city: profileData.city,
          pincode: profileData.pincode,
          latitude: profileData.latitude,
          longitude: profileData.longitude,
          service_radius: userRole === 'agent' ? profileData.serviceRadius[0] : null,
          business_name: userRole === 'hotel' ? profileData.businessName : null,
          business_type: userRole === 'hotel' ? profileData.businessType : null,
          profile_completed: true
        }
      });

      if (updateError) throw updateError;

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !profileData.city) {
      setError('Please select your city first');
      return;
    }
    if (step === 2 && userRole === 'hotel' && (!profileData.businessName || !profileData.address)) {
      setError('Please provide business details');
      return;
    }
    if (step === 2 && userRole === 'agent' && (!profileData.latitude || !profileData.longitude)) {
      setError('Please enable GPS location');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-base">
              Set up your {userRole === 'hotel' ? 'Hotel Partner' : userRole === 'agent' ? 'Delivery Agent' : 'Admin'} profile for Tamil Nadu operations
            </CardDescription>
            
            {/* Progress Steps */}
            <div className="flex justify-center mt-6 space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNumber
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Location Selection */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="text-center space-y-2">
                    <MapPin className="w-12 h-12 text-orange-500 mx-auto" />
                    <h3 className="text-lg font-semibold">Select Your Location</h3>
                    <p className="text-gray-600">Choose your city in Tamil Nadu</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City/District in Tamil Nadu</Label>
                      <Select value={profileData.city} onValueChange={(value) => {
                        setProfileData({...profileData, city: value});
                        setSelectedCity(value); // Update global city context
                      }}>
                        <SelectTrigger className="border-gray-200 focus:border-orange-500">
                          <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {tamilNaduAreas.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        type="text"
                        placeholder="Enter your PIN code"
                        value={profileData.pincode}
                        onChange={handleInputChange}
                        className="border-gray-200 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={nextStep}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    disabled={!profileData.city}
                  >
                    Next Step
                  </Button>
                </div>
              )}

              {/* Step 2: Role-Specific Setup */}
              {step === 2 && userRole === 'hotel' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="text-center space-y-2">
                    <Building className="w-12 h-12 text-blue-500 mx-auto" />
                    <h3 className="text-lg font-semibold">Hotel Details</h3>
                    <p className="text-gray-600">Provide your business information</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Hotel/Restaurant Name *</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        type="text"
                        placeholder="Enter your business name"
                        value={profileData.businessName}
                        onChange={handleInputChange}
                        className="border-gray-200 focus:border-orange-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select value={profileData.businessType} onValueChange={(value) => setProfileData({...profileData, businessType: value})}>
                        <SelectTrigger className="border-gray-200 focus:border-orange-500">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="catering">Catering Service</SelectItem>
                          <SelectItem value="bakery">Bakery</SelectItem>
                          <SelectItem value="cafe">Cafe</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Complete Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Enter your complete business address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        className="border-gray-200 focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      disabled={!profileData.businessName || !profileData.address}
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && userRole === 'agent' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="text-center space-y-2">
                    <Truck className="w-12 h-12 text-green-500 mx-auto" />
                    <h3 className="text-lg font-semibold">Agent Setup</h3>
                    <p className="text-gray-600">Configure your delivery service area</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Your Address</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          placeholder="Enter your address"
                          value={profileData.address}
                          onChange={handleInputChange}
                          className="border-gray-200 focus:border-orange-500"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getCurrentLocation}
                          disabled={locationLoading}
                          className="px-3"
                        >
                          {locationLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Navigation className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Click the location button to auto-detect your address</p>
                    </div>

                    {profileData.latitude && profileData.longitude && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          GPS Location Detected: {profileData.latitude.toFixed(6)}, {profileData.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Service Radius: {profileData.serviceRadius[0]} km</Label>
                      <Slider
                        value={profileData.serviceRadius}
                        onValueChange={(value) => setProfileData({...profileData, serviceRadius: value})}
                        max={50}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Select how far you're willing to travel for food pickup and delivery
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      disabled={!profileData.latitude || !profileData.longitude}
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && userRole === 'admin' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="text-center space-y-2">
                    <CheckCircle className="w-12 h-12 text-purple-500 mx-auto" />
                    <h3 className="text-lg font-semibold">Admin Setup Complete</h3>
                    <p className="text-gray-600">You have full platform access</p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="text-center space-y-2">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <h3 className="text-lg font-semibold">Confirm Your Details</h3>
                    <p className="text-gray-600">Review and submit your profile</p>
                  </div>

                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">Role:</span>
                      <span className="capitalize">{userRole === 'hotel' ? 'Hotel Partner' : userRole === 'agent' ? 'Delivery Agent' : 'Administrator'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">City:</span>
                      <span>{profileData.city}</span>
                    </div>
                    {userRole === 'hotel' && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">Business:</span>
                          <span>{profileData.businessName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Address:</span>
                          <span>{profileData.address}</span>
                        </div>
                      </>
                    )}
                    {userRole === 'agent' && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">Service Radius:</span>
                          <span>{profileData.serviceRadius[0]} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">GPS Enabled:</span>
                          <span className="text-green-600">Yes</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Setting up...
                        </>
                      ) : (
                        'Complete Setup'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default ProfileSetup;