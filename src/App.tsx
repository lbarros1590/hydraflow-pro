import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AppLayout from "./components/layout/AppLayout";
import AppDashboard from "./pages/AppDashboard";
import ProjectsList from "./pages/ProjectsList";
import ProjectWizard from "./pages/ProjectWizard";
import ProjectDetail from "./pages/ProjectDetail";
import HydraulicPage from "./pages/HydraulicPage";
import StandaloneCalculator from "./pages/StandaloneCalculator";
import SprinklerCalculator from "./pages/SprinklerCalculator";
import DocsPage from "./pages/DocsPage";
import AssistantPage from "./pages/AssistantPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Legacy redirect */}
            <Route path="/wizard/new" element={<Navigate to="/app/projects/new" replace />} />
            
            {/* Protected Routes - App Area */}
            <Route path="/app" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AppDashboard />} />
              <Route path="projects" element={<ProjectsList />} />
              <Route path="projects/new" element={<ProjectWizard />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/:id/edit" element={<ProjectWizard />} />
              <Route path="projects/:id/hydraulic" element={<HydraulicPage />} />
              <Route path="calculator" element={<StandaloneCalculator />} />
              <Route path="calculator/sprinkler" element={<SprinklerCalculator />} />
              <Route path="docs" element={<DocsPage />} />
              <Route path="assistant" element={<AssistantPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
