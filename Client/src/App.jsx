// client/src/App.jsx (UPDATED)
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

// Import Pages
import LoginPage from "./pages/LoginPage"; // Assume you created this
import RegisterPage from "./pages/RegisterPage"; // Assume you created this
import ProfileInput from "./pages/ProfileInput";
import DashboardPage from "./pages/DashboardPage";

// Import Context and Hook
import { AuthProvider, useAuth } from "./context/AuthContext";

// Component to protect routes
const ProtectedRoute = ({ element: Element, ...rest }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <Element {...rest} />
  ) : (
    <Navigate to="/login" replace />
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Unprotected Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute element={ProfileInput} />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute element={DashboardPage} />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="bottom-right" richColors />
      </Router>
    </AuthProvider>
  );
}