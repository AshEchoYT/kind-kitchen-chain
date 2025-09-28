import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CityProvider } from "@/contexts/CityContext";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ProfileSetup from "./pages/ProfileSetup";
import AdminSetup from "./pages/AdminSetup";
import AgentTasks from "./pages/AgentTasks";
import AvailableFoodPage from "./pages/AvailableFoodPage";
import RealTimeTaskBoard from "./pages/RealTimeTaskBoard";
import SwiggyDeliveryFlow from "./pages/SwiggyDeliveryFlow";
import Dashboard from "./pages/EnhancedDashboard";
import HotelDashboard from "./pages/HotelDashboard";
import HotelFoodReporting from "./pages/HotelFoodReporting";
import AgentDashboard from "./pages/AgentDashboard";
import AgentTaskBoard from "./pages/AgentTaskBoard";
import AgentPickupFlow from "./pages/AgentPickupFlow";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NeedyRegistration from "./pages/NeedyRegistration";
import NeedyDashboard from "./pages/NeedyDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CityProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              {/* Secure admin setup - only accessible via direct URL */}
              <Route path="/ellarukum-admin-secure-setup-2024" element={<AdminSetup />} />
              <Route path="/agent-tasks" element={<AgentTasks />} />
              <Route path="/available-food" element={<AvailableFoodPage />} />
              <Route path="/real-time-tasks" element={<RealTimeTaskBoard />} />
              <Route path="/delivery/:taskId" element={<SwiggyDeliveryFlow />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Hotel-specific routes */}
              <Route path="/hotel-dashboard" element={
                <RoleProtectedRoute allowedRoles={['hotel', 'admin']}>
                  <HotelDashboard />
                </RoleProtectedRoute>
              } />
              <Route path="/hotel-food-reporting" element={
                <RoleProtectedRoute allowedRoles={['hotel', 'admin']}>
                  <HotelFoodReporting />
                </RoleProtectedRoute>
              } />

              {/* Agent-specific routes */}
              <Route path="/agent-dashboard" element={
                <RoleProtectedRoute allowedRoles={['agent', 'admin']}>
                  <AgentDashboard />
                </RoleProtectedRoute>
              } />
              <Route path="/agent-task-board" element={
                <RoleProtectedRoute allowedRoles={['agent', 'admin']}>
                  <AgentTaskBoard />
                </RoleProtectedRoute>
              } />
              <Route path="/agent-pickup/:taskId" element={
                <RoleProtectedRoute allowedRoles={['agent', 'admin']}>
                  <AgentPickupFlow />
                </RoleProtectedRoute>
              } />

              {/* Admin-specific routes */}
              <Route path="/admin-dashboard" element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              } />

              {/* General authenticated routes */}
              <Route path="/profile" element={
                <RoleProtectedRoute allowedRoles={['hotel', 'agent', 'admin']}>
                  <Profile />
                </RoleProtectedRoute>
              } />
              <Route path="/settings" element={
                <RoleProtectedRoute allowedRoles={['hotel', 'agent', 'admin']}>
                  <Settings />
                </RoleProtectedRoute>
              } />

              {/* Public/Needy People Routes - accessible by anyone but better for logged in users */}
              <Route path="/needy-registration" element={<NeedyRegistration />} />
              <Route path="/needy-dashboard" element={<NeedyDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
