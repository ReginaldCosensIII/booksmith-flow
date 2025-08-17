import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth/Auth";
import ProjectOverview from "./pages/Project/ProjectOverview";
import ProjectEditor from "./pages/Project/ProjectEditor";
import ProjectCharacters from "./pages/Project/ProjectCharacters";
import ProjectWorldbuilding from "./pages/Project/ProjectWorldbuilding";
import ProjectArt from "./pages/Project/ProjectArt";
import ProjectExport from "./pages/Project/ProjectExport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Landing />} />
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="project/:id" element={<ProtectedRoute><ProjectOverview /></ProtectedRoute>} />
              <Route path="project/:id/editor" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
              <Route path="project/:id/characters" element={<ProtectedRoute><ProjectCharacters /></ProtectedRoute>} />
              <Route path="project/:id/worldbuilding" element={<ProtectedRoute><ProjectWorldbuilding /></ProtectedRoute>} />
              <Route path="project/:id/art" element={<ProtectedRoute><ProjectArt /></ProtectedRoute>} />
              <Route path="project/:id/export" element={<ProtectedRoute><ProjectExport /></ProtectedRoute>} />
            </Route>
            
            {/* Auth routes without layout */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
