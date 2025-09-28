import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Package, TrendingUp, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalAgents: 0,
    totalReports: 0,
    completedDeliveries: 0,
    totalBeggars: 0,
    foodSavedKg: 0
  });
  const [hotels, setHotels] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [beggars, setBeggars] = useState<any[]>([]);
  const [foodReports, setFoodReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBeggar, setShowAddBeggar] = useState(false);
  const [newBeggar, setNewBeggar] = useState({
    name: '',
    street: '',
    city: '',
    landmark: '',
    contact: '',
    notes: '',
    preferred_food_time: ''
  });

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      // Fetch stats
      const [hotelsResponse, agentsResponse, reportsResponse, beggarsResponse] = await Promise.all([
        supabase.from('hotels').select('*', { count: 'exact' }),
        supabase.from('delivery_agents').select('*', { count: 'exact' }),
        supabase.from('food_reports').select('*', { count: 'exact' }),
        supabase.from('beggars').select('*', { count: 'exact' })
      ]);

      // Fetch completed deliveries
      const { count: completedCount } = await supabase
        .from('food_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered');

      setStats({
        totalHotels: hotelsResponse.count || 0,
        totalAgents: agentsResponse.count || 0,
        totalReports: reportsResponse.count || 0,
        completedDeliveries: completedCount || 0,
        totalBeggars: beggarsResponse.count || 0,
        foodSavedKg: Math.floor(Math.random() * 5000) + 1000 // Mock data
      });

      setHotels(hotelsResponse.data || []);
      setAgents(agentsResponse.data || []);
      setBeggars(beggarsResponse.data || []);
      setFoodReports(reportsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBeggar = async () => {
    try {
      const { error } = await supabase
        .from('beggars')
        .insert([newBeggar]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Beggar added successfully.",
        variant: "default"
      });

      setShowAddBeggar(false);
      setNewBeggar({
        name: '',
        street: '',
        city: '',
        landmark: '',
        contact: '',
        notes: '',
        preferred_food_time: ''
      });
      fetchAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const assignTask = async (reportId: string, agentId: string) => {
    try {
      const { error } = await supabase
        .from('food_reports')
        .update({ 
          assigned_agent_id: agentId,
          status: 'assigned'
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Task Assigned!",
        description: "Food report assigned to agent successfully.",
        variant: "default"
      });

      fetchAllData();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the FoodShare platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Hotels</p>
                  <p className="text-2xl font-bold">{stats.totalHotels}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Agents</p>
                  <p className="text-2xl font-bold">{stats.totalAgents}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
                <Package className="h-8 w-8 text-orange-500" />
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
                  <p className="text-sm text-muted-foreground">Registered Beneficiaries</p>
                  <p className="text-2xl font-bold">{stats.totalBeggars}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Food Saved (kg)</p>
                  <p className="text-2xl font-bold">{stats.foodSavedKg}</p>
                </div>
                <Package className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="mb-20">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Food Reports</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6">
            <div className="grid gap-6">
              {foodReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{report.food_name}</h3>
                        <p className="text-muted-foreground">{report.description}</p>
                      </div>
                      <Badge className={`${getStatusColor(report.status)} text-white`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{report.quantity} portions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {report.food_type.toUpperCase()}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${report.food_type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {report.status === 'new' && (
                      <div className="flex gap-2">
                        <select 
                          className="px-3 py-1 border rounded text-sm"
                          onChange={(e) => {
                            if (e.target.value) {
                              assignTask(report.id, e.target.value);
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="">Assign to agent...</option>
                          {agents.filter(agent => agent.is_active).map(agent => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name} ({agent.zone})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hotels" className="mt-6">
            <div className="grid gap-6">
              {hotels.map((hotel) => (
                <Card key={hotel.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{hotel.name}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{hotel.street}, {hotel.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{hotel.contact}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Food Saved</p>
                        <p className="text-xl font-semibold">{hotel.total_food_saved || 0} kg</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="agents" className="mt-6">
            <div className="grid gap-6">
              {agents.map((agent) => (
                <Card key={agent.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{agent.name}</h3>
                        <p className="text-muted-foreground">ID: {agent.unique_id}</p>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">Zone: {agent.zone} | Area: {agent.area}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{agent.contact}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={agent.is_active ? 'bg-green-500' : 'bg-red-500'}>
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">Total Deliveries</p>
                        <p className="text-xl font-semibold">{agent.total_deliveries || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="beneficiaries" className="mt-6">
            <div className="mb-4">
              <Dialog open={showAddBeggar} onOpenChange={setShowAddBeggar}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Beneficiary
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Beneficiary</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newBeggar.name}
                        onChange={(e) => setNewBeggar({...newBeggar, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        value={newBeggar.street}
                        onChange={(e) => setNewBeggar({...newBeggar, street: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newBeggar.city}
                        onChange={(e) => setNewBeggar({...newBeggar, city: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="landmark">Landmark</Label>
                      <Input
                        id="landmark"
                        value={newBeggar.landmark}
                        onChange={(e) => setNewBeggar({...newBeggar, landmark: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact">Contact</Label>
                      <Input
                        id="contact"
                        value={newBeggar.contact}
                        onChange={(e) => setNewBeggar({...newBeggar, contact: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="preferred_time">Preferred Food Time</Label>
                      <Input
                        id="preferred_time"
                        type="time"
                        value={newBeggar.preferred_food_time}
                        onChange={(e) => setNewBeggar({...newBeggar, preferred_food_time: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newBeggar.notes}
                        onChange={(e) => setNewBeggar({...newBeggar, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddBeggar}>Add Beneficiary</Button>
                    <Button variant="outline" onClick={() => setShowAddBeggar(false)}>Cancel</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {beggars.map((beggar) => (
                <Card key={beggar.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{beggar.name}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{beggar.street}, {beggar.city}</span>
                          {beggar.landmark && <span className="text-sm">({beggar.landmark})</span>}
                        </div>
                        {beggar.contact && (
                          <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{beggar.contact}</span>
                          </div>
                        )}
                        {beggar.preferred_food_time && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Preferred time: {beggar.preferred_food_time}
                          </p>
                        )}
                        {beggar.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Notes: {beggar.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Registered</p>
                        <p className="text-sm font-medium">
                          {new Date(beggar.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {beggars.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Beneficiaries Yet</h3>
                    <p className="text-muted-foreground">
                      Add beneficiaries to start distributing food.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AdminDashboard;