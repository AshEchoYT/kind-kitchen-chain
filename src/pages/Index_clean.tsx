import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, Users, Truck, Heart, Sparkles, ArrowRight, Star, Shield, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Navigation */}
      <Navbar />
      
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

        <div className="relative container mx-auto px-4 py-24 text-center text-white">
          <div className="animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Heart className="h-8 w-8 text-red-400 animate-pulse" />
              <h1 className="text-5xl md:text-7xl font-bold text-shadow">
                EllarukumFood
              </h1>
              <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-xl md:text-2xl mb-4 max-w-4xl mx-auto text-shadow">
              எல்லருக்கும் உணவு
            </p>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-shadow opacity-90">
              Connecting surplus food from restaurants with those who need it most across Tamil Nadu
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 py-4 gradient-hover animate-shimmer"
                onClick={handleGetStarted}
              >
                <Search className="h-5 w-5 mr-2" />
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary glass-card"
                onClick={() => navigate('/auth')}
              >
                <Users className="h-5 w-5 mr-2" />
                Join Our Mission
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How EllarukumFood Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple three-step process to rescue surplus food and feed those in need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center glass-card hover:scale-105 transition-transform duration-300 animate-bounce-in">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Hotels Report</h3>
                <p className="text-muted-foreground">
                  Restaurants and hotels report their surplus food with pickup times and location details
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center glass-card hover:scale-105 transition-transform duration-300 animate-bounce-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Agents Pick</h3>
                <p className="text-muted-foreground">
                  Volunteer delivery agents browse available tasks and manually pick up food from nearby locations
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center glass-card hover:scale-105 transition-transform duration-300 animate-bounce-in" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">People Fed</h3>
                <p className="text-muted-foreground">
                  Food reaches those who need it most, reducing waste and fighting hunger across Tamil Nadu
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose EllarukumFood?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Tamil Nadu with advanced features for efficient food rescue operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 glass-card hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Location-Based Matching</h3>
                  <p className="text-muted-foreground text-sm">
                    Smart GPS integration matches agents with nearby food sources for efficient delivery
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 glass-card hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
                  <p className="text-muted-foreground text-sm">
                    Live task updates and instant notifications ensure food reaches people quickly
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 glass-card hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Manual Task Selection</h3>
                  <p className="text-muted-foreground text-sm">
                    Agents choose their own tasks based on location and availability preferences
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 glass-card hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tamil Nadu Focused</h3>
                  <p className="text-muted-foreground text-sm">
                    Comprehensive coverage of Tamil Nadu cities and areas with local language support
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 glass-card hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Commercial Grade</h3>
                  <p className="text-muted-foreground text-sm">
                    Built for NGO operations with robust features, security, and scalability
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 glass-card hover:scale-105 transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-teal-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Community Impact</h3>
                  <p className="text-muted-foreground text-sm">
                    Track your contribution to reducing food waste and fighting hunger
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Growing Impact</h2>
            <p className="text-xl text-muted-foreground">
              Join the movement that's making a real difference across Tamil Nadu
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center glass-card hover:scale-105 transition-transform duration-300 animate-bounce-in">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-primary mb-2 animate-pulse-glow">10,000+</div>
                <p className="text-muted-foreground font-medium">Meals Rescued</p>
                <Heart className="h-6 w-6 text-red-400 mx-auto mt-2 animate-float" />
              </CardContent>
            </Card>
            <Card className="text-center glass-card hover:scale-105 transition-transform duration-300 animate-bounce-in" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-primary mb-2 animate-pulse-glow">150+</div>
                <p className="text-muted-foreground font-medium">Partner Hotels</p>
                <Users className="h-6 w-6 text-blue-400 mx-auto mt-2 animate-float" />
              </CardContent>
            </Card>
            <Card className="text-center glass-card hover:scale-105 transition-transform duration-300 animate-bounce-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-primary mb-2 animate-pulse-glow">50+</div>
                <p className="text-muted-foreground font-medium">Active Agents</p>
                <Truck className="h-6 w-6 text-green-400 mx-auto mt-2 animate-float" />
              </CardContent>
            </Card>
            <Card className="text-center glass-card hover:scale-105 transition-transform duration-300 animate-bounce-in" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-primary mb-2 animate-pulse-glow">25+</div>
                <p className="text-muted-foreground font-medium">Tamil Nadu Cities</p>
                <MapPin className="h-6 w-6 text-purple-400 mx-auto mt-2 animate-float" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 text-center bg-gradient-to-r from-primary via-primary-dark to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of food heroes who are making a real impact in Tamil Nadu communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-4 gradient-hover animate-pulse-glow"
                onClick={handleGetStarted}
              >
                <Heart className="h-5 w-5 mr-2" />
                Start Your Journey
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary"
                onClick={() => navigate('/auth')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-red-400" />
            <span className="text-xl font-bold">EllarukumFood</span>
          </div>
          <p className="text-gray-400 mb-2">
            எல்லருக்கும் உணவு - Food for Everyone
          </p>
          <p className="text-gray-500 text-sm">
            Made with ❤️ for Tamil Nadu | Reducing food waste, fighting hunger
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;