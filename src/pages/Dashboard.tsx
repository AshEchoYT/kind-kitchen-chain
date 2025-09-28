import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Package, Truck, Users, BarChart3, Plus, MapPin, Heart, Sparkles } from 'lucide-react';
import { ProfileSetup } from '@/components/profile/ProfileSetup';
import { FoodReportForm } from '@/components/food/FoodReportForm';
import { MapView } from '@/components/map/MapView';

export const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  useEffect(() => {
    if (user && userProfile) {
      fetchDashboardData();
      checkProfileSetup();
    }
  }, [user, userProfile]);

  const checkProfileSetup = async () => {
    if (!user || !userProfile) return;

    try {
      if (userProfile.role === 'hotel') {
        const { data } = await supabase
          .from('hotels')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setProfileData(data);
        setNeedsProfileSetup(!data);
      } else if (userProfile.role === 'agent') {
        const { data } = await supabase
          .from('delivery_agents')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setProfileData(data);
        setNeedsProfileSetup(!data);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setNeedsProfileSetup(true);
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (userProfile?.role === 'hotel') {
        const { data: reports } = await supabase
          .from('food_reports')
          .select('*')
          .eq('hotel_id', profileData?.id);
        
        setDashboardData({
          role: 'hotel',
          stats: {
            totalReports: reports?.length || 0,
            activeReports: reports?.filter(r => r.status === 'new' || r.status === 'assigned').length || 0,
            completedReports: reports?.filter(r => r.status === 'delivered').length || 0,
          },
          recentReports: reports?.slice(0, 5) || []
        });
      } else if (userProfile?.role === 'agent') {
        const { data: assignments } = await supabase
          .from('food_reports')
          .select('*')
          .eq('assigned_agent_id', profileData?.id);
        
        setDashboardData({
          role: 'agent',
          stats: {
            totalAssignments: assignments?.length || 0,
            pendingPickups: assignments?.filter(r => r.status === 'assigned').length || 0,
            completedDeliveries: assignments?.filter(r => r.status === 'delivered').length || 0,
          },
          assignments: assignments?.slice(0, 5) || []
        });
      } else if (userProfile?.role === 'admin') {
        const { data: allReports } = await supabase
          .from('food_reports')
          .select('*');
        
        const { data: hotels } = await supabase
          .from('hotels')
          .select('*');
        
        const { data: agents } = await supabase
          .from('delivery_agents')
          .select('*');
        
        setDashboardData({
          role: 'admin',
          stats: {
            totalReports: allReports?.length || 0,
            totalHotels: hotels?.length || 0,
            totalAgents: agents?.length || 0,
            activeReports: allReports?.filter(r => r.status === 'new' || r.status === 'assigned').length || 0,
          },
          recentActivity: allReports?.slice(0, 10) || []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (needsProfileSetup && (userProfile?.role === 'hotel' || userProfile?.role === 'agent')) {
    return (
      <ProfileSetup 
        role={userProfile.role} 
        onComplete={() => {
          setNeedsProfileSetup(false);
          checkProfileSetup();
        }} 
      />
    );
  }

  const mockLocations = [
    { id: '1', name: 'Hotel Paradise', lat: 28.6139, lng: 77.2090, type: 'hotel' as const, address: 'CP, Delhi' },
    { id: '2', name: 'Food Point', lat: 28.6129, lng: 77.2095, type: 'beggar' as const, address: 'Near Metro' },
    { id: '3', name: 'Agent Ram', lat: 28.6149, lng: 77.2085, type: 'agent' as const, address: 'On Route' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground text-shadow">
            {userProfile?.role === 'hotel' && '🏨 Hotel Dashboard'}
            {userProfile?.role === 'agent' && '🚚 Agent Dashboard'}
            {userProfile?.role === 'admin' && '⚙️ Admin Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profileData?.name || userProfile?.name || user?.email}
          </p>
        </div>

        {/* Quick Actions */}
        {userProfile?.role === 'hotel' && (
          <div className="mb-6">
            <Button 
              onClick={() => setShowFoodForm(!showFoodForm)}
              className="gradient-hover animate-pulse-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Surplus Food
            </Button>
          </div>
        )}

        {/* Food Report Form */}
        {showFoodForm && userProfile?.role === 'hotel' && profileData && (
          <div className="mb-8">
            <FoodReportForm 
              hotelId={profileData.id} 
              onSuccess={() => {
                setShowFoodForm(false);
                fetchDashboardData();
              }} 
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardData?.role === 'hotel' && (
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
                  <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
                  <Truck className="h-4 w-4 text-warning animate-float" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{dashboardData?.stats?.activeReports}</div>
                </CardContent>
              </Card>
              
              <Card className="animate-fade-in glass-card hover:scale-105 transition-transform duration-300" style={{animationDelay: '0.2s'}}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <BarChart3 className="h-4 w-4 text-accent animate-float" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{dashboardData?.stats?.completedReports}</div>
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
          {/* Map View for Agents */}
          {userProfile?.role === 'agent' && (
            <div className="animate-slide-up">
              <MapView locations={mockLocations} />
            </div>
          )}

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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full width map for admin */}
        {userProfile?.role === 'admin' && (
          <div className="animate-slide-up">
            <MapView locations={mockLocations} />
          </div>
        )}
      </div>
    </div>
  );
};