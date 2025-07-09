import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon, 
  ChartBarIcon,
  Bars3Icon,
  SparklesIcon,
  HeartIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  FireIcon,
  ShieldCheckIcon,
  UsersIcon,
  PresentationChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ChatBubbleLeftRightIcon as ChatIconSolid,
  UserIcon as UserIconSolid,
  ChartBarIcon as ChartIconSolid,
  Bars3Icon as Bars3IconSolid,
  SparklesIcon as SparklesIconSolid,
  HeartIcon as HeartIconSolid,
  BookOpenIcon as BookIconSolid,
  MagnifyingGlassIcon as SearchIconSolid,
  Cog6ToothIcon as SettingsIconSolid,
  FireIcon as FireIconSolid,
  ShieldCheckIcon as ShieldIconSolid,
  UsersIcon as UsersIconSolid,
  PresentationChartBarIcon as PresentationIconSolid,
  CogIcon as CogIconSolid
} from '@heroicons/react/24/solid';

const RoleBasedMobileFooter = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, user, crystals, isAdmin } = useAuthStore();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const hideOnPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  const shouldHide = hideOnPaths.includes(location.pathname);

  // Show on home page even when not authenticated, otherwise require authentication
  if (shouldHide || (!isAuthenticated && location.pathname !== '/')) {
    return null;
  }

  // Get user role
  const userRole = user?.role || 'user';
  const isUserAdmin = isAdmin() || userRole === 'admin';

  // Define navigation items based on roles
  const getMainNavItems = () => {
    const baseItems = [
      { 
        name: t('nav.home'), 
        href: '/', 
        icon: HomeIcon, 
        iconSolid: HomeIconSolid,
        color: 'text-blue-600',
        roles: ['user', 'admin']
      },
      { 
        name: t('nav.chat'), 
        href: '/chat', 
        icon: ChatBubbleLeftRightIcon, 
        iconSolid: ChatIconSolid,
        color: 'text-green-600',
        roles: ['user', 'admin']
      },
    ];

    if (isUserAdmin) {
      baseItems.push({
        name: t('nav.admin'), 
        href: '/admin', 
        icon: ShieldCheckIcon, 
        iconSolid: ShieldIconSolid,
        color: 'text-red-600',
        roles: ['admin']
      });
    } else {
      baseItems.push({
        name: t('nav.analytics'), 
        href: '/analytics', 
        icon: ChartBarIcon, 
        iconSolid: ChartIconSolid,
        color: 'text-purple-600',
        roles: ['user']
      });
    }

    baseItems.push({
      name: t('nav.menu'), 
      href: '#', 
      icon: Bars3Icon, 
      iconSolid: Bars3IconSolid,
      color: 'text-indigo-600',
      isMenuToggle: true,
      roles: ['user', 'admin']
    });

    return baseItems.filter(item => item.roles.includes(userRole));
  };

  // Define expanded menu items based on roles
  const getExpandedMenuItems = () => {
    const userItems = [
      { 
        name: t('nav.shadowWork'), 
        href: '/shadow-work', 
        icon: BookOpenIcon, 
        iconSolid: BookIconSolid,
        color: 'text-indigo-600',
        description: t('nav.shadowWorkDesc'),
        roles: ['user', 'admin']
      },
      { 
        name: t('nav.breathing'), 
        href: '/breathing', 
        icon: HeartIcon, 
        iconSolid: HeartIconSolid,
        color: 'text-red-600',
        description: t('nav.breathingDesc'),
        roles: ['user', 'admin']
      },
      { 
        name: t('nav.newMe'), 
        href: '/new-me', 
        icon: SparklesIcon, 
        iconSolid: SparklesIconSolid,
        color: 'text-yellow-600',
        description: t('nav.newMeDesc'),
        roles: ['user', 'admin']
      },
      { 
        name: t('nav.search'), 
        href: '/search', 
        icon: MagnifyingGlassIcon, 
        iconSolid: SearchIconSolid,
        color: 'text-emerald-600',
        description: t('nav.searchDesc'),
        roles: ['user', 'admin']
      },
      { 
        name: t('nav.subscription'), 
        href: '/subscription', 
        icon: FireIcon, 
        iconSolid: FireIconSolid,
        color: 'text-orange-600',
        description: t('nav.subscriptionDesc'),
        roles: ['user', 'admin']
      },
      { 
        name: t('nav.settings'), 
        href: '/settings', 
        icon: Cog6ToothIcon, 
        iconSolid: SettingsIconSolid,
        color: 'text-gray-600',
        description: t('nav.settingsDesc'),
        roles: ['user', 'admin']
      },
    ];

    const adminItems = [
      { 
        name: 'User Management', 
        href: '/admin/users', 
        icon: UsersIcon, 
        iconSolid: UsersIconSolid,
        color: 'text-blue-600',
        description: 'Manage users and permissions',
        roles: ['admin']
      },
      { 
        name: 'Analytics Dashboard', 
        href: '/admin/analytics', 
        icon: PresentationChartBarIcon, 
        iconSolid: PresentationIconSolid,
        color: 'text-purple-600',
        description: 'View system analytics',
        roles: ['admin']
      },
      { 
        name: 'System Settings', 
        href: '/admin/system', 
        icon: CogIcon, 
        iconSolid: CogIconSolid,
        color: 'text-gray-600',
        description: 'Configure system settings',
        roles: ['admin']
      },
    ];

    const allItems = isUserAdmin ? [...adminItems, ...userItems] : userItems;
    return allItems.filter(item => item.roles.includes(userRole));
  };

  const mainNavItems = getMainNavItems();
  const expandedMenuItems = getExpandedMenuItems();

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const IconSolid = item.iconSolid;
    const isActive = location.pathname === item.href || 
      (item.href !== '/' && location.pathname.startsWith(item.href));

    if (item.isMenuToggle) {
      return (
        <button
          key={item.name}
          onClick={() => setShowMore(!showMore)}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 min-w-[48px] min-h-[48px] touch-target"
        >
          <motion.div
            animate={{ 
              rotate: showMore ? 90 : 0,
              scale: showMore ? 1.1 : 1
            }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            className="text-gray-600"
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        </button>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 min-w-[48px] min-h-[48px] touch-target"
      >
        <div className={`${isActive ? item.color : 'text-gray-600'} transition-colors duration-200`}>
          {isActive ? <IconSolid className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>
      </Link>
    );
  };

  const renderExpandedItem = (item) => {
    const Icon = item.icon;
    const IconSolid = item.iconSolid;
    const isActive = location.pathname === item.href || 
      (item.href !== '/' && location.pathname.startsWith(item.href));

    return (
      <Link
        key={item.name}
        to={item.href}
        className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200"
        onClick={() => setShowMore(false)}
      >
        <div className={`${isActive ? item.color : 'text-gray-600'} transition-colors duration-200`}>
          {isActive ? <IconSolid className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
        </div>
        <div className="flex-1">
          <div className={`font-medium text-sm ${isActive ? item.color : 'text-gray-900'}`}>
            {item.name}
          </div>
          {item.description && (
            <div className="text-xs text-gray-500 mt-1">
              {item.description}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Main Footer Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="mx-4 mb-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/20 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Navigation Items */}
              {mainNavItems.map(item => renderNavItem(item))}
              
              {/* Central User Profile */}
              <Link
                to="/profile"
                className="flex flex-col items-center justify-center relative"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  {/* User Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-lg ${
                    isUserAdmin 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIconSolid className="h-6 w-6 text-white" />
                    )}
                  </div>
                  
                  {/* Role Badge */}
                  {isUserAdmin && (
                    <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded-full shadow-lg">
                      👑
                    </div>
                  )}
                  
                  {/* Crystal Count Badge */}
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg min-w-[20px] flex items-center justify-center">
                    💎 {crystals || 0}
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded Menu Overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMore(false)}
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            >
              <div className="mx-4 mb-4">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/20 overflow-hidden">
                  {/* Handle */}
                  <div className="flex justify-center py-3">
                    <div className="w-12 h-1 bg-gray-300 rounded-full" />
                  </div>
                  
                  {/* User Profile Header */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                        isUserAdmin 
                          ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}>
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <UserIconSolid className="h-6 w-6 text-white" />
                        )}
                        {isUserAdmin && (
                          <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded-full shadow-lg">
                            👑
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{user?.name || t('nav.user')}</span>
                          {isUserAdmin && (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>💎 {crystals || 0} crystals</span>
                          <span>•</span>
                          <span className="capitalize">{userRole}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {isUserAdmin && (
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
                          Admin Tools
                        </div>
                        <div className="space-y-2">
                          {expandedMenuItems.filter(item => item.roles.includes('admin')).map(item => renderExpandedItem(item))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                        User Features
                      </div>
                      <div className="space-y-2">
                        {expandedMenuItems.filter(item => !item.roles.includes('admin') || item.roles.includes('user')).map(item => renderExpandedItem(item))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="text-center text-xs text-gray-500">
                      {isUserAdmin ? '👑 Admin Access • ' : ''}{t('nav.usageTip')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RoleBasedMobileFooter;