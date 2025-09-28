import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Package, Truck, Users, BarChart3, Plus, MapPin, Heart, Sparkles, TrendingUp, Clock, Award } from 'lucide-react';
import { ProfileSetup } from '@/components/profile/ProfileSetup';
import { FoodReportForm } from '@/components/food/FoodReportForm';
import { MapView } from '@/components/map/MapView';
import Navbar from '@/components/layout/Navbar';

const Dashboard = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && userProfile) {
      initializeDashboard();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, userProfile, authLoading]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if profile exists
      await checkProfileSetup();
      
      // Only fetch dashboard data if profile exists
      if (profileData) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const checkProfileSetup = async () => {
    if (!user || !userProfile) return;

    try {
      let data = null;
      
      if (userProfile.role === 'hotel') {
        const result = await supabase
          .from('hotels')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid errors when no data
        
        data = result.data;
      } else if (userProfile.role === 'agent') {
        const result = await supabase
          .from('delivery_agents')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        data = result.data;
      }
      
      setProfileData(data);
      setNeedsProfileSetup(!data);
      return data;
    } catch (error) {
      console.error('Error checking profile:', error);
      setNeedsProfileSetup(true);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    if (!userProfile || !profileData) return;

    try {
      if (userProfile.role === 'hotel') {
        const { data: reports, error } = await supabase
          .from('food_reports')
          .select('*')
          .eq('hotel_id', profileData.id);
        
        if (error) throw error;
        
        setDashboardData({
          role: 'hotel',
          stats: {
            totalReports: reports?.length || 0,
            activeReports: reports?.filter(r => r.status === 'new' || r.status === 'assigned').length || 0,
            completedReports: reports?.filter(r => r.status === 'delivered').length || 0,
          },
          recentReports: reports?.slice(0, 5) || []
        });
      } else if (userProfile.role === 'agent') {
        const { data: assignments, error } = await supabase
          .from('food_reports')
          .select('*')
          .eq('assigned_agent_id', profileData.id);
        
        if (error) throw error;
        
        setDashboardData({
          role: 'agent',
          stats: {
            totalAssignments: assignments?.length || 0,
            pendingPickups: assignments?.filter(r => r.status === 'assigned').length || 0,
            completedDeliveries: assignments?.filter(r => r.status === 'delivered').length || 0,
          },
          assignments: assignments?.slice(0, 5) || []
        });
      } else if (userProfile.role === 'admin') {
        const [reportsResult, hotelsResult, agentsResult] = await Promise.all([
          supabase.from('food_reports').select('*'),
          supabase.from('hotels').select('*'),
          supabase.from('delivery_agents').select('*')
        ]);
        
        if (reportsResult.error) throw reportsResult.error;
        if (hotelsResult.error) throw hotelsResult.error;
        if (agentsResult.error) throw agentsResult.error;
        
        setDashboardData({
          role: 'admin',
          stats: {
            totalReports: reportsResult.data?.length || 0,
            totalHotels: hotelsResult.data?.length || 0,
            totalAgents: agentsResult.data?.length || 0,
            activeReports: reportsResult.data?.filter(r => r.status === 'new' || r.status === 'assigned').length || 0,
          },
          recentActivity: reportsResult.data?.slice(0, 10) || []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard statistics');
    }
  };

  // Show auth loading
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

  // Show dashboard loading
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

  // Show profile setup if needed
  if (needsProfileSetup && (userProfile?.role === 'hotel' || userProfile?.role === 'agent')) {
    return (
      <ProfileSetup 
        role={userProfile.role} 
        onComplete={() => {
          setNeedsProfileSetup(false);
          initializeDashboard();
        }} 
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{error}</p>
              <Button onClick={() => initializeDashboard()} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
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
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-300">
              <Sparkles className="h-3 w-3 mr-1" />
              {userProfile?.role || 'User'}
            </Badge>
            <p className="text-muted-foreground">
              Welcome back, {profileData?.name || userProfile?.name || user?.email}
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
                    onClick={() => setShowFoodForm(!showFoodForm)}
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

        {/* Food Report Form */}
        {showFoodForm && userProfile?.role === 'hotel' && profileData && (
          <div className="mb-8">
            <FoodReportForm 
              hotelId={profileData?.id || ''}
              open={showFoodForm}
              onClose={() => setShowFoodForm(false)}
              onSubmit={async (reportData) => {
                try {
                  const { error } = await supabase
                    .from('food_reports')
                    .insert({
                      ...reportData,
                      hotel_id: profileData.id
                    });
                  
                  if (!error) {
                    setShowFoodForm(false);
                    fetchDashboardData();
                  }
                } catch (error) {
                  console.error('Error submitting food report:', error);
                }
              }}
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardData?.role === 'hotel' && (
            <>
              <Card className="animate-bounce-in bg-white/80 backdrop-blur border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
                    <Package className="h-5 w-5 text-orange-600 animate-float" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600 mb-1">{dashboardData?.stats?.totalReports}</div>
                  <p className="text-xs text-gray-500">Food items reported</p>
                </CardContent>
              </Card>
              
              <Card className="animate-bounce-in bg-white/80 backdrop-blur border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-yellow-200" style={{animationDelay: '0.1s'}}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Reports</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg">
                    <Truck className="h-5 w-5 text-yellow-600 animate-float" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600 mb-1">{dashboardData?.stats?.activeReports}</div>
                  <p className="text-xs text-gray-500">Awaiting pickup</p>
                </CardContent>
              </Card>
              
              <Card className="animate-bounce-in bg-white/80 backdrop-blur border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-green-200" style={{animationDelay: '0.2s'}}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600 animate-float" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-1">{dashboardData?.stats?.completedReports}</div>
                  <p className="text-xs text-gray-500">Successfully delivered</p>
                </CardContent>
              </Card>
            </>
          )}

          {dashboardData?.role === 'agent' && (
            <>
              <Card className="animate-fade-in glass-card hover:scale-105 transition-transform duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                  <Package className="h-4 w-4 text-primary animate-float" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{dashboardData?.stats?.totalAssignments}</div>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in glass-card hover:scale-105 transition-transform duration-300" style={{animationDelay: '0.1s'}}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Pickups</CardTitle>
                  <Truck className="h-4 w-4 text-warning animate-float" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{dashboardData?.stats?.pendingPickups}</div>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in glass-card hover:scale-105 transition-transform duration-300" style={{animationDelay: '0.2s'}}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Deliveries</CardTitle>
                  <BarChart3 className="h-4 w-4 text-accent animate-float" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{dashboardData?.stats?.completedDeliveries}</div>
                </CardContent>
              </Card>
            </>
          )}

          {dashboardData?.role === 'admin' && (
            <>
              <Card className="animate-fade-in glass-card hover:scale-105 transition-transform duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                  <Package className="h-4 w-4 text-primary animate-float" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{dashboardData?.stats?.totalReports}</div>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in glass-card hover:scale-105 transition-transform duration-300" style={{animationDelay: '0.1s'}}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hotels</CardTitle>
                  <Users className="h-4 w-4 text-warning animate-float" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{dashboardData?.stats?.totalHotels}</div>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in glass-card hover:scale-105 transition-transform duration-300" style={{animationDelay: '0.2s'}}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Agents</CardTitle>
                  <Truck className="h-4 w-4 text-accent animate-float" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{dashboardData?.stats?.totalAgents}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Map View for All Users */}
          <div className="animate-slide-up">
            <MapView locations={mockLocations} />
          </div>

          {/* Recent Activity */}
          <Card className="animate-slide-up glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentReports?.map((report: any, index: number) => (
                  <div 
                    key={report.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-card-hover transition-colors animate-fade-in"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div>
                      <h4 className="font-medium">{report.food_name}</h4>
                      <p className="text-sm text-muted-foreground">{report.quantity} servings</p>
                    </div>
                    <Badge 
                      variant={report.status === 'new' ? 'default' : 'secondary'}
                      className="animate-pulse-glow"
                    >
                      {report.status}
                    </Badge>
                  </div>
                ))}
                
                {(!dashboardData?.recentReports || dashboardData?.recentReports.length === 0) && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-float" />
                    <p className="text-muted-foreground">No recent activity</p>
                    {userProfile?.role === 'hotel' && (
                      <Button 
                        className="mt-4" 
                        onClick={() => setShowFoodForm(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Report Your First Food Item
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;