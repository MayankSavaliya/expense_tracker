import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate, Link } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Dashboard from "./pages/dashboard";
import FriendsPage from "./pages/friends-page";
import GroupsPage from "./pages/groups-page";
import TransactionsPage from "./pages/transactions-page";
import AddExpensePage from "./pages/add-expense-page";
import GroupDetailsPage from "./pages/group-details-page";
import SettlementsPage from "./pages/settlements-page";
import AnalyticsPage from "./pages/analytics-page";
import ProfileSettings from "./pages/profile-settings";
import Layout from "./components/Layout";

import LoginPage from "./pages/login-page";
import RegisterPage from "./pages/register-page";
import ForgotPasswordPage from "./pages/forgot-password-page";
import ResetPasswordPage from "./pages/reset-password-page";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Loading application state...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public routes: accessible regardless of authentication state */}
        {/* If authenticated, redirect public auth pages to dashboard */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route 
          path="/forgot-password" 
          element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route 
          path="/reset-password/:token" 
          element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected Routes: Require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Redirect root to dashboard if authenticated, otherwise this won't be reached due to ProtectedRoute */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} /> 
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="friends-page" element={<FriendsPage />} />
            <Route path="groups-page" element={<GroupsPage />} />
            <Route path="transactions-page" element={<TransactionsPage />} />
            <Route path="add-expense-page" element={<AddExpensePage />} />
            <Route path="group-details-page/:id" element={<GroupDetailsPage />} />
            <Route path="settlements-page" element={<SettlementsPage />} />
            <Route path="analytics-page" element={<AnalyticsPage />} />
            <Route path="profile-settings" element={<ProfileSettings />} />
          </Route>
        </Route>

        {/* Fallback for any other route - Show 404 if not authenticated and route is not public */}
        {/* Or, if authenticated and route does not match any protected ones */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col justify-center items-center">
            <h1 className="text-2xl font-semibold text-gray-800">404 - Page Not Found</h1>
            {isAuthenticated ? (
                <Link to="/dashboard" className="mt-4 text-mint-600 hover:text-mint-500">Go to Dashboard</Link>
            ) : (
                <Link to="/login" className="mt-4 text-mint-600 hover:text-mint-500">Go to Login</Link>
            )}
          </div>
        } />
      </RouterRoutes>
    </BrowserRouter>
  );
};

const Routes = AppRoutes;
export default Routes;