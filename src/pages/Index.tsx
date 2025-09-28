import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FoodCard } from '@/components/food/FoodCard';
import { MapPin, Search, Filter, Clock, Users, Truck, Heart, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import heroImage from '@/assets/hero-food.jpg';

const Index = () => {
  const { user } = useAuth();
  const [foodReports, setFoodReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchFoodReports();
  }, []);

  const fetchFoodReports = async () => {
    try {
      const { data, error } = await supabase
        .from('food_reports')
        .select(`
          *,
          hotels (
            name,
            street,
            city,
            landmark
          )
        `)
        .eq('status', 'new')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setFoodReports(data || []);
    } catch (error) {
      console.error('Error fetching food reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = foodReports.filter(report => {
    const matchesSearch = report.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.hotels?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || report.food_type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-accent opacity-90"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white/5 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-white/5 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <div className="animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Heart className="h-8 w-8 text-red-400 animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-bold text-shadow">
                FoodShare
              </h1>
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-shadow">
              Connecting surplus food from hotels with those who need it most
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button size="lg" variant="secondary" className="text-lg px-8 gradient-hover animate-shimmer">
                <Search className="h-5 w-5 mr-2" />
                Find Food Near You
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary glass-card">
                <Users className="h-5 w-5 mr-2" />
                Join as Partner
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white/80 backdrop-blur-md border-b animate-slide-up">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by location or food type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 border-2 border-transparent focus:border-primary transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="glass-card hover:scale-105 transition-transform">
                <MapPin className="h-4 w-4 mr-1" />
                Delhi, India
              </Button>
              
              {/* Food Type Filters */}
              <div className="flex gap-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'veg', label: '🥗 Veg' },
                  { value: 'non_veg', label: '🍗 Non-Veg' },
                  { value: 'snacks', label: '🍪 Snacks' }
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={selectedFilter === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.value)}
                    className={`transition-all duration-300 ${
                      selectedFilter === filter.value ? 'animate-pulse-glow' : 'glass-card'
                    }`}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Food Reports */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 animate-fade-in">
            Available Surplus Food
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report, index) => (
                <div
                  key={report.id}
                  className="animate-fade-in hover:scale-105 transition-transform duration-300"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <FoodCard
                    id={report.id}
                    name={report.food_name}
                    restaurant={report.hotels?.name || 'Unknown Restaurant'}
                    location={`${report.hotels?.street || ''}, ${report.hotels?.city || ''}`}
                    image={report.image_url || heroImage}
                    price={0}
                    rating={4.5}
                    cookTime={Math.floor(Math.random() * 30) + 10}
                    isVeg={report.food_type === 'veg'}
                    quantity={report.quantity}
                    pickupTime={new Date(report.pickup_time).toLocaleTimeString()}
                  />
                </div>
              ))}
            </div>
          )}

          {!loading && filteredReports.length === 0 && (
            <div className="text-center py-12 animate-bounce-in">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">No surplus food available</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new listings'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-fade-in">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-shadow">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center glass-card hover:scale-105 transition-transform duration-300 animate-bounce-in">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-primary mb-2 animate-pulse-glow">10,000+</div>
                <p className="text-muted-foreground">Meals Rescued</p>
                <Heart className="h-6 w-6 text-red-400 mx-auto mt-2 animate-float" />
              </CardContent>
            </Card>
            <Card className="text-center glass-card hover:scale-105 transition-transform duration-300 animate-bounce-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-primary mb-2 animate-pulse-glow">150+</div>
                <p className="text-muted-foreground">Partner Hotels</p>
                <Users className="h-6 w-6 text-blue-400 mx-auto mt-2 animate-float" />
              </CardContent>
            </Card>
            <Card className="text-center glass-card hover:scale-105 transition-transform duration-300 animate-bounce-in" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-primary mb-2 animate-pulse-glow">50+</div>
                <p className="text-muted-foreground">Active Volunteers</p>
                <Truck className="h-6 w-6 text-green-400 mx-auto mt-2 animate-float" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of food heroes who are making a real impact in their communities.
            </p>
            <Button size="lg" className="gradient-hover animate-pulse-glow">
              <Heart className="h-5 w-5 mr-2" />
              Start Your Journey
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;