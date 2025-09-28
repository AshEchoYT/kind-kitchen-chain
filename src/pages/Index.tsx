import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  ArrowRight, 
  Users, 
  Truck, 
  Sparkles, 
  MapPin, 
  Clock, 
  Shield, 
  Star,
  ChefHat,
  HandHeart,
  Globe,
  Award,
  TrendingUp,
  Zap
} from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <Navbar />
      
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url('/src/assets/hero-food.jpg')`
          }}
        />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-400/20 rounded-full animate-pulse blur-xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-red-400/20 rounded-full animate-pulse blur-xl"></div>
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-yellow-400/20 rounded-full animate-pulse blur-xl"></div>
          <div className="absolute top-1/2 right-20 w-28 h-28 bg-green-400/20 rounded-full animate-pulse blur-xl"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <Badge className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white border-none px-4 py-2 text-sm font-medium animate-pulse">
              🌟 Tamil Nadu's #1 Food Rescue Platform
            </Badge>
            
            {/* Main Heading */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <Heart className="h-12 w-12 text-red-400 animate-pulse" />
              <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent leading-tight">
                EllarukumFood
              </h1>
              <Sparkles className="h-12 w-12 text-yellow-400 animate-spin" />
            </div>
            
            {/* Tamil Subtitle */}
            <div className="mb-6">
              <p className="text-2xl md:text-4xl font-bold text-orange-200 mb-2">எல்லருக்கும் உணவு</p>
              <p className="text-lg md:text-xl text-orange-100 italic">Food for Everyone • உணவு அனைவருக்கும்</p>
            </div>
            
            {/* Description */}
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-200 leading-relaxed">
              Connecting surplus food from restaurants with those who need it most across Tamil Nadu. 
              <span className="block mt-2 text-orange-200 font-semibold">Join the revolution against food waste!</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="text-xl px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-none shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                onClick={handleGetStarted}
              >
                <Zap className="h-6 w-6 mr-3" />
                Get Started Now
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-xl px-12 py-6 border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/10"
                onClick={() => navigate('/auth')}
              >
                <HandHeart className="h-6 w-6 mr-3" />
                Join Our Mission
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-200">10K+</div>
                <div className="text-sm text-gray-300">Meals Rescued</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-200">150+</div>
                <div className="text-sm text-gray-300">Partner Hotels</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-200">50+</div>
                <div className="text-sm text-gray-300">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-200">25+</div>
                <div className="text-sm text-gray-300">Tamil Cities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              How EllarukumFood Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple three-step process to rescue surplus food and feed those in need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-orange-200">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                  <ChefHat className="h-10 w-10 text-orange-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-orange-800">Hotels Report</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Restaurants and hotels report their surplus food with pickup times and location details across Tamil Nadu
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-green-200">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                  <Truck className="h-10 w-10 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-green-800">Agents Deliver</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Volunteer delivery agents browse available tasks and manually pick up food from nearby locations
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-red-200">
              <CardContent className="p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300">
                  <Heart className="h-10 w-10 text-red-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-red-800">People Fed</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Food reaches those who need it most, reducing waste and fighting hunger across Tamil Nadu
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Why Choose EllarukumFood?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Tamil Nadu with advanced features for efficient food rescue operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur border-2 hover:border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-800">Location-Based Matching</h3>
                  <p className="text-muted-foreground text-sm">
                    Smart GPS integration matches agents with nearby food sources for efficient delivery
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur border-2 hover:border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-green-800">Real-Time Updates</h3>
                  <p className="text-muted-foreground text-sm">
                    Live task updates and instant notifications ensure food reaches people quickly
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur border-2 hover:border-purple-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-purple-800">Manual Task Selection</h3>
                  <p className="text-muted-foreground text-sm">
                    Agents choose their own tasks based on location and availability preferences
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur border-2 hover:border-orange-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-orange-800">Tamil Nadu Focused</h3>
                  <p className="text-muted-foreground text-sm">
                    Comprehensive coverage of Tamil Nadu cities and areas with local language support
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur border-2 hover:border-red-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-red-800">Commercial Grade</h3>
                  <p className="text-muted-foreground text-sm">
                    Built for NGO operations with robust features, security, and scalability
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur border-2 hover:border-teal-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-teal-800">Community Impact</h3>
                  <p className="text-muted-foreground text-sm">
                    Track your contribution to reducing food waste and fighting hunger
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 text-center bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative">
          <h2 className="text-5xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of food heroes who are making a real impact in Tamil Nadu communities.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-xl px-12 py-6 bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl"
            onClick={handleGetStarted}
          >
            <Heart className="h-6 w-6 mr-3" />
            Start Your Journey
            <ArrowRight className="h-6 w-6 ml-3" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-red-400 animate-pulse" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                EllarukumFood
              </span>
            </div>
            <p className="text-gray-400 mb-2 text-lg">எல்லருக்கும் உணவு - Food for Everyone</p>
            <p className="text-gray-500 mb-4">Made with ❤️ for Tamil Nadu | Reducing food waste, fighting hunger</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;