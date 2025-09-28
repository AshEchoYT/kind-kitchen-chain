import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  Truck, 
  Users, 
  BarChart3, 
  Plus, 
  MapPin, 
  Heart, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Award, 
  Bell, 
  Settings,
  Activity,
  Utensils
} from 'lucide-react';
import { ProfileSetup } from '@/components/profile/ProfileSetup';
import { FoodReportForm } from '@/components/food/FoodReportForm';
import { MapView } from '@/components/map/MapView';
import { NotificationSystem } from '@/components/notifications/NotificationSystem';
import { EnhancedFoodCard } from '@/components/food/EnhancedFoodCard';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';
import { loadMockData, clearAllData } from '@/utils/mockDataLoader';

interface DashboardStats {
  totalReports: number;
  activeReports: number;
  completedReports: number;
  totalAssignments?: number;
  pendingPickups?: number;
  completedDeliveries?: number;
  totalHotels?: number;
  totalAgents?: number;
}

const EnhancedDashboard = () => {
  const { user, userProfile } = useAuth();
  const [dashboardData, setDashboardData] = useState<{
    role: string;
    stats: DashboardStats;
    recentReports?: any[];
    assignments?: any[];
    recentActivity?: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    if (user && userProfile) {
      fetchDashboardData();
      checkProfileSetup();
      loadRecentTasks();
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

  const loadRecentTasks = async () => {
    try {
      let query = supabase
        .from('food_reports')
        .select(`
          *,
          hotels (name, address, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (userProfile?.role === 'agent' && profileData?.id) {
        query = query.eq('assigned_agent_id', profileData.id);
      } else if (userProfile?.role === 'hotel' && profileData?.id) {
        query = query.eq('hotel_id', profileData.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecentTasks(data || []);
    } catch (error) {
      console.error('Error loading recent tasks:', error);
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
            totalReports: 0,
            activeReports: 0,
            completedReports: 0,
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
            activeReports: allReports?.filter(r => r.status === 'new' || r.status === 'assigned').length || 0,
            completedReports: allReports?.filter(r => r.status === 'delivered').length || 0,
            totalHotels: hotels?.length || 0,
            totalAgents: agents?.length || 0,
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

  const handleTaskStatusUpdate = (taskId: string, newStatus: string) => {
    setRecentTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    
    // Refresh dashboard data
    fetchDashboardData();
    toast.success('Task status updated successfully!');
  };

  const handleLoadMockData = async () => {
    try {
      toast.info('Loading mock data...');
      const result = await loadMockData();
      
      if (result.success) {
        toast.success(`🎉 Mock data loaded! Added ${result.hotels} hotels, ${result.agents} agents, ${result.reports} food reports, ${result.needy} needy people`);
        // Refresh the dashboard data
        fetchDashboardData();
        loadRecentTasks();
      } else {
        toast.error('Failed to load mock data');
      }
    } catch (error) {
      toast.error('Error loading mock data');
      console.error('Mock data loading error:', error);
    }
  };

  const handleClearData = async () => {
    try {
      toast.info('Clearing all data...');
      const success = await clearAllData();
      
      if (success) {
        toast.success('✅ All data cleared successfully');
        // Refresh the dashboard data
        fetchDashboardData();
        loadRecentTasks();
      } else {
        toast.error('Failed to clear data');
      }
    } catch (error) {
      toast.error('Error clearing data');
      console.error('Data clearing error:', error);
    }
  };

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
            <p className="text-gray-600">Please wait while we fetch your data...</p>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {userProfile?.role === 'hotel' && <Heart className="h-8 w-8 text-orange-500 animate-pulse" />}
                {userProfile?.role === 'agent' && <Truck className="h-8 w-8 text-green-500 animate-pulse" />}
                {userProfile?.role === 'admin' && <Award className="h-8 w-8 text-purple-500 animate-pulse" />}
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {userProfile?.role === 'hotel' && 'Enhanced Hotel Dashboard'}
                  {userProfile?.role === 'agent' && 'Enhanced Agent Dashboard'}
                  {userProfile?.role === 'admin' && 'Enhanced Admin Dashboard'}
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
            <div className="flex items-center gap-4">
              {/* Mock Data Controls - Only for admin or development */}
              {(userProfile?.role === 'admin' || !user) && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLoadMockData}
                    className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Load Demo Data
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearData}
                    className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Clear Data
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setActiveTab('notifications')}>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions for Hotels */}
        {userProfile?.role === 'hotel' && activeTab === 'dashboard' && (
          <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">🍽️ Ready to help fight hunger?</h3>
                    <p className="opacity-90">Report surplus food and make a meaningful impact in your community</p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('report')}
                    variant="secondary"
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-gray-100 hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Report Food Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {dashboardData?.role === 'hotel' && (
            <>
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Reports</p>
                      <p className="text-3xl font-bold">{dashboardData?.stats?.totalReports}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Active Reports</p>
                      <p className="text-3xl font-bold">{dashboardData?.stats?.activeReports}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Completed</p>
                      <p className="text-3xl font-bold">{dashboardData?.stats?.completedReports}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Impact Rating</p>
                      <p className="text-3xl font-bold">4.8</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {dashboardData?.role === 'agent' && (
            <>
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
                      <p className="text-3xl font-bold">{dashboardData?.stats?.totalAssignments}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Pending</p>
                      <p className="text-3xl font-bold">{dashboardData?.stats?.pendingPickups}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Completed</p>
                      <p className="text-3xl font-bold">{dashboardData?.stats?.completedDeliveries}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Distance (km)</p>
                      <p className="text-3xl font-bold">{((dashboardData?.stats?.completedDeliveries || 0) * 5.2).toFixed(1)}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {dashboardData?.role === 'admin' && (
            <>
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Reports</p>
                      <p className="text-3xl font-bold">{dashboardData?.stats?.totalReports}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Hotels</p>
                      <p className="text-3xl font-bold">{dashboardData?.stats?.totalHotels}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Agents</p>
                      <p className="text-3xl font-bold">{dashboardData?.stats?.totalAgents}</p>
                    </div>
                    <Truck className="h-8 w-8 text-yellow-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Active Now</p>
                      <p className="text-3xl font-bold">{dashboardData?.stats?.activeReports}</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${
            userProfile?.role === 'agent' ? 'grid-cols-5' : 
            userProfile?.role === 'hotel' ? 'grid-cols-4' : 
            'grid-cols-3'
          }`}>
            <TabsTrigger value="dashboard">📊 Overview</TabsTrigger>
            {userProfile?.role === 'agent' && (
              <>
                <TabsTrigger value="tasks">⚡ Live Tasks</TabsTrigger>
                <TabsTrigger value="location">📍 Location</TabsTrigger>
              </>
            )}
            {userProfile?.role === 'hotel' && (
              <TabsTrigger value="report">📝 Report Food</TabsTrigger>
            )}
            <TabsTrigger value="notifications">🔔 Notifications</TabsTrigger>
            <TabsTrigger value="map">🗺️ Map View</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTasks.length > 0 ? (
                  <div className="space-y-4">
                    {recentTasks.map((task) => (
                      <EnhancedFoodCard
                        key={task.id}
                        foodReport={task}
                        onAcceptTask={(taskId) => handleTaskStatusUpdate(taskId, 'assigned')}
                        onViewDetails={(taskId) => console.log('View details:', taskId)}
                        showActions={userProfile?.role === 'agent'}
                        isAgent={userProfile?.role === 'agent'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No recent activities</p>
                    <p className="text-sm text-gray-400 mb-4">Get started by reporting food or accepting tasks</p>
                    {userProfile?.role === 'hotel' && (
                      <Button 
                        className="mt-4" 
                        onClick={() => setActiveTab('report')}
                        size="lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Report Your First Food Item
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent-specific tabs */}
          {userProfile?.role === 'agent' && (
            <>
              <TabsContent value="tasks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 animate-pulse" />
                      Available Tasks - Live Updates
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        REAL-TIME
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Truck className="h-16 w-16 mx-auto mb-4 text-blue-500 animate-bounce" />
                      <h3 className="text-xl font-semibold mb-2">Real-Time Task Board Ready!</h3>
                      <p className="text-gray-600 mb-4">Swiggy-style delivery system with live tracking</p>
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={() => window.open('/real-time-tasks', '_blank')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Open Task Board
                        </Button>
                        <Button 
                          onClick={() => window.open('/available-food', '_blank')}
                          variant="outline"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          <Utensils className="h-4 w-4 mr-2" />
                          View Food List
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 animate-pulse" />
                      GPS Location Tracking
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        HIGH ACCURACY
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <MapPin className="h-16 w-16 mx-auto mb-4 text-green-500 animate-bounce" />
                      <h3 className="text-xl font-semibold mb-2">GPS Tracking Active!</h3>
                      <p className="text-gray-600">Location tracking with arrival detection enabled</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          {/* Hotel-specific tabs */}
          {userProfile?.role === 'hotel' && (
            <TabsContent value="report" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Report Food Available for Rescue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FoodReportForm 
                    hotelId={profileData?.id || ''}
                    open={true}
                    onClose={() => setActiveTab('dashboard')}
                    onSubmit={async (reportData) => {
                      const { error } = await supabase
                        .from('food_reports')
                        .insert({
                          ...reportData,
                          hotel_id: profileData.id
                        });
                      
                      if (!error) {
                        setActiveTab('dashboard');
                        fetchDashboardData();
                        loadRecentTasks();
                        toast.success('🎉 Food report submitted successfully!');
                      } else {
                        toast.error('Failed to submit food report');
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationSystem userRole={userProfile?.role as 'hotel' | 'agent' | 'admin'} />
          </TabsContent>

          {/* Map View Tab */}
          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Live Map View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="animate-slide-up">
                  <MapView locations={mockLocations} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedDashboard;