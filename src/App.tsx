import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Landing />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="project/:id" element={<ProjectOverview />} />
            <Route path="project/:id/editor" element={<ProjectEditor />} />
            <Route path="project/:id/characters" element={<ProjectCharacters />} />
            <Route path="project/:id/worldbuilding" element={<ProjectWorldbuilding />} />
            <Route path="project/:id/art" element={<ProjectArt />} />
            <Route path="project/:id/export" element={<ProjectExport />} />
          </Route>
          
          {/* Auth routes without layout */}
          <Route path="auth/login" element={<Login />} />
          <Route path="auth/register" element={<Register />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
