import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon, 
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  BookOpenIcon,
  SparklesIcon,
  PlusIcon,
  FireIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ChatBubbleLeftRightIcon as ChatIconSolid,
  UserIcon as UserIconSolid,
  Cog6ToothIcon as SettingsIconSolid,
  MagnifyingGlassIcon as SearchIconSolid,
  HeartIcon as HeartIconSolid,
  BookOpenIcon as BookIconSolid,
  SparklesIcon as SparklesIconSolid,
  PlusIcon as PlusIconSolid,
  FireIcon as FireIconSolid,
  CalendarDaysIcon as CalendarIconSolid,
  ChartBarIcon as ChartIconSolid
} from '@heroicons/react/24/solid';

const MobileFooterNav = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
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
  const shouldHide = hideOnPaths.includes(location.pathname) || location.pathname.startsWith('/admin');

  if (shouldHide || !isAuthenticated) {
    return null;
  }

  // Core navigation items - most frequently used features
  const coreNavItems = [
    { 
      name: t('nav.home'), 
      href: '/', 
      icon: HomeIcon, 
      iconSolid: HomeIconSolid,
      color: 'text-purple-600',
      description: t('nav.homeDesc')
    },
    { 
      name: t('nav.chat'), 
      href: '/chat', 
      icon: ChatBubbleLeftRightIcon, 
      iconSolid: ChatIconSolid,
      color: 'text-blue-600',
      description: t('nav.chatDesc')
    },
    { 
      name: t('nav.profile'), 
      href: '/profile', 
      icon: UserIcon, 
      iconSolid: UserIconSolid,
      color: 'text-pink-600',
      description: t('nav.profileDesc')
    },
  ];

  // Growth & Development tools - organized by user journey
  const growthItems = [
    { 
      name: t('nav.shadowWork'), 
      href: '/shadow-work', 
      icon: BookOpenIcon, 
      iconSolid: BookIconSolid,
      color: 'text-indigo-600',
      description: t('nav.shadowWorkDesc'),
      category: 'growth'
    },
    { 
      name: t('nav.newMe'), 
      href: '/new-me', 
      icon: SparklesIcon, 
      iconSolid: SparklesIconSolid,
      color: 'text-yellow-600',
      description: t('nav.newMeDesc'),
      category: 'growth'
    },
    { 
      name: t('nav.breathing'), 
      href: '/breathing', 
      icon: HeartIcon, 
      iconSolid: HeartIconSolid,
      color: 'text-red-600',
      description: t('nav.breathingDesc'),
      category: 'wellness'
    },
    { 
      name: t('nav.personalityTest'), 
      href: '/personality-test', 
      icon: ChartBarIcon, 
      iconSolid: ChartIconSolid,
      color: 'text-emerald-600',
      description: t('nav.personalityTestDesc'),
      category: 'assessment'
    },
  ];

  // Utility & Settings - less frequently used but important
  const utilityItems = [
    { 
      name: t('nav.search'), 
      href: '/search', 
      icon: MagnifyingGlassIcon, 
      iconSolid: SearchIconSolid,
      color: 'text-green-600',
      description: t('nav.searchDesc'),
      category: 'utility'
    },
    { 
      name: t('nav.subscription'), 
      href: '/subscription', 
      icon: FireIcon, 
      iconSolid: FireIconSolid,
      color: 'text-orange-600',
      description: t('nav.subscriptionDesc'),
      category: 'utility'
    },
    { 
      name: t('nav.settings'), 
      href: '/settings', 
      icon: Cog6ToothIcon, 
      iconSolid: SettingsIconSolid,
      color: 'text-gray-600',
      description: t('nav.settingsDesc'),
      category: 'utility'
    },
  ];

  // Get current active section for better visual feedback
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.startsWith('/shadow-work') || path.startsWith('/new-me')) return 'growth';
    if (path.startsWith('/breathing') || path.startsWith('/personality-test')) return 'wellness';
    if (path.startsWith('/search') || path.startsWith('/subscription') || path.startsWith('/settings')) return 'utility';
    return 'core';
  };

  const currentSection = getCurrentSection();

  const renderNavItem = (item, isExpandedView = false) => {
    const Icon = item.icon;
    const IconSolid = item.iconSolid;
    const isActive = location.pathname === item.href || 
      (item.href !== '/' && location.pathname.startsWith(item.href));

    if (isExpandedView) {
      return (
        <Link
          key={item.name}
          to={item.href}
          className="flex flex-col items-center justify-center space-y-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 min-h-[80px]"
          onClick={() => setShowMore(false)}
        >
          <div className={`${isActive ? item.color : 'text-gray-600'}`}>
            {isActive ? <IconSolid className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
          </div>
          <div className="text-center">
            <span className={`text-xs font-medium block ${isActive ? item.color : 'text-gray-700'}`}>
              {item.name}
            </span>
            {item.description && (
              <span className="text-xs text-gray-500 mt-1 block leading-tight">
                {item.description}
              </span>
            )}
          </div>
        </Link>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-all duration-200 flex-1"
        onClick={() => setShowMore(false)}
      >
        <div className={`relative ${isActive ? item.color : 'text-gray-500'}`}>
          {isActive ? <IconSolid className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </div>
        <span className={`text-xs font-medium ${isActive ? item.color : 'text-gray-500'}`}>
          {item.name}
        </span>
      </Link>
    );
  };

  // Smart navigation button that shows current section context
  const renderMoreButton = () => {
    const getMoreButtonState = () => {
      switch (currentSection) {
        case 'growth':
          return { icon: SparklesIcon, color: 'text-yellow-600', label: t('nav.growth') };
        case 'wellness':
          return { icon: HeartIcon, color: 'text-red-600', label: t('nav.wellness') };
        case 'utility':
          return { icon: Cog6ToothIcon, color: 'text-gray-600', label: t('nav.tools') };
        default:
          return { icon: PlusIcon, color: 'text-gray-500', label: t('nav.more') };
      }
    };

    const buttonState = getMoreButtonState();
    const Icon = buttonState.icon;

    return (
      <button
        onClick={() => setShowMore(!showMore)}
        className="flex flex-col items-center justify-center space-y-1 p-2 flex-1"
      >
        <motion.div
          animate={{ 
            rotate: showMore ? 180 : 0,
            scale: showMore ? 1.1 : 1
          }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className={currentSection !== 'core' ? buttonState.color : 'text-gray-500'}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
        <span className={`text-xs font-medium ${currentSection !== 'core' ? buttonState.color : 'text-gray-500'}`}>
          {buttonState.label}
        </span>
      </button>
    );
  };

  return (
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/50 shadow-lg">
          <div className="flex items-center justify-between px-4 py-2">
            {/* Core navigation items */}
            {coreNavItems.map(item => renderNavItem(item))}
            
            {/* Smart More button */}
            {renderMoreButton()}
          </div>
        </div>
      </motion.div>

      {/* Expanded menu overlay */}
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
              <div className="bg-white/95 backdrop-blur-xl rounded-t-3xl border-t border-gray-200/50 shadow-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1 bg-gray-300 rounded-full" />
                </div>
                
                <div className="px-6 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('nav.exploreFeatures')}
                  </h3>
                  
                  {/* Growth & Development Section */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <SparklesIcon className="h-5 w-5 text-yellow-600 mr-2" />
                      <h4 className="text-sm font-semibold text-gray-800">
                        {t('nav.growthDevelopment')}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {growthItems.map(item => renderNavItem(item, true))}
                    </div>
                  </div>
                  
                  {/* Quick Tools Section */}
                  <div>
                    <div className="flex items-center mb-3">
                      <Cog6ToothIcon className="h-5 w-5 text-gray-600 mr-2" />
                      <h4 className="text-sm font-semibold text-gray-800">
                        {t('nav.quickTools')}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {utilityItems.map(item => renderNavItem(item, true))}
                    </div>
                  </div>
                  
                  {/* Usage tip */}
                  <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 text-center">
                      {t('nav.usageTip')}
                    </p>
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

export default MobileFooterNav;