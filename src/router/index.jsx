import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// Lazy-loaded page components
const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const Chat = lazy(() => import('../pages/Chat'));
const ShadowWork = lazy(() => import('../pages/ShadowWork'));
const Profile = lazy(() => import('../pages/Profile'));
const Subscription = lazy(() => import('../pages/Subscription'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/Admin'));
const AdminUsers = lazy(() => import('../components/admin/UserManagement'));
const AdminConversations = lazy(() => import('../components/admin/ConversationMonitor'));
const AdminPrompts = lazy(() => import('../components/admin/PromptManagement'));
const AdminAnalytics = lazy(() => import('../components/admin/Analytics'));
const AdminAIProviders = lazy(() => import('../components/admin/AIProviderSettings'));
const AdminSystemSettings = lazy(() => import('../components/admin/SystemSettings'));

// Route loader component
const PageLoader = ({ children }) => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
    {children}
  </Suspense>
);

// Router component
const AppRouter = () => {
  return (
    <Routes>
      {/* Main layout routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<PageLoader><Home /></PageLoader>} />
        <Route path="about" element={<PageLoader><About /></PageLoader>} />
        <Route path="chat" element={
          <ProtectedRoute>
            <PageLoader><Chat /></PageLoader>
          </ProtectedRoute>
        } />
        <Route path="shadow-work/:questionId?" element={
          <ProtectedRoute>
            <PageLoader><ShadowWork /></PageLoader>
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute>
            <PageLoader><Profile /></PageLoader>
          </ProtectedRoute>
        } />
        <Route path="subscription" element={
          <ProtectedRoute>
            <PageLoader><Subscription /></PageLoader>
          </ProtectedRoute>
        } />
      </Route>

      {/* Auth layout routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<PageLoader><Login /></PageLoader>} />
        <Route path="register" element={<PageLoader><Register /></PageLoader>} />
        <Route path="forgot-password" element={<PageLoader><ForgotPassword /></PageLoader>} />
        <Route path="" element={<Navigate to="/auth/login" replace />} />
      </Route>

      {/* Admin layout routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<PageLoader><AdminDashboard /></PageLoader>} />
        <Route path="users" element={<PageLoader><AdminUsers /></PageLoader>} />
        <Route path="conversations" element={<PageLoader><AdminConversations /></PageLoader>} />
        <Route path="prompts" element={<PageLoader><AdminPrompts /></PageLoader>} />
        <Route path="analytics" element={<PageLoader><AdminAnalytics /></PageLoader>} />
        <Route path="ai-providers" element={<PageLoader><AdminAIProviders /></PageLoader>} />
        <Route path="settings" element={<PageLoader><AdminSystemSettings /></PageLoader>} />
      </Route>

      {/* Legacy route redirects */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/register" element={<Navigate to="/auth/register" replace />} />
      
      {/* 404 route */}
      <Route path="*" element={<PageLoader><NotFound /></PageLoader>} />
    </Routes>
  );
};

export default AppRouter;