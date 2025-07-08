import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
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

// Routing configuration
const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { 
        index: true, 
        element: <PageLoader><Home /></PageLoader>, 
        meta: { title: 'Your Journey to Authentic Self' } 
      },
      { 
        path: 'about',
        element: <PageLoader><About /></PageLoader>, 
        meta: { title: 'About Newomen' } 
      },
      { 
        path: 'chat',
        element: (
          <ProtectedRoute>
            <PageLoader><Chat /></PageLoader>
          </ProtectedRoute>
        ),
        meta: { title: 'AI Companion Chat' }
      },
      {
        path: 'shadow-work/:questionId?',
        element: (
          <ProtectedRoute>
            <PageLoader><ShadowWork /></PageLoader>
          </ProtectedRoute>
        ),
        meta: { title: 'Shadow Work Journey' }
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <PageLoader><Profile /></PageLoader>
          </ProtectedRoute>
        ),
        meta: { title: 'Your Profile' }
      },
      {
        path: 'subscription',
        element: (
          <ProtectedRoute>
            <PageLoader><Subscription /></PageLoader>
          </ProtectedRoute>
        ),
        meta: { title: 'Subscription Plans' }
      },
      { 
        path: '*', 
        element: <PageLoader><NotFound /></PageLoader>,
        meta: { title: 'Page Not Found' }
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <PageLoader><Login /></PageLoader>, meta: { title: 'Login' } },
      { path: 'register', element: <PageLoader><Register /></PageLoader>, meta: { title: 'Register' } },
      { path: 'forgot-password', element: <PageLoader><ForgotPassword /></PageLoader>, meta: { title: 'Forgot Password' } },
      { path: '', element: <Navigate to="/auth/login" replace /> }
    ]
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute adminOnly>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PageLoader><AdminDashboard /></PageLoader>, meta: { title: 'Admin Dashboard' } },
      { path: 'users', element: <PageLoader><AdminUsers /></PageLoader>, meta: { title: 'User Management' } },
      { path: 'conversations', element: <PageLoader><AdminConversations /></PageLoader>, meta: { title: 'Conversation Monitor' } },
      { path: 'prompts', element: <PageLoader><AdminPrompts /></PageLoader>, meta: { title: 'Prompt Management' } },
      { path: 'analytics', element: <PageLoader><AdminAnalytics /></PageLoader>, meta: { title: 'Analytics' } },
      { path: 'ai-providers', element: <PageLoader><AdminAIProviders /></PageLoader>, meta: { title: 'AI Provider Settings' } },
      { path: 'settings', element: <PageLoader><AdminSystemSettings /></PageLoader>, meta: { title: 'System Settings' } },
    ]
  },
  // Redirect legacy routes
  { path: '/login', element: <Navigate to="/auth/login" replace /> },
  { path: '/register', element: <Navigate to="/auth/register" replace /> }
];

export default routes;