import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiMenu, 
  FiX, 
  FiGlobe, 
  FiUser, 
  FiLogOut, 
  FiBell, 
  FiSettings,
  FiChevronDown
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, message: "Welcome to the new glassmorphic design!", read: false },
    { id: 2, message: "Your journey continues...", read: true }
  ]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`glass-nav fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-2' : 'py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo with liquid animation */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <span className="text-white font-bold text-lg z-10">N</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-primary-400 to-secondary-400"
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{ opacity: 0.5 }}
                  />
                </div>
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              <span className="text-mobile-heading font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Newomen
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-3 rounded-2xl glass hover:bg-glass-medium transition-all duration-300"
                >
                  <FiBell className="w-5 h-5 text-gray-700" />
                  {notifications.some(n => !n.read) && (
                    <motion.span 
                      className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLanguage} 
                className="glass-button flex items-center space-x-2"
              >
                <FiGlobe className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {i18n.language === 'en' ? 'العربية' : 'English'}
                </span>
              </motion.button>

              {isAuthenticated ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="glass-button flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{user?.name}</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 glass-modal rounded-glass py-2 overflow-hidden"
                      >
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-glass-medium transition-all duration-300"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <FiUser className="w-4 h-4 text-primary-600" />
                          <span className="text-sm font-medium">{t('profile')}</span>
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-glass-medium transition-all duration-300"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <FiSettings className="w-4 h-4 text-primary-600" />
                            <span className="text-sm font-medium">{t('admin')}</span>
                          </Link>
                        )}
                        <hr className="my-2 border-gray-200/20" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 w-full hover:bg-red-50/10 transition-all duration-300 text-red-600"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span className="text-sm font-medium">{t('logout')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/auth/login" 
                    className="glass-button text-gray-700"
                  >
                    {t('login')}
                  </Link>
                  <Link 
                    to="/auth/register" 
                    className="glass-button-primary"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 rounded-2xl glass hover:bg-glass-medium transition-all duration-300"
            >
              {isMenuOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 mt-4"
            >
              <div className="px-4 py-4 space-y-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleLanguage}
                  className="w-full glass-button justify-start"
                >
                  <FiGlobe className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">
                    {i18n.language === 'en' ? 'العربية' : 'English'}
                  </span>
                </motion.button>

                {isAuthenticated ? (
                  <>
                    <div className="glass rounded-2xl p-4 space-y-3">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user?.name}</p>
                          <p className="text-sm text-gray-600">{user?.email}</p>
                        </div>
                      </div>
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-glass-medium transition-all duration-300"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FiSettings className="w-5 h-5 text-primary-600" />
                          <span className="font-medium">{t('admin')}</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 p-3 w-full rounded-xl hover:bg-red-50/10 transition-all duration-300 text-red-600"
                      >
                        <FiLogOut className="w-5 h-5" />
                        <span className="font-medium">{t('logout')}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/auth/login"
                      className="block w-full glass-button text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('login')}
                    </Link>
                    <Link
                      to="/auth/register"
                      className="block w-full glass-button-primary text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Spacer with liquid decoration */}
      <div className="relative h-20 md:h-24">
        <div className="absolute top-0 left-1/4 w-64 h-64 liquid-blob opacity-30" />
        <div className="absolute top-0 right-1/4 w-48 h-48 liquid-blob opacity-20 animation-delay-2000" />
      </div>
      
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </>
  );
};

export default Navbar;
