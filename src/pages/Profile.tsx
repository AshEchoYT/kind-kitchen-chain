import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Save, X, User, Mail, Phone, MapPin, Star, BarChart3, Package, Users, Truck, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileStats {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const ProfilePage = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    bio: userProfile?.bio || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatsForRole = (): ProfileStats[] => {
    switch (userProfile?.role) {
      case 'hotel':
        return [
          {
            title: "Food Reports",
            value: 23,
            icon: <Package className="h-5 w-5" />,
            color: "text-orange-600"
          },
          {
            title: "People Fed",
            value: 456,
            icon: <Users className="h-5 w-5" />,
            color: "text-green-600"
          },
          {
            title: "Rating",
            value: 4.8,
            icon: <Star className="h-5 w-5" />,
            color: "text-yellow-600"
          }
        ];
      case 'agent':
        return [
          {
            title: "Deliveries",
            value: 128,
            icon: <Truck className="h-5 w-5" />,
            color: "text-blue-600"
          },
          {
            title: "People Helped",
            value: 892,
            icon: <Users className="h-5 w-5" />,
            color: "text-green-600"
          },
          {
            title: "Rating",
            value: 4.9,
            icon: <Star className="h-5 w-5" />,
            color: "text-yellow-600"
          }
        ];
      default:
        return [
          {
            title: "Days Active",
            value: 30,
            icon: <Calendar className="h-5 w-5" />,
            color: "text-purple-600"
          },
          {
            title: "Impact Score",
            value: 95,
            icon: <BarChart3 className="h-5 w-5" />,
            color: "text-green-600"
          }
        ];
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading Profile...</h2>
          <p className="text-gray-600 mt-2">Please wait while we fetch your profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <Button
                  variant={isEditing ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                      setFormData({
                        name: userProfile?.name || '',
                        phone: userProfile?.phone || '',
                        address: userProfile?.address || '',
                        bio: userProfile?.bio || ''
                      });
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="text-xl">
                        {userProfile?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{userProfile.name}</h3>
                      <Badge variant="outline" className="capitalize">
                        {userProfile.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Form Fields */}
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          className="mt-1"
                          rows={3}
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                      
                      {userProfile.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <span>{userProfile.phone}</span>
                        </div>
                      )}
                      
                      {userProfile.address && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <span>{userProfile.address}</span>
                        </div>
                      )}
                      
                      {userProfile.bio && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Bio</h4>
                          <p className="text-gray-600">{userProfile.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Activity */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getStatsForRole().map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={stat.color}>
                          {stat.icon}
                        </div>
                        <span className="text-sm text-gray-600">{stat.title}</span>
                      </div>
                      <span className="text-lg font-semibold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since</span>
                    <span>{new Date(userProfile.created_at || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role</span>
                    <Badge variant="outline" className="capitalize">
                      {userProfile.role}
                    </Badge>
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

export default ProfilePage;