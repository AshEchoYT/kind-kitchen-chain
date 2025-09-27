import React from 'react';
import { Search, MapPin, User, Menu, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="swiggy-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
              <h1 className="text-2xl font-bold text-primary">FoodShare</h1>
            </div>
          </div>

          {/* Location & Search */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-2xl mx-8">
            <div className="location-selector">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Bengaluru</span>
            </div>
            
            <div className="swiggy-search flex-1">
              <Search className="h-4 w-4 text-muted-foreground mr-3" />
              <input
                type="text"
                placeholder="Search for surplus food..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Bell className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.avatar_url} />
                        <AvatarFallback>
                          {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Sign Up
                </Button>
              </div>
            )}

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