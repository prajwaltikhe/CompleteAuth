import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import SignUpPage from '../pages/SignUpPage';
import LoginPage from '../pages/LoginPage';
import EmailVerifyPage from '../pages/EmailVerifyPage';
import DashboardPage from '../pages/DashboardPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import LoadingSpinner from '../components/LoadingSpinner';
import ResetPasswordPage from '../pages/ResetPasswordPage';

// Protected Routes
const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user.isVerified) return <Navigate to="/verify-email" replace />;

  return children;
};

const RedirectUsers = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) return <Navigate to="/" replace />;

  return children;
};

const AppRoutes = () => {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoutes>
            <DashboardPage />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectUsers>
            <SignUpPage />
          </RedirectUsers>
        }
      />
      <Route
        path="/login"
        element={
          <RedirectUsers>
            <LoginPage />
          </RedirectUsers>
        }
      />
      <Route path="/verify-email" element={<EmailVerifyPage />} />
      <Route
        path="/forgot-password"
        element={
          <RedirectUsers>
            <ForgotPasswordPage />
          </RedirectUsers>
        }
      />

      <Route
        path="/reset-password/:token"
        element={
          <RedirectUsers>
            <ResetPasswordPage />
          </RedirectUsers>
        }
      />
      {/* catch all routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
