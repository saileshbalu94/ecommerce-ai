import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

// Layout components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreateContentPage from './pages/content/CreateContentPage';
import ContentHistoryPage from './pages/content/ContentHistoryPage';
import ContentDetailPage from './pages/content/ContentDetailPage';
import ProfilePage from './pages/user/ProfilePage';
import BrandVoicePage from './pages/BrandVoicePage';
import CreateBrandVoicePage from './pages/CreateBrandVoicePage';
import EditBrandVoicePage from './pages/EditBrandVoicePage';
import NotFoundPage from './pages/NotFoundPage';

// Context and hooks
import { useAuth } from './context/AuthContext';

const App = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        width="100%"
      >
        Loading...
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:resetToken" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="content">
          <Route path="create" element={<CreateContentPage />} />
          <Route path="history" element={<ContentHistoryPage />} />
          <Route path=":id" element={<ContentDetailPage />} />
        </Route>
        <Route path="profile" element={<ProfilePage />} />
        <Route path="brand-voice" element={<BrandVoicePage />} />
        <Route path="brand-voice/create" element={<CreateBrandVoicePage />} />
        <Route path="brand-voice/edit/:id" element={<EditBrandVoicePage />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;