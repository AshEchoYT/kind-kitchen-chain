import React from 'react';
import { Home, MapPin, Package, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();

  if (!user) return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MapPin, label: 'Tasks', path: '/tasks' },
    { icon: Package, label: 'Orders', path: '/orders' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  // Adjust navigation based on user role
  if (userProfile?.role === 'hotel') {
    navItems[1] = { icon: Package, label: 'Reports', path: '/reports' };
    navItems[2] = { icon: MapPin, label: 'Track', path: '/track' };
  } else if (userProfile?.role === 'agent') {
    navItems[1] = { icon: MapPin, label: 'Pickups', path: '/pickups' };
    navItems[2] = { icon: Package, label: 'Deliveries', path: '/deliveries' };
  } else if (userProfile?.role === 'admin') {
    navItems[1] = { icon: MapPin, label: 'Monitor', path: '/monitor' };
    navItems[2] = { icon: Package, label: 'Analytics', path: '/analytics' };
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;