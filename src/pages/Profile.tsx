import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Shield, 
  Heart,
  Award,
  TrendingUp,
  Users,
  Truck,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    bio: userProfile?.bio || '',
    service_radius: userProfile?.service_radius || 5
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsForRole = () => {
    switch (userProfile?.role) {
      case 'hotel':
        return [
          { icon: TrendingUp, label: 'Food Reports', value: '24', color: 'text-green-600' },
          { icon: Users, label: 'People Fed', value: '320+', color: 'text-blue-600' },
          { icon: Award, label: 'Impact Score', value: '95%', color: 'text-purple-600' },
          { icon: Star, label: 'Rating', value: '4.8', color: 'text-yellow-600' }
        ];
      case 'agent':
        return [
          { icon: Truck, label: 'Deliveries', value: '47', color: 'text-green-600' },
          { icon: Clock, label: 'Hours Served', value: '156', color: 'text-blue-600' },
          { icon: Heart, label: 'Lives Touched', value: '580+', color: 'text-red-600' },
          { icon: Star, label: 'Rating', value: '4.9', color: 'text-yellow-600' }
        ];
      default:
        return [
          { icon: Heart, label: 'Contributions', value: '12', color: 'text-red-600' },
          { icon: Users, label: 'Impact', value: '48+', color: 'text-blue-600' },
          { icon: Award, label: 'Level', value: 'Bronze', color: 'text-orange-600' },
          { icon: Star, label: 'Points', value: '245', color: 'text-yellow-600' }
        ];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8 bg-white/80 backdrop-blur border-2 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-gradient-to-r from-orange-400 to-red-400">
                    <AvatarImage src={userProfile?.avatar_url} className="object-cover" />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-orange-400 to-red-400 text-white">
                      {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <Badge 
                  variant="outline" 
                  className="mt-4 capitalize px-4 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-300"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {userProfile?.role || 'User'}
                </Badge>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {userProfile?.name || 'User'}
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </p>
                    {userProfile?.phone && (
                      <p className="text-gray-600 flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4" />
                        {userProfile.phone}
                      </p>
                    )}
                    {userProfile?.address && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {userProfile.address}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "default"}
                    className={isEditing ? "" : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                {/* Bio */}
                {userProfile?.bio && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                    <p className="text-gray-700">{userProfile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <User className="h-6 w-6 text-orange-600" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="mt-1"
                        rows={4}
                        placeholder="Tell others about yourself..."
                      />
                    </div>
                    
                    {userProfile?.role === 'agent' && (
                      <div>
                        <Label htmlFor="service_radius">Service Radius (km)</Label>
                        <Input
                          id="service_radius"
                          type="number"
                          min="1"
                          max="50"
                          value={formData.service_radius}
                          onChange={(e) => setFormData({ ...formData, service_radius: parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex gap-4">
                      <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                        <p className="text-lg font-medium">{userProfile?.name || 'Not set'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">Phone</Label>
                        <p className="text-lg font-medium">{userProfile?.phone || 'Not set'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Address</Label>
                      <p className="text-lg font-medium">{userProfile?.address || 'Not set'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-500">Bio</Label>
                      <p className="text-lg font-medium">{userProfile?.bio || 'No bio added yet'}</p>
                    </div>
                    
                    {userProfile?.role === 'agent' && userProfile?.service_radius && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">Service Radius</Label>
                        <p className="text-lg font-medium">{userProfile.service_radius} km</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Impact Stats */}
            <Card className="bg-white/80 backdrop-blur border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                      <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                      <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="bg-white/80 backdrop-blur border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Verified</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Complete</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    85%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium">
                    {new Date(user?.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-orange-50"
                  onClick={() => navigate('/dashboard')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50"
                  onClick={() => navigate('/settings')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-green-50"
                  onClick={() => navigate('/')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;