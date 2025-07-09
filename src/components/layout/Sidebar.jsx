import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiHome, 
  FiMessageCircle, 
  FiUser, 
  FiHeart, 
  FiWind,
  FiSearch,
  FiSettings,
  FiCreditCard
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import NewomenLogo from '../common/NewomenLogo';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { conversations } = useChatStore();

  const sidebarItems = [
    { id: 'home', label: t('home'), path: '/', icon: FiHome },
    { id: 'chat', label: t('chat'), path: '/chat', icon: FiMessageCircle, requiresAuth: true, badge: conversations?.length || 0 },
    { id: 'shadowWork', label: 'Shadow Work', path: '/shadow-work/1', icon: FiHeart, requiresAuth: true },
    { id: 'breathing', label: t('breathing'), path: '/breathing', icon: FiWind, requiresAuth: true },
    { id: 'search', label: t('search'), path: '/search', icon: FiSearch, requiresAuth: true },
    { id: 'profile', label: t('profile'), path: '/profile', icon: FiUser, requiresAuth: true },
    { id: 'subscription', label: t('subscription'), path: '/subscription', icon: FiCreditCard, requiresAuth: true },
    { id: 'settings', label: t('settings'), path: '/settings', icon: FiSettings, requiresAuth: true },
  ];

  const filteredItems = sidebarItems.filter(item => !item.requiresAuth || isAuthenticated);

  // Don't render on auth or admin pages, or if not authenticated
  if (location.pathname.startsWith('/auth') || location.pathname.startsWith('/admin') || !isAuthenticated) {
    return null;
  }

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-20 bottom-0 w-64 glass-sidebar backdrop-blur-xl border-r border-white/10 z-40 hidden md:block"
    >
      <div className="flex flex-col h-full">
        {/* User Profile Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <img 
              className="h-12 w-12 rounded-full border-2 border-white/20" 
              src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email}`} 
              alt={user?.name} 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredItems.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-xl"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className="relative flex items-center w-full">
                    <item.icon 
                      className={`w-5 h-5 mr-3 transition-colors ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`} 
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2"
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-center">
            <NewomenLogo size="sm" showText={false} />
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            {t('version')} 1.0.0
          </p>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-4 w-8 h-8 bg-primary-400/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-4 w-6 h-6 bg-secondary-400/10 rounded-full float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-accent-400/10 rounded-full float-slow"></div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
