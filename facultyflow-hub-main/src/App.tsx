import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/pages/Dashboard";
import { TaskList } from "@/pages/TaskList";
import { CreateTask } from "@/pages/CreateTask";
import { Portfolio } from "@/pages/Portfolio";
import Settings from "./components/Settings";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import { Analytics } from "@/pages/Analytics";
import { ErrorBoundary } from "@/components/ErrorBoundary"; // ✅ ensure this import exists

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Login Route - No Layout */}
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginForm /> : <Navigate to="/" replace />}
      />

      {/* Protected Routes - All wrapped in DashboardLayout (with ErrorBoundary) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <DashboardLayout />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        {/* Nested routes render inside DashboardLayout’s outlet */}
        <Route index element={<Dashboard />} />

        <Route path="tasks" element={<TaskList />} />

        <Route
          path="tasks/create"
          element={
            <ProtectedRoute roles={["HOD", "ADMIN"]}>
              <CreateTask />
            </ProtectedRoute>
          }
        />

        <Route
          path="portfolio"
          element={
            <ProtectedRoute roles={["FACULTY", "HOD", "ADMIN"]}>
              <Portfolio />
            </ProtectedRoute>
          }
        />

        {/* ✅ make this child path relative (no leading slash) */}
        <Route
          path="analytics"
          element={
            <ProtectedRoute roles={["HOD", "ADMIN"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route path="settings" element={<Settings />} />

        {/* Catch-all for 404 within protected area */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Redirect unauthenticated users to login */}
      <Route
        path="*"
        element={
          !isAuthenticated ? <Navigate to="/login" replace /> : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
