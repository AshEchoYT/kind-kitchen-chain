import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Package, Truck, Users, BarChart3, Plus, MapPin, Heart, Sparkles, TrendingUp, Clock, Award } from 'lucide-react';
import { ProfileSetup } from '@/components/profile/ProfileSetup';
import { MapView } from '@/components/map/MapView';
import Navbar from '@/components/layout/Navbar';

const Dashboard = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center animate-fade-in-up">
            <div className="w-16 h-16 relative mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
              <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-orange-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Checking Authentication...</h3>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center animate-fade-in-up">
            <div className="w-16 h-16 relative mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
              <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-orange-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Setting up your personalized experience...</p>
          </div>
        </div>
      </div>
    );
  }

  const mockLocations = [
    { id: '1', name: 'Hotel Paradise', lat: 28.6139, lng: 77.2090, type: 'hotel' as const, address: 'CP, Delhi' },
    { id: '2', name: 'Food Point', lat: 28.6129, lng: 77.2095, type: 'beggar' as const, address: 'Near Metro' },
    { id: '3', name: 'Agent Ram', lat: 28.6149, lng: 77.2085, type: 'agent' as const, address: 'On Route' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            {userProfile?.role === 'hotel' && <Heart className="h-8 w-8 text-orange-500 animate-pulse" />}
            {userProfile?.role === 'agent' && <Truck className="h-8 w-8 text-green-500 animate-pulse" />}
            {userProfile?.role === 'admin' && <Award className="h-8 w-8 text-purple-500 animate-pulse" />}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {userProfile?.role === 'hotel' && 'Hotel Dashboard'}
              {userProfile?.role === 'agent' && 'Agent Dashboard'}
              {userProfile?.role === 'admin' && 'Admin Dashboard'}
              {!userProfile?.role && 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-300">
              <Sparkles className="h-3 w-3 mr-1" />
              {userProfile?.role || 'User'}
            </Badge>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.name || user?.email}
            </p>
          </div>
        </div>

        {/* Quick Actions for Hotels */}
        {userProfile?.role === 'hotel' && (
          <div className="mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Ready to help?</h3>
                    <p className="opacity-90">Report surplus food and make a difference</p>
                  </div>
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-gray-100 hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Report Food
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="animate-bounce-in bg-white/80 backdrop-blur border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
              <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-1">0</div>
              <p className="text-xs text-gray-500">Food items reported</p>
            </CardContent>
          </Card>
          
          <Card className="animate-bounce-in bg-white/80 backdrop-blur border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-yellow-200" style={{animationDelay: '0.1s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Reports</CardTitle>
              <div className="p-2 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg">
                <Truck className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 mb-1">0</div>
              <p className="text-xs text-gray-500">Awaiting pickup</p>
            </CardContent>
          </Card>
          
          <Card className="animate-bounce-in bg-white/80 backdrop-blur border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-green-200" style={{animationDelay: '0.2s'}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-1">0</div>
              <p className="text-xs text-gray-500">Successfully delivered</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Map View */}
          <div className="animate-slide-up">
            <MapView locations={mockLocations} />
          </div>

          {/* Recent Activity */}
          <Card className="animate-slide-up bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                  {userProfile?.role === 'hotel' && (
                    <Button 
                      className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" 
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Report Your First Food Item
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;