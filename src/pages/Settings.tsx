import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  Lock, 
  Smartphone, 
  Globe, 
  Moon, 
  Sun,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle,
  User,
  Mail,
  Key,
  Volume2
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    taskUpdates: true,
    weeklyReport: true,
    marketingEmails: false,
    
    // Privacy Settings
    profileVisibility: true,
    locationSharing: true,
    activityStatus: true,
    
    // App Settings
    darkMode: false,
    language: 'en',
    soundEnabled: true,
    autoRefresh: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    // Here you would save settings to your backend
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    // Here you would change the password
    setTimeout(() => {
      setLoading(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600">Manage your account preferences and security settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Notification Settings */}
            <Card className="bg-white/80 backdrop-blur border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <div className="text-sm text-gray-500">
                        Receive updates about tasks and activities via email
                      </div>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, emailNotifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <div className="text-sm text-gray-500">
                        Get real-time notifications on your device
                      </div>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, pushNotifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Notifications</Label>
                      <div className="text-sm text-gray-500">
                        Receive important updates via SMS
                      </div>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, smsNotifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Task Updates</Label>
                      <div className="text-sm text-gray-500">
                        Notifications about task assignments and completions
                      </div>
                    </div>
                    <Switch
                      checked={settings.taskUpdates}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, taskUpdates: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Weekly Reports</Label>
                      <div className="text-sm text-gray-500">
                        Get weekly summary of your impact and activities
                      </div>
                    </div>
                    <Switch
                      checked={settings.weeklyReport}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, weeklyReport: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="bg-white/80 backdrop-blur border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Profile Visibility</Label>
                      <div className="text-sm text-gray-500">
                        Allow other users to see your profile information
                      </div>
                    </div>
                    <Switch
                      checked={settings.profileVisibility}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, profileVisibility: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Location Sharing</Label>
                      <div className="text-sm text-gray-500">
                        Share your location for better task matching
                      </div>
                    </div>
                    <Switch
                      checked={settings.locationSharing}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, locationSharing: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Activity Status</Label>
                      <div className="text-sm text-gray-500">
                        Show when you're online and available
                      </div>
                    </div>
                    <Switch
                      checked={settings.activityStatus}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, activityStatus: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Settings */}
            <Card className="bg-white/80 backdrop-blur border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  App Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex items-center gap-3">
                      {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      <div>
                        <Label className="text-base">Dark Mode</Label>
                        <div className="text-sm text-gray-500">
                          Switch between light and dark themes
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.darkMode}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, darkMode: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex items-center gap-3">
                      <Volume2 className="h-5 w-5" />
                      <div>
                        <Label className="text-base">Sound Effects</Label>
                        <div className="text-sm text-gray-500">
                          Play sounds for notifications and actions
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, soundEnabled: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex items-center gap-3">
                      <CheckCircle className="h-5 w-5" />
                      <div>
                        <Label className="text-base">Auto Refresh</Label>
                        <div className="text-sm text-gray-500">
                          Automatically refresh data in real-time
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={settings.autoRefresh}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, autoRefresh: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="bg-white/80 backdrop-blur border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-purple-600" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Overview */}
            <Card className="bg-white/80 backdrop-blur border-2 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  Account Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <Badge variant="outline" className="capitalize">
                      {userProfile?.role || 'User'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Account Verified</span>
                  </div>
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
                  onClick={() => navigate('/profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50"
                  onClick={() => navigate('/dashboard')}
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save All Settings'}
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-white/80 backdrop-blur border-2 border-red-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 mb-4">
                  These actions cannot be undone. Please be careful.
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      // Handle account deletion
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;