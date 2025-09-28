import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Heart, Utensils, Users, Building, Truck, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'hotel' as 'hotel' | 'agent' | 'admin'
  });

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    {
      value: 'hotel' as const,
      label: 'Hotel Partner',
      description: 'Report surplus food for collection',
      icon: Building,
      color: 'from-blue-500 to-blue-600'
    },
    {
      value: 'agent' as const,
      label: 'Delivery Agent',
      description: 'Pick up and distribute food to communities',
      icon: Truck,
      color: 'from-green-500 to-green-600'
    },
    {
      value: 'admin' as const,
      label: 'Administrator',
      description: 'Manage platform operations (Restricted)',
      icon: Shield,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        // Role-based redirection after login
        navigate('/dashboard');
      } else {
        // For signup, prevent admin role selection for non-admin emails
        if (formData.role === 'admin' && formData.email !== 'admin@ellarukumfood.org') {
          setError('Admin role is restricted. Please contact administrator.');
          setLoading(false);
          return;
        }

        await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          phone: formData.phone,
          role: formData.role
        });
        // Redirect to profile setup after successful signup
        navigate('/profile-setup');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-200/30 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-red-200/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-pink-200/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-orange-300/30 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              எல்லாருக்கும் உணவு
            </h1>
            <p className="text-3xl font-semibold text-gray-800">EllarukumFood</p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Join Tamil Nadu's premier food rescue platform. Connect surplus food from hotels 
              with delivery agents to feed communities across Tamil Nadu.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-orange-100">
              <Heart className="h-8 w-8 text-red-500 mb-2" />
              <h3 className="font-semibold text-gray-800">Feed Communities</h3>
              <p className="text-sm text-gray-600">Help provide meals to those in need</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-orange-100">
              <Utensils className="h-8 w-8 text-orange-500 mb-2" />
              <h3 className="font-semibold text-gray-800">Reduce Waste</h3>
              <p className="text-sm text-gray-600">Rescue surplus food from hotels</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-orange-100">
              <MapPin className="h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-semibold text-gray-800">Tamil Nadu Wide</h3>
              <p className="text-sm text-gray-600">Serving communities across Tamil Nadu</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-orange-100">
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <h3 className="font-semibold text-gray-800">NGO Platform</h3>
              <p className="text-sm text-gray-600">Professional food rescue network</p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Card className="w-full bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {isLogin ? 'Welcome Back' : 'Join EllarukumFood'}
              </CardTitle>
              <CardDescription className="text-base">
                {isLogin 
                  ? 'Sign in to your account'
                  : 'Create your account and start making a difference in Tamil Nadu'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={isLogin ? "login" : "register"} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger 
                    value="login" 
                    onClick={() => {setIsLogin(true); setError('');}}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    onClick={() => {setIsLogin(false); setError('');}}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          required
                        />
                      </div>
                      {formData.email === 'admin@ellarukumfood.org' && (
                        <p className="text-sm text-purple-600 font-medium">Admin account detected</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={formData.email === 'admin@ellarukumfood.org' ? "Enter admin password" : "Enter your password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={loading}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Select Your Role</Label>
                      <div className="grid gap-3">
                        {roleOptions.map((role) => {
                          const IconComponent = role.icon;
                          const isSelected = formData.role === role.value;
                          const isDisabled = role.value === 'admin' && formData.email !== 'admin@ellarukumfood.org';
                          
                          return (
                            <div
                              key={role.value}
                              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                isSelected 
                                  ? 'border-orange-500 bg-orange-50' 
                                  : isDisabled 
                                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                              }`}
                              onClick={() => {
                                if (!isDisabled) {
                                  setFormData({...formData, role: role.value});
                                }
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-r ${role.color} text-white`}>
                                  <IconComponent className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    {role.label}
                                    {isSelected && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
                                    {isDisabled && <div className="text-xs bg-gray-200 px-2 py-1 rounded">Restricted</div>}
                                  </h3>
                                  <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {formData.role === 'admin' && formData.email !== 'admin@ellarukumfood.org' && (
                        <Alert className="border-purple-200 bg-purple-50">
                          <Shield className="h-4 w-4" />
                          <AlertDescription className="text-purple-700">
                            Admin role is restricted to authorized personnel only
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={loading || (formData.role === 'admin' && formData.email !== 'admin@ellarukumfood.org')}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default AuthPage;