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
const PersonalityTest = lazy(() => import('../pages/PersonalityTest'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const Chat = lazy(() => import('../pages/Chat'));
const BreathingPractices = lazy(() => import('../pages/BreathingPractices'));
const NicknameSearch = lazy(() => import('../pages/NicknameSearch'));
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
const AdminAIProviders = lazy(() => import('../components/admin/AIProviderManagement'));
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
        <Route path="breathing" element={
          <ProtectedRoute>
            <PageLoader><BreathingPractices /></PageLoader>
          </ProtectedRoute>
        } />
        <Route path="search" element={
          <ProtectedRoute>
            <PageLoader><NicknameSearch /></PageLoader>
          </ProtectedRoute>
        } />
        <Route path="personality-test" element={<PageLoader><PersonalityTest /></PageLoader>} />
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

// Static route definitions for metadata (used by MainLayout)
export const routes = [
  {
    path: '/',
    meta: { title: 'Home', description: 'AI-powered platform for women\'s mental health and personal growth.' },
    children: [
      { path: '', meta: { title: 'Home' } },
      { path: 'about', meta: { title: 'About' } },
      { path: 'chat', meta: { title: 'Chat' } },
      { path: 'shadow-work/:questionId?', meta: { title: 'Shadow Work' } },
        { path: 'profile', meta: { title: 'Profile' } },
        { path: 'breathing', meta: { title: 'Breathing Practices' } },
        { path: 'search', meta: { title: 'Search' } },
        { path: 'personality-test', meta: { title: 'Personality Test' } },
        { path: 'subscription', meta: { title: 'Subscription' } },
    ]
  },
  {
    path: '/auth',
    meta: { title: 'Auth' },
    children: [
      { path: 'login', meta: { title: 'Login' } },
      { path: 'register', meta: { title: 'Register' } },
      { path: 'forgot-password', meta: { title: 'Forgot Password' } },
    ]
  },
  {
    path: '/admin',
    meta: { title: 'Admin' },
    children: [
      { path: '', meta: { title: 'Admin Dashboard' } },
      { path: 'users', meta: { title: 'User Management' } },
      { path: 'conversations', meta: { title: 'Conversation Monitor' } },
      { path: 'prompts', meta: { title: 'Prompt Management' } },
      { path: 'analytics', meta: { title: 'Analytics' } },
      { path: 'ai-providers', meta: { title: 'AI Providers' } },
      { path: 'settings', meta: { title: 'System Settings' } },
    ]
  },
];

export default AppRouter;