import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MapPin, Clock, Package, TrendingUp, Users, Star } from 'lucide-react';
import { FoodReportForm } from '@/components/food/FoodReportForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';

const HotelDashboard = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [hotelData, setHotelData] = useState<any>(null);
  const [foodReports, setFoodReports] = useState<any[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    completedDeliveries: 0,
    totalFoodSaved: 0,
    rating: 4.5
  });

  useEffect(() => {
    if (user) {
      fetchHotelData();
      fetchFoodReports();
      fetchStats();
    }
  }, [user]);

  const fetchHotelData = async () => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setHotelData(data);
    } catch (error) {
      console.error('Error fetching hotel data:', error);
    }
  };

  const fetchFoodReports = async () => {
    try {
      const { data, error } = await supabase
        .from('food_reports')
        .select(`
          *,
          delivery_agents (name, contact)
        `)
        .eq('hotel_id', hotelData?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFoodReports(data || []);
    } catch (error) {
      console.error('Error fetching food reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (!hotelData?.id) return;

      // Get total reports
      const { count: totalReports } = await supabase
        .from('food_reports')
        .select('*', { count: 'exact', head: true })
        .eq('hotel_id', hotelData.id);

      // Get completed deliveries
      const { count: completedDeliveries } = await supabase
        .from('food_reports')
        .select('*', { count: 'exact', head: true })
        .eq('hotel_id', hotelData.id)
        .eq('status', 'delivered');

      setStats({
        totalReports: totalReports || 0,
        completedDeliveries: completedDeliveries || 0,
        totalFoodSaved: hotelData?.total_food_saved || 0,
        rating: hotelData?.rating || 4.5
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReportSubmit = async (reportData: any) => {
    try {
      if (!hotelData?.id) {
        toast({
          title: "Error",
          description: "Please complete your hotel profile first.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('food_reports')
        .insert({
          ...reportData,
          hotel_id: hotelData.id
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Food report submitted successfully.",
        variant: "default"
      });

      setShowReportForm(false);
      fetchFoodReports();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'assigned': return 'bg-yellow-500';
      case 'picked': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hotel Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {hotelData?.name?.charAt(0) || 'H'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{hotelData?.name || 'Hotel Dashboard'}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{hotelData?.street}, {hotelData?.city}</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowReportForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Report Surplus Food
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Deliveries</p>
                  <p className="text-2xl font-bold">{stats.completedDeliveries}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Food Saved (kg)</p>
                  <p className="text-2xl font-bold">{stats.totalFoodSaved}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{stats.rating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Food Reports */}
        <Tabs defaultValue="active" className="mb-20">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Reports</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="grid gap-6">
              {foodReports.filter(report => ['new', 'assigned', 'picked'].includes(report.status)).map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{report.food_name}</h3>
                        <p className="text-muted-foreground">{report.description}</p>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusLabel(report.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.quantity} portions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Pickup: {new Date(report.pickup_time).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {report.food_type.toUpperCase()}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${report.food_type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    </div>

                    {report.assigned_agent_id && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">
                          Assigned Agent: {report.delivery_agents?.name || 'Agent'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Contact: {report.delivery_agents?.contact || 'N/A'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-6">
              {foodReports.filter(report => report.status === 'delivered').map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{report.food_name}</h3>
                        <p className="text-muted-foreground">{report.description}</p>
                      </div>
                      <Badge className="bg-green-500">Delivered</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.quantity} portions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Delivered: {new Date(report.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {report.food_type.toUpperCase()}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${report.food_type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6">
              {foodReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{report.food_name}</h3>
                        <p className="text-muted-foreground">{report.description}</p>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusLabel(report.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.quantity} portions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Created: {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {report.food_type.toUpperCase()}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${report.food_type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Food Report Form Modal */}
      <FoodReportForm 
        hotelId={hotelData?.id || ''}
        open={showReportForm}
        onClose={() => setShowReportForm(false)}
        onSubmit={handleReportSubmit}
      />

      <BottomNavigation />
    </div>
  );
};

export default HotelDashboard;