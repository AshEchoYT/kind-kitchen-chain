import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useRoleBasedNavigation = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleHotelPartnerAccess = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join as a hotel partner.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (userProfile?.role && userProfile.role !== 'hotel') {
      toast({
        title: "Access Denied", 
        description: `You are registered as ${userProfile.role}. Hotel partner features are only available to hotel accounts.`,
        variant: "destructive",
      });
      return;
    }

    navigate('/hotel-food-reporting');
  };

  const handleDeliveryAgentAccess = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to become a delivery agent.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (userProfile?.role && userProfile.role !== 'agent') {
      toast({
        title: "Access Denied",
        description: `You are registered as ${userProfile.role}. Delivery agent features are only available to agent accounts.`,
        variant: "destructive",
      });
      return;
    }

    navigate('/agent-task-board');
  };

  const handleFoodHelpAccess = () => {
    if (!user) {
      toast({
        title: "Authentication Required", 
        description: "Please log in to request food help.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (userProfile?.role && !['admin', 'agent'].includes(userProfile.role)) {
      toast({
        title: "Access Denied",
        description: "Food help registration is available to all users. However, agents and admins can access this feature directly.",
        variant: "default",
      });
    }

    navigate('/needy-registration');
  };

  const handleViewAvailableFood = () => {
    // This can be accessed by anyone, but with different features based on login status
    navigate('/available-food');
  };

  const handleDashboardAccess = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your dashboard.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    navigate('/dashboard');
  };

  return {
    handleHotelPartnerAccess,
    handleDeliveryAgentAccess, 
    handleFoodHelpAccess,
    handleViewAvailableFood,
    handleDashboardAccess
  };
};