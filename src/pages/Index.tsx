import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import BottomNavigation from '@/components/layout/BottomNavigation';
import FoodCard from '@/components/food/FoodCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Utensils, Users, MapPin, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [foodReports, setFoodReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({
    totalReports: 0,
    activeAgents: 0,
    foodSaved: 0,
    peopleHelped: 0
  });

  const categories = [
    { id: 'all', label: 'All', icon: '🍽️' },
    { id: 'veg', label: 'Vegetarian', icon: '🥗' },
    { id: 'non_veg', label: 'Non-Veg', icon: '🍖' },
    { id: 'snacks', label: 'Snacks', icon: '🍪' },
    { id: 'beverages', label: 'Beverages', icon: '🥤' },
    { id: 'dairy', label: 'Dairy', icon: '🥛' },
    { id: 'bakery', label: 'Bakery', icon: '🍞' },
  ];

  useEffect(() => {
    fetchFoodReports();
    fetchStats();
  }, [selectedCategory, user]);

  const fetchFoodReports = async () => {
    try {
      let query = supabase
        .from('food_reports')
        .select(`
          *,
          hotels (
            name,
            street,
            city,
            rating
          )
        `)
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(20);

      if (selectedCategory !== 'all') {
        query = query.eq('food_type', selectedCategory as any);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching food reports:', error);
        return;
      }

      setFoodReports(data || []);
    } catch (error) {
      console.error('Error fetching food reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [reportsResult, agentsResult, distributionsResult] = await Promise.all([
        supabase.from('food_reports').select('id', { count: 'exact', head: true }),
        supabase.from('delivery_agents').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('distribution_records').select('quantity_distributed', { count: 'exact' })
      ]);

      const totalFoodSaved = distributionsResult.data?.reduce((sum, record) => sum + (record.quantity_distributed || 0), 0) || 0;

      setStats({
        totalReports: reportsResult.count || 0,
        activeAgents: agentsResult.count || 0,
        foodSaved: totalFoodSaved,
        peopleHelped: distributionsResult.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFoodAction = async (action: string, foodId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Handle different actions based on user role and action type
    console.log(`Action: ${action} on food: ${foodId}`);
    // This will be implemented based on user role
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Save Food,
              <span className="text-primary block">Feed Hope</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect surplus food from restaurants with those who need it most. 
              Join our mission to reduce waste and fight hunger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-4">
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stats.totalReports}+
                </div>
                <div className="text-muted-foreground">Food Reports</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stats.activeAgents}+
                </div>
                <div className="text-muted-foreground">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stats.foodSaved}+
                </div>
                <div className="text-muted-foreground">Meals Saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stats.peopleHelped}+
                </div>
                <div className="text-muted-foreground">People Helped</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How FoodShare Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Utensils className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Report Surplus</h3>
                  <p className="text-muted-foreground">
                    Restaurants report available surplus food with pickup times and quantities.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Collect & Deliver</h3>
                  <p className="text-muted-foreground">
                    Trained agents collect the food and deliver it to people in need across the city.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Feed Communities</h3>
                  <p className="text-muted-foreground">
                    Food reaches those who need it most, reducing waste and fighting hunger.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userProfile?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            {userProfile?.role === 'hotel' && 'Manage your food reports and track pickups'}
            {userProfile?.role === 'agent' && 'View available pickups and manage deliveries'}
            {userProfile?.role === 'admin' && 'Monitor platform operations and analytics'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalReports}</div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">{stats.activeAgents}</div>
              <div className="text-sm text-muted-foreground">Active Agents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.foodSaved}</div>
              <div className="text-sm text-muted-foreground">Meals Saved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{stats.peopleHelped}</div>
              <div className="text-sm text-muted-foreground">People Helped</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Available Surplus Food</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-3 py-2"
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Food Cards Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-40 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : foodReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-2">No surplus food available</h3>
            <p className="text-muted-foreground">
              {selectedCategory !== 'all' 
                ? `No ${selectedCategory.replace('_', ' ')} items available at the moment.`
                : 'Check back later for new food reports.'
              }
            </p>
            {userProfile?.role === 'hotel' && (
              <Button className="mt-4" onClick={() => navigate('/reports')}>
                Report Surplus Food
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodReports.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onAction={handleFoodAction}
                showActionButton={userProfile?.role === 'agent'}
                actionButtonText={
                  userProfile?.role === 'agent' ? 'Assign to Me' : 'View Details'
                }
              />
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;
