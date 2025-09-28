import React from 'react';
import { Search, MapPin, User, Menu, Bell, Settings, LogOut, Home, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container flex h-16 items-center">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div 
              className="flex items-center space-x-2 cursor-pointer group hover:scale-105 transition-transform duration-300" 
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <Heart className="h-8 w-8 text-red-500 group-hover:animate-pulse" />
                <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-red-500 to-accent bg-clip-text text-transparent">
                  EllarukumFood
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">எல்லருக்கும் உணவு</p>
              </div>
            </div>
          </div>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors duration-300">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Tamil Nadu</span>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative hover:bg-primary/10 transition-all duration-300 hover:scale-110"
                  >
                    <Bell className="h-4 w-4" />
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                    >
                      3
                    </Badge>
                  </Button>
                </div>
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-300"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={userProfile?.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" sideOffset={5}>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userProfile?.name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <Badge variant="outline" className="w-fit mt-2 capitalize">
                          {userProfile?.role || 'User'}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/dashboard')}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/settings')}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="hover:bg-destructive/10 text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;