import React, { useState, useEffect, useRef } from 'react';
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
  FiGlobe 
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import NewomenLogo from '../common/NewomenLogo';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const MainHeader = () => {
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

  const navItems = [
    { id: 'home', icon: FiHome, label: t('Home'), path: '/', requiresAuth: false },
    { id: 'chat', icon: FiMessageCircle, label: t('Chat'), path: '/chat', requiresAuth: true, badge: conversations.length > 0 ? conversations.length : null },
    { id: 'breathing', icon: FiWind, label: t('Breathe'), path: '/breathing', requiresAuth: true },
    { id: 'shadow-work', icon: FiHeart, label: t('Shadow'), path: '/shadow-work', requiresAuth: true },
    { id: 'profile', icon: FiUser, label: t('Profile'), path: '/profile', requiresAuth: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.requiresAuth || isAuthenticated);

  if (location.pathname.startsWith('/auth') || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Desktop Header */}
      {!isMobile && (
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav-scrolled' : 'glass-nav'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex-shrink-0">
                <NavLink to="/">
                  <NewomenLogo showText={!isScrolled} />
                </NavLink>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {filteredNavItems.map(item => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <button onClick={toggleLanguage} className="p-2 rounded-full text-gray-300 hover:bg-white/10 hover:text-white">
                    <FiGlobe className="h-6 w-6" />
                  </button>
                  {isAuthenticated ? (
                    <div className="ml-3 relative">
                      <div>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                          <span className="sr-only">Open user menu</span>
                          <img className="h-8 w-8 rounded-full" src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`} alt="" />
                        </button>
                      </div>
                      <AnimatePresence>
                        {isMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                          >
                            <div className="px-4 py-2 text-sm text-gray-700">{user.name}</div>
                            <NavLink to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"> <FiSettings className="inline-block mr-2" />{t('Settings')}</NavLink>
                            <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FiLogOut className="inline-block mr-2" />{t('Logout')}</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <NavLink to="/auth/login" className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600">
                      <FiLogIn className="inline-block mr-2" /> {t('Login')}
                    </NavLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {/* Mobile Header & Footer Nav */}
      {isMobile && (
        <>
          {/* Mobile Header */}
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav-scrolled' : 'glass-nav'}`}
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <NavLink to="/">
                  <NewomenLogo size="sm" showText={!isScrolled} />
                </NavLink>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full text-gray-300 hover:bg-white/10 hover:text-white">
                  {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </motion.header>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsMenuOpen(false)}
              >
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="fixed top-0 right-0 h-full w-64 bg-gray-900/80 backdrop-blur-lg p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-8">
                    <NewomenLogo showText={true} />
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full text-gray-300 hover:bg-white/10 hover:text-white">
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl">
                          <img className="h-14 w-14 rounded-full" src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`} alt="" />
                          <div>
                            <p className="font-semibold text-white text-lg">{user.name}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <NavLink to="/settings" className="flex items-center p-3 rounded-xl hover:bg-white/10 transition-colors duration-300 group"><FiSettings className="w-5 h-5 text-primary-400 mr-4" />{t('Settings')}</NavLink>
                        <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-xl hover:bg-white/10 transition-colors duration-300 group text-red-400"><FiLogOut className="w-5 h-5 mr-4" />{t('Logout')}</button>
                      </>
                    ) : (
                      <NavLink to="/auth/login" className="flex items-center p-3 rounded-xl hover:bg-white/10 transition-colors duration-300 group"><FiLogIn className="w-5 h-5 text-primary-400 mr-4" />{t('Login')}</NavLink>
                    )}
                    <div className="border-t border-white/10 my-4" />
                    <button onClick={toggleLanguage} className="w-full flex items-center p-3 rounded-xl hover:bg-white/10 transition-colors duration-300 group"><FiGlobe className="w-5 h-5 text-primary-400 mr-4" />{i18n.language === 'en' ? 'العربية' : 'English'}</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Footer Nav */}
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="mx-4 mb-4 relative">
              <div className="glass-mobile-nav rounded-3xl shadow-2xl overflow-hidden">
                <div className="relative flex items-center justify-around px-2 py-2">
                  {filteredNavItems.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={({ isActive }) =>
                        `relative flex flex-col items-center justify-center min-w-0 flex-1 group p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/20' : 'hover:bg-white/5'}`
                      }
                    >
                      <item.icon className={`w-6 h-6 mb-1 transition-all duration-300 ${location.pathname === item.path ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                      <span className={`text-xs transition-all duration-300 ${location.pathname === item.path ? 'text-white font-medium' : 'text-white/60 group-hover:text-white/80'}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center border-2 border-white/20"
                        >
                          {item.badge > 9 ? '9+' : item.badge}
                        </motion.div>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

export default MainHeader;
