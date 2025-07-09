import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

// Centralized navigation hook
export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, requireAuth, requireAdmin } = useAuth();

  // Check if current path matches given path
  const isCurrentPath = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Check if current path is active for navigation items
  const isActiveNavItem = (path) => {
    return isCurrentPath(path);
  };

  // Navigate with authentication check
  const navigateWithAuth = (path) => {
    if (requireAuth()) {
      navigate(path);
    }
  };

  // Navigate with admin check
  const navigateWithAdmin = (path) => {
    if (requireAdmin()) {
      navigate(path);
    }
  };

  // Safe navigation (won't break if path doesn't exist)
  const safeNavigate = (path, options = {}) => {
    try {
      navigate(path, options);
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/');
    }
  };

  // Get current page title based on path
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    
    // Map of paths to titles
    const titleMap = {
      '/': 'Home',
      '/chat': 'Chat',
      '/profile': 'Profile',
      '/shadow-work': 'Shadow Work',
      '/breathing': 'Breathing Practices',
      '/personality-test': 'Personality Test',
      '/subscription': 'Subscription',
      '/auth/login': 'Login',
      '/auth/register': 'Register',
      '/auth/forgot-password': 'Forgot Password',
      '/admin': 'Admin Dashboard',
      '/admin/users': 'User Management',
      '/admin/conversations': 'Conversation Monitor',
      '/admin/prompts': 'Prompt Management',
      '/admin/analytics': 'Analytics',
      '/admin/ai-providers': 'AI Providers',
      '/admin/branding': 'Branding Settings',
      '/admin/settings': 'System Settings',
    };

    // Handle dynamic routes
    if (path.startsWith('/shadow-work/') && path.length > '/shadow-work/'.length) {
      const questionId = path.split('/')[2];
      return `Shadow Work Question ${questionId}`;
    }

    return titleMap[path] || 'Newomen';
  };

  // Get breadcrumbs for current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [{ title: 'Home', path: '/' }];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip adding breadcrumb for the last segment if it's the current page
      if (index < segments.length - 1 || segments.length === 1) {
        breadcrumbs.push({
          title: segment.charAt(0).toUpperCase() + segment.slice(1),
          path: currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  // Common navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Home', path: '/', icon: 'FiHome', requiresAuth: false },
      { name: 'Chat', path: '/chat', icon: 'FiMessageCircle', requiresAuth: true },
      { name: 'Breathe', path: '/breathing', icon: 'FiWind', requiresAuth: true },
      { name: 'Shadow Work', path: '/shadow-work', icon: 'FiHeart', requiresAuth: true },
      { name: 'Profile', path: '/profile', icon: 'FiUser', requiresAuth: true },
    ];

    return baseItems.filter(item => !item.requiresAuth || isAuthenticated);
  };

  // Admin navigation items
  const getAdminNavigationItems = () => {
    return [
      { name: 'Dashboard', path: '/admin', icon: 'FiHome' },
      { name: 'Users', path: '/admin/users', icon: 'FiUsers' },
      { name: 'Conversations', path: '/admin/conversations', icon: 'FiMessageSquare' },
      { name: 'Prompts', path: '/admin/prompts', icon: 'FiEdit' },
      { name: 'Analytics', path: '/admin/analytics', icon: 'FiBarChart3' },
      { name: 'AI Providers', path: '/admin/ai-providers', icon: 'FiCpu' },
      { name: 'Branding', path: '/admin/branding', icon: 'FiImage' },
      { name: 'Settings', path: '/admin/settings', icon: 'FiSettings' },
    ];
  };

  // Check if we're on a specific route type
  const isAuthRoute = () => location.pathname.startsWith('/auth');
  const isAdminRoute = () => location.pathname.startsWith('/admin');
  const isPublicRoute = () => ['/', '/about', '/personality-test'].includes(location.pathname);

  return {
    // State
    location,
    pathname: location.pathname,
    
    // Navigation functions
    navigate,
    navigateWithAuth,
    navigateWithAdmin,
    safeNavigate,
    
    // Path utilities
    isCurrentPath,
    isActiveNavItem,
    getCurrentPageTitle,
    getBreadcrumbs,
    
    // Navigation items
    getNavigationItems,
    getAdminNavigationItems,
    
    // Route type checks
    isAuthRoute,
    isAdminRoute,
    isPublicRoute,
  };
};

export default useNavigation;