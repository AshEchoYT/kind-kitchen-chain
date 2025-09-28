import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
  showAccessDenied?: boolean;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/',
  showAccessDenied = true
}) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not logged in
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // If user profile is not loaded yet, wait
    if (!userProfile) {
      return;
    }

    // If user's role is not in allowed roles
    if (!allowedRoles.includes(userProfile.role)) {
      if (showAccessDenied) {
        toast({
          title: "Access Denied",
          description: `This page is only available to ${allowedRoles.join(', ')} accounts. You are registered as ${userProfile.role}.`,
          variant: "destructive",
        });
      }
      navigate(redirectTo);
      return;
    }
  }, [user, userProfile, allowedRoles, redirectTo, showAccessDenied, navigate]);

  // Show loading while checking authentication
  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-orange-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Checking Access...</h3>
          <p className="text-gray-600">Please wait while we verify your permissions.</p>
        </div>
      </div>
    );
  }

  // Show access denied if role doesn't match
  if (!allowedRoles.includes(userProfile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              This page is only available to <span className="font-semibold">{allowedRoles.join(', ')}</span> accounts.
            </p>
            <p className="text-sm text-gray-500">
              You are currently registered as: <span className="font-semibold capitalize">{userProfile.role}</span>
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};