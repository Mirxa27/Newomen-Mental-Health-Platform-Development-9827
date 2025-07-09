import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { Helmet } from 'react-helmet-async';

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
const ConnectionJourney = lazy(() => import('../pages/ConnectionJourney'));
const Profile = lazy(() => import('../pages/Profile'));
const Subscription = lazy(() => import('../pages/Subscription'));
const Settings = lazy(() => import('../pages/Settings'));
const NewMe = lazy(() => import('../pages/NewMe'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Onboarding = lazy(() => import('../pages/Onboarding'));

// Admin pages
const AdminDashboard = lazy(() => import('../pages/Admin'));
const AdminRealTime = lazy(() => import('../components/admin/RealTimeDashboard'));
const AdminUsers = lazy(() => import('../components/admin/UserManagement'));
const AdminConversations = lazy(() => import('../components/admin/ConversationMonitor'));
const AdminPrompts = lazy(() => import('../components/admin/PromptManagement'));
const AdminAnalytics = lazy(() => import('../components/admin/Analytics'));
const AdminAIProviders = lazy(() => import('../components/admin/AIProviderManagement'));
const AdminBranding = lazy(() => import('../components/admin/BrandingSettings'));
const AdminSystemSettings = lazy(() => import('../components/admin/SystemSettings'));
const AdminTherapeuticAgents = lazy(() => import('../components/admin/TherapeuticAgentConfig'));

// Enhanced route loader component with SEO metadata
const PageLoader = ({ children, title, description, keywords }) => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
    {title && (
      <Helmet>
        <title>{title} | Newomen Mental Health Platform</title>
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
        <meta property="og:title" content={`${title} | Newomen Mental Health Platform`} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | Newomen Mental Health Platform`} />
        {description && <meta name="twitter:description" content={description} />}
      </Helmet>
    )}
    {children}
  </Suspense>
);

// Dynamic route configuration for better maintainability
const createDynamicRoutes = () => {
  const mainRoutes = [
    {
      path: '',
      element: Home,
      meta: {
        title: 'Home',
        description: 'AI-powered platform for women\'s mental health and personal growth.',
        keywords: 'mental health, women, AI, personal growth, therapy'
      }
    },
    {
      path: 'about',
      element: About,
      meta: {
        title: 'About Us',
        description: 'Learn about our mission to empower women through AI-powered mental health support.',
        keywords: 'about, mission, women mental health, AI therapy'
      }
    },
    {
      path: 'chat',
      element: Chat,
      protected: true,
      meta: {
        title: 'AI Chat',
        description: 'Chat with our AI therapist for personalized mental health support.',
        keywords: 'AI chat, therapy, mental health support, counseling'
      }
    },
    {
      path: 'shadow-work/:questionId?',
      element: ShadowWork,
      protected: true,
      meta: {
        title: 'Shadow Work',
        description: 'Explore your inner self through guided shadow work exercises.',
        keywords: 'shadow work, self-discovery, psychology, inner growth'
      }
    },
    {
      path: 'profile',
      element: Profile,
      protected: true,
      meta: {
        title: 'Profile',
        description: 'Manage your profile and track your mental health journey.',
        keywords: 'profile, settings, mental health progress, personal data'
      }
    },
    {
      path: 'breathing',
      element: BreathingPractices,
      protected: true,
      meta: {
        title: 'Breathing Practices',
        description: 'Learn and practice breathing techniques for relaxation and stress relief.',
        keywords: 'breathing exercises, meditation, stress relief, relaxation'
      }
    },
    {
      path: 'search',
      element: NicknameSearch,
      protected: true,
      meta: {
        title: 'Search',
        description: 'Search for users and connect with the community.',
        keywords: 'search, community, users, social'
      }
    },
    {
      path: 'personality-test',
      element: PersonalityTest,
      meta: {
        title: 'Personality Test',
        description: 'Discover your personality type with our comprehensive assessment.',
        keywords: 'personality test, psychology, self-assessment, personality type'
      }
    },
    {
      path: 'subscription',
      element: Subscription,
      protected: true,
      meta: {
        title: 'Subscription',
        description: 'Choose your subscription plan for premium features.',
        keywords: 'subscription, premium, pricing, mental health services'
      }
    },
    {
      path: 'settings',
      element: Settings,
      protected: true,
      meta: {
        title: 'Settings',
        description: 'Customize your experience and manage your account settings.',
        keywords: 'settings, account, preferences, customization'
      }
    },
    {
      path: 'new-me',
      element: NewMe,
      protected: true,
      meta: {
        title: 'New Me - Daily Challenges',
        description: 'Take on daily challenges to transform yourself and build better habits.',
        keywords: 'daily challenges, personal growth, habits, self-improvement'
      }
    },
    {
      path: 'onboarding',
      element: Onboarding,
      protected: true,
      meta: {
        title: 'Onboarding',
        description: 'Complete your onboarding process to get the most out of Newomen.',
        keywords: 'onboarding, welcome, newomen, mental health'
      }
    }
  ];

  const authRoutes = [
    {
      path: 'login',
      element: Login,
      meta: {
        title: 'Login',
        description: 'Sign in to your account to access personalized mental health support.',
        keywords: 'login, sign in, account, authentication'
      }
    },
    {
      path: 'register',
      element: Register,
      meta: {
        title: 'Register',
        description: 'Create your account to start your mental health journey.',
        keywords: 'register, sign up, create account, join'
      }
    },
    {
      path: 'forgot-password',
      element: ForgotPassword,
      meta: {
        title: 'Forgot Password',
        description: 'Reset your password to regain access to your account.',
        keywords: 'forgot password, reset password, account recovery'
      }
    }
  ];

  const adminRoutes = [
    {
      path: '',
      element: AdminDashboard,
      meta: {
        title: 'Admin Dashboard',
        description: 'Administrative dashboard for managing the platform.',
        keywords: 'admin, dashboard, management, analytics'
      }
    },
    {
      path: 'realtime',
      element: AdminRealTime,
      meta: {
        title: 'Real-Time Metrics',
        description: 'Monitor platform metrics and user activity in real-time.',
        keywords: 'real-time, metrics, monitoring, analytics'
      }
    },
    {
      path: 'users',
      element: AdminUsers,
      meta: {
        title: 'User Management',
        description: 'Manage user accounts and permissions.',
        keywords: 'user management, accounts, permissions, administration'
      }
    },
    {
      path: 'conversations',
      element: AdminConversations,
      meta: {
        title: 'Conversation Monitor',
        description: 'Monitor and analyze user conversations.',
        keywords: 'conversations, monitoring, chat analysis, moderation'
      }
    },
    {
      path: 'prompts',
      element: AdminPrompts,
      meta: {
        title: 'Prompt Management',
        description: 'Manage AI prompts and responses.',
        keywords: 'prompts, AI management, responses, configuration'
      }
    },
    {
      path: 'analytics',
      element: AdminAnalytics,
      meta: {
        title: 'Analytics',
        description: 'View detailed analytics and reports.',
        keywords: 'analytics, reports, statistics, insights'
      }
    },
    {
      path: 'ai-providers',
      element: AdminAIProviders,
      meta: {
        title: 'AI Providers',
        description: 'Manage AI service providers and configurations.',
        keywords: 'AI providers, configuration, services, management'
      }
    },
    {
      path: 'branding',
      element: AdminBranding,
      meta: {
        title: 'Branding Settings',
        description: 'Customize platform branding and appearance.',
        keywords: 'branding, customization, appearance, settings'
      }
    },
    {
      path: 'settings',
      element: AdminSystemSettings,
      meta: {
        title: 'System Settings',
        description: 'Configure system-wide settings and preferences.',
        keywords: 'system settings, configuration, preferences, admin'
      }
    },
    {
      path: 'therapeutic-agents',
      element: AdminTherapeuticAgents,
      meta: {
        title: 'Therapeutic Agents',
        description: 'Configure therapeutic AI agents and their behaviors.',
        keywords: 'therapeutic agents, AI configuration, therapy, mental health'
      }
    }
  ];

  return { mainRoutes, authRoutes, adminRoutes };
};

// Router component
const AppRouter = () => {
  const { mainRoutes, authRoutes, adminRoutes } = createDynamicRoutes();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Main layout routes */}
        <Route path="/" element={<MainLayout />}>
          {mainRoutes.map((route, index) => {
            const RouteComponent = route.element;
            const element = route.protected ? (
              <ProtectedRoute>
                <PageLoader {...route.meta}>
                  <RouteComponent />
                </PageLoader>
              </ProtectedRoute>
            ) : (
              <PageLoader {...route.meta}>
                <RouteComponent />
              </PageLoader>
            );

            return route.path === '' ? (
              <Route key={index} index element={element} />
            ) : (
              <Route key={index} path={route.path} element={element} />
            );
          })}
          <Route path="/connection-journey" element={<ProtectedRoute><ConnectionJourney /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        </Route>

        {/* Auth layout routes */}
        <Route path="/auth" element={<AuthLayout />}>
          {authRoutes.map((route, index) => {
            const RouteComponent = route.element;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <PageLoader {...route.meta}>
                    <RouteComponent />
                  </PageLoader>
                }
              />
            );
          })}
          <Route path="" element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Admin layout routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          {adminRoutes.map((route, index) => {
            const RouteComponent = route.element;
            const element = (
              <PageLoader {...route.meta}>
                <RouteComponent />
              </PageLoader>
            );

            return route.path === '' ? (
              <Route key={index} index element={element} />
            ) : (
              <Route key={index} path={route.path} element={element} />
            );
          })}
        </Route>

        {/* Legacy route redirects */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/auth/register" replace />} />

        {/* 404 route */}
        <Route path="*" element={
          <PageLoader
            title="Page Not Found"
            description="The page you're looking for doesn't exist."
            keywords="404, not found, error"
          >
            <NotFound />
          </PageLoader>
        } />
      </Routes>
    </Suspense>
  );
};

// Generate static route definitions for metadata (used by MainLayout)
export const routes = (() => {
  const { mainRoutes, authRoutes, adminRoutes } = createDynamicRoutes();

  return [
    {
      path: '/',
      meta: { title: 'Home', description: 'AI-powered platform for women\'s mental health and personal growth.' },
      children: mainRoutes.map(route => ({
        path: route.path,
        meta: route.meta
      }))
    },
    {
      path: '/auth',
      meta: { title: 'Auth' },
      children: authRoutes.map(route => ({
        path: route.path,
        meta: route.meta
      }))
    },
    {
      path: '/admin',
      meta: { title: 'Admin' },
      children: adminRoutes.map(route => ({
        path: route.path,
        meta: route.meta
      }))
    },
  ];
})();

export default AppRouter;