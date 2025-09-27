import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Utensils, 
  Package, 
  MapPin, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  User,
  Truck
} from 'lucide-react';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    recentReports: [],
    stats: {},
    tasks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchDashboardData();
  }, [user, userProfile]);

  const fetchDashboardData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      
      if (userProfile.role === 'hotel') {
        await fetchHotelDashboard();
      } else if (userProfile.role === 'agent') {
        await fetchAgentDashboard();
      } else if (userProfile.role === 'admin') {
        await fetchAdminDashboard();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelDashboard = async () => {
    // Fetch hotel's food reports
    const { data: hotel } = await supabase
      .from('hotels')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!hotel) return;

    const { data: reports } = await supabase
      .from('food_reports')
      .select('*')
      .eq('hotel_id', hotel.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: stats } = await supabase
      .from('food_reports')
      .select('status')
      .eq('hotel_id', hotel.id);

    const statusCounts = stats?.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {}) || {};

    setDashboardData({
      recentReports: reports || [],
      stats: statusCounts,
      tasks: []
    });
  };

  const fetchAgentDashboard = async () => {
    // Fetch agent's assigned tasks
    const { data: agent } = await supabase
      .from('delivery_agents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!agent) return;

    const { data: assignedReports } = await supabase
      .from('food_reports')
      .select(`
        *,
        hotels (name, street, city)
      `)
      .eq('assigned_agent_id', agent.id)
      .in('status', ['assigned', 'picked'])
      .order('pickup_time', { ascending: true });

    const { data: collections } = await supabase
      .from('collection_records')
      .select('*')
      .eq('assigned_agent_id', agent.id);

    setDashboardData({
      recentReports: assignedReports || [],
      stats: {
        assigned: assignedReports?.filter(r => r.status === 'assigned').length || 0,
        picked: assignedReports?.filter(r => r.status === 'picked').length || 0,
        delivered: collections?.filter(c => c.status === 'delivered').length || 0
      },
      tasks: assignedReports || []
    });
  };

  const fetchAdminDashboard = async () => {
    // Fetch overall platform statistics
    const [reportsData, agentsData, hotelsData, distributionsData] = await Promise.all([
      supabase.from('food_reports').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('delivery_agents').select('*'),
      supabase.from('hotels').select('*'),
      supabase.from('distribution_records').select('*')
    ]);

    setDashboardData({
      recentReports: reportsData.data || [],
      stats: {
        totalReports: reportsData.data?.length || 0,
        activeAgents: agentsData.data?.filter(a => a.is_active).length || 0,
        totalHotels: hotelsData.data?.length || 0,
        totalDistributions: distributionsData.data?.length || 0
      },
      tasks: []
    });
  };

  if (!user || !userProfile) {
    return <div>Loading...</div>;
  }

  const getRoleSpecificContent = () => {
    switch (userProfile.role) {
      case 'hotel':
        return (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(dashboardData.stats as any)?.new || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">New Reports</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {(dashboardData.stats as any)?.assigned || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Assigned</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {(dashboardData.stats as any)?.picked || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Picked Up</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(dashboardData.stats as any)?.delivered || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Delivered</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Recent Food Reports</h2>
              <Button onClick={() => navigate('/reports/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </div>
          </>
        );

      case 'agent':
        return (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {(dashboardData.stats as any)?.assigned || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending Pickups</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {(dashboardData.stats as any)?.picked || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Ready to Deliver</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(dashboardData.stats as any)?.delivered || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed Today</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Your Tasks</h2>
              <Button onClick={() => navigate('/map')}>
                <MapPin className="h-4 w-4 mr-2" />
                View Map
              </Button>
            </div>
          </>
        );

      case 'admin':
        return (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(dashboardData.stats as any)?.totalReports || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Reports</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-accent">
                    {(dashboardData.stats as any)?.activeAgents || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Agents</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">
                    {(dashboardData.stats as any)?.totalHotels || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Registered Hotels</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-warning">
                    {(dashboardData.stats as any)?.totalDistributions || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Distributions</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Recent Activity</h2>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => navigate('/admin/users')}>
                  <User className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button onClick={() => navigate('/admin/analytics')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      assigned: 'bg-yellow-100 text-yellow-800',
      picked: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {userProfile.role === 'hotel' && 'Hotel Dashboard'}
            {userProfile.role === 'agent' && 'Agent Dashboard'}
            {userProfile.role === 'admin' && 'Admin Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile.name}!
          </p>
        </div>

        {getRoleSpecificContent()}

        {/* Recent Reports/Tasks List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : dashboardData.recentReports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">No data yet</h3>
                <p className="text-muted-foreground">
                  {userProfile.role === 'hotel' && 'Start by creating your first food report'}
                  {userProfile.role === 'agent' && 'No tasks assigned yet'}
                  {userProfile.role === 'admin' && 'Platform activity will appear here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            dashboardData.recentReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{report.food_name}</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {userProfile.role === 'agent' && report.hotels?.name}
                        {userProfile.role !== 'agent' && report.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          Qty: {report.quantity}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(report.pickup_time).toLocaleString()}
                        </div>
                        {userProfile.role === 'agent' && report.hotels && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {report.hotels.city}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusBadge(report.status)}>
                        {report.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;