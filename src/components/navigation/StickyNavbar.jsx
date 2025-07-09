import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  UserIcon, 
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  BookOpenIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const StickyNavbar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 10);
      
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

  if (shouldHide || !isAuthenticated) {
    return null;
  }

  const navigationItems = [
    { name: t('nav.home'), href: '/', icon: HomeIcon },
    { name: t('nav.chat'), href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: t('nav.shadowWork'), href: '/shadow-work', icon: BookOpenIcon },
    { name: t('nav.breathing'), href: '/breathing', icon: HeartIcon },
    { name: t('nav.search'), href: '/search', icon: MagnifyingGlassIcon },
    { name: t('nav.newMe'), href: '/new-me', icon: SparklesIcon },
    { name: t('nav.profile'), href: '/profile', icon: UserIcon },
    { name: t('nav.settings'), href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {t('brand.name')}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-100 text-purple-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            {user && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user.name || t('nav.user')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StickyNavbar;