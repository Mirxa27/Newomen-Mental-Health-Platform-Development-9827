import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiMessageCircle, 
  FiUser, 
  FiHeart, 
  FiWind, 
  FiLogIn, 
  FiLogOut, 
  FiSettings, 
  FiGlobe,
  FiInfo,
  FiCreditCard,
  FiSearch,
  FiCheckSquare 
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import NewomenLogo from '../common/NewomenLogo';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { conversations } = useChatStore();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  // Primary navigation items - these appear in the main navbar
  const navItems = [
    { id: 'home', label: t('home'), path: '/', icon: FiHome },
    { id: 'chat', label: t('chat'), path: '/chat', icon: FiMessageCircle, requiresAuth: true, badge: conversations?.length || 0 },
    { id: 'shadowWork', label: t('shadowWork'), path: '/shadow-work/1', icon: FiHeart, requiresAuth: true },
    { id: 'breathing', label: t('breathing'), path: '/breathing', icon: FiWind, requiresAuth: true },
    { id: 'personalityTest', label: t('personalityTest'), path: '/personality-test', icon: FiCheckSquare },
    { id: 'about', label: t('about'), path: '/about', icon: FiInfo },
  ];
  
  // Secondary navigation items - these appear in a dropdown or secondary menu
  const secondaryNavItems = [
    { id: 'search', label: t('search'), path: '/search', icon: FiSearch, requiresAuth: true },
    { id: 'subscription', label: t('subscription'), path: '/subscription', icon: FiCreditCard, requiresAuth: true },
    { id: 'profile', label: t('profile'), path: '/profile', icon: FiUser, requiresAuth: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.requiresAuth || isAuthenticated);
  const filteredSecondaryNavItems = secondaryNavItems.filter(item => !item.requiresAuth || isAuthenticated);

  // Don't render on auth or admin pages
  if (location.pathname.startsWith('/auth') || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-nav-scrolled' : 'glass-nav'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/">
              <NewomenLogo showText={!isScrolled || !isMobile} />
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {filteredNavItems.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                        isActive 
                          ? 'bg-white/10 text-white' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {item.badge > 9 ? '9+' : item.badge}
                        </motion.div>
                      )}
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* Desktop User Menu */}
          {!isMobile && (
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button 
                  onClick={toggleLanguage} 
                  className="p-2 rounded-full text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label={t('switchLanguage')}
                >
                  <FiGlobe className="h-6 w-6" />
                </button>
                
                {isAuthenticated ? (
                  <div className="ml-3 relative">
                    <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)} 
                      className="max-w-xs bg-gray-800/50 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-all hover:bg-gray-700/50"
                      aria-expanded={isMenuOpen}
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      <img 
                        className="h-8 w-8 rounded-full border-2 border-white/20" 
                        src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`} 
                        alt={user.name || t('userProfile')} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -20 }}
                          transition={{ duration: 0.2 }}
                          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 glass-dropdown ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="user-menu"
                        >
                          {/* User info at top of dropdown */}
                          <div className="px-4 py-2 border-b border-white/10">
                            <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                            <p className="text-xs text-gray-300 truncate">{user.email}</p>
                          </div>
                          
                          {/* Secondary navigation items */}
                          {filteredSecondaryNavItems.map(item => (
                            <NavLink
                              key={item.id}
                              to={item.path}
                              className={({ isActive }) => 
                                `block px-4 py-2 text-sm ${
                                  isActive 
                                    ? 'bg-white/10 text-white' 
                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`
                              }
                              role="menuitem"
                            >
                              <div className="flex items-center space-x-2">
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                              </div>
                            </NavLink>
                          ))}
                          
                          {/* Admin access if user has admin role */}
                          {user.role === 'admin' && (
                            <NavLink 
                              to="/admin" 
                              className={({ isActive }) => 
                                `block px-4 py-2 text-sm border-t border-white/10 ${
                                  isActive 
                                    ? 'bg-white/10 text-white' 
                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                }`
                              }
                              role="menuitem"
                            >
                              <div className="flex items-center space-x-2">
                                <FiSettings className="w-4 h-4" />
                                <span>{t('adminDashboard')}</span>
                              </div>
                            </NavLink>
                          )}
                          
                          {/* Logout button */}
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white border-t border-white/10"
                            role="menuitem"
                          >
                            <div className="flex items-center space-x-2">
                              <FiLogOut className="w-4 h-4" />
                              <span>{t('signOut')}</span>
                            </div>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="ml-3 flex items-center space-x-2">
                    <NavLink
                      to="/auth/login"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      <FiLogIn className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                      {t('signIn')}
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobile && (
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-dropdown border-t border-white/10"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {filteredNavItems.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive 
                          ? 'bg-white/10 text-white' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.badge > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          {item.badge > 9 ? '9+' : item.badge}
                        </motion.div>
                      )}
                    </div>
                  </NavLink>
                ))}

                {/* Add secondary items to mobile dropdown menu */}
                {filteredSecondaryNavItems.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive 
                          ? 'bg-white/10 text-white' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                ))}
              </div>

              {/* Mobile user menu */}
              {isAuthenticated ? (
                <div className="pt-4 pb-3 border-t border-white/10">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full border-2 border-white/20"
                        src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
                        alt={user.name || t('userProfile')}
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{user.name || user.email}</div>
                      <div className="text-sm font-medium text-gray-300">{user.email}</div>
                    </div>
                    <button
                      onClick={toggleLanguage}
                      className="ml-auto p-2 rounded-full text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                      aria-label={t('switchLanguage')}
                    >
                      <FiGlobe className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="mt-3 px-2 space-y-1">
                    {/* Admin access if user has admin role */}
                    {user.role === 'admin' && (
                      <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                            isActive 
                              ? 'bg-white/10 text-white' 
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`
                        }
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <FiSettings className="w-5 h-5" />
                          <span>{t('adminDashboard')}</span>
                        </div>
                      </NavLink>
                    )}
                    
                    {/* Logout button */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                    >
                      <div className="flex items-center space-x-2">
                        <FiLogOut className="w-5 h-5" />
                        <span>{t('signOut')}</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-white/10">
                  <div className="px-5 flex justify-between">
                    <NavLink
                      to="/auth/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiLogIn className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                      {t('signIn')}
                    </NavLink>
                    
                    <NavLink
                      to="/auth/register"
                      className="inline-flex items-center px-4 py-2 border border-white/20 text-sm font-medium rounded-md text-white bg-transparent hover:bg-white/5 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('signUp')}
                    </NavLink>
                    
                    <button
                      onClick={toggleLanguage}
                      className="p-2 rounded-full text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                      aria-label={t('switchLanguage')}
                    >
                      <FiGlobe className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.header>
  );
};

export default Navbar;
