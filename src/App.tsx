import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TicketProvider } from "@/contexts/TicketContext";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import PerformanceRecordPage from "@/pages/PerformanceRecordPage";
import TicketFormPage from "@/pages/TicketFormPage";
import TicketDetailPage from "@/pages/TicketDetailPage";
import ReportPage from "@/pages/ReportPage";
import ExplorePage from "@/pages/ExplorePage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <PerformanceRecordPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tickets/new"
        element={
          <PrivateRoute>
            <TicketFormPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <PrivateRoute>
            <TicketDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tickets/:id/edit"
        element={
          <PrivateRoute>
            <TicketFormPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/report"
        element={
          <PrivateRoute>
            <ReportPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <PrivateRoute>
            <ExplorePage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TicketProvider>
          <AppRoutes />
        </TicketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
