import React, { useState, useEffect, useRef } from 'react';
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
  FiChevronDown,
  FiActivity
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [notifications] = useState([
    { id: 1, message: "Welcome to the new glassmorphic design!", read: false },
    { id: 2, message: "Your journey continues...", read: true }
  ]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change or clicking outside
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [location.pathname]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadNotifications = notifications.some(n => !n.read);

  // Reusable button component for consistent styling
  const GlassButton = ({ children, onClick, className = '' }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors duration-300 text-white flex items-center justify-center space-x-2 ${className}`}
    >
      {children}
    </motion.button>
  );

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'py-2 bg-slate-900/50 backdrop-blur-lg border-b border-white/10 shadow-xl' 
            : 'py-4 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div 
                className="relative w-10 h-10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg">
                  <span className="text-white font-bold text-xl z-10">N</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-primary-400/50 to-secondary-400/50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.div>
              <span className="text-xl font-bold text-white hidden sm:block">
                Newomen
              </span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center space-x-4">
                {isAuthenticated && (
                  <GlassButton className="relative !p-3">
                    <FiBell className="w-5 h-5" />
                    {unreadNotifications && (
                      <motion.span 
                        className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-800"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </GlassButton>
                )}
                
                <GlassButton onClick={toggleLanguage}>
                  <FiGlobe className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {i18n.language === 'en' ? 'العربية' : 'English'}
                  </span>
                </GlassButton>

                {isAuthenticated ? (
                  <div className="relative" ref={userMenuRef}>
                    <GlassButton onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                      <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium">{user?.name}</span>
                      <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </GlassButton>
                    
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-slate-800/70 backdrop-blur-xl border border-white/10 shadow-2xl"
                        >
            <Link to="/profile" className="menu-item">
              <FiUser /><span>{t('profile')}</span>
            </Link>
            <Link to="/breathing" className="menu-item">
              <FiActivity /><span>Breathing</span>
            </Link>
            {user?.role === 'admin' && (
                            <Link to="/admin" className="menu-item">
                              <FiSettings /><span>{t('admin')}</span>
                            </Link>
                          )}
                          <hr className="my-2 border-white/10" />
                          <button onClick={handleLogout} className="menu-item text-red-400 hover:!bg-red-500/20 w-full">
                            <FiLogOut /><span>{t('logout')}</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link to="/auth/login" className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-xl transition-colors">
                      {t('login')}
                    </Link>
                    <Link to="/auth/register" className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors shadow-lg">
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(true)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <FiMenu className="w-6 h-6 text-white" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu (Fullscreen Modal) */}
      <AnimatePresence>
        {isMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-lg"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="absolute bottom-0 left-0 right-0 h-[90%] p-6 bg-slate-800/80 border-t border-white/10 rounded-t-3xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold text-white">Menu</span>
                <motion.button whileTap={{ scale: 0.9, rotate: 90 }} onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full bg-white/10">
                  <FiX className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              <div className="flex-grow space-y-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">{user?.name}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="mobile-menu-item"><FiSettings /><span>{t('admin')}</span></Link>
                      )}
                      <Link to="/breathing" className="mobile-menu-item"><FiActivity /><span>Breathing</span></Link>
                    </>
                  ) : (
                  <div className="space-y-3">
                    <Link to="/auth/login" className="block w-full text-center py-3 bg-white/10 rounded-xl text-white font-semibold">
                      {t('login')}
                    </Link>
                    <Link to="/auth/register" className="block w-full text-center py-3 bg-primary-500 rounded-xl text-white font-semibold">
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-auto space-y-4">
                <button onClick={toggleLanguage} className="mobile-menu-item w-full">
                  <FiGlobe /><span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
                </button>
                {isAuthenticated && (
                  <button onClick={handleLogout} className="mobile-menu-item w-full text-red-400 hover:!bg-red-500/20">
                    <FiLogOut /><span>{t('logout')}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-20 md:h-24" />
      
      <style jsx global>{`
        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #E2E8F0; /* slate-200 */
          transition: background-color 0.2s;
        }
        .menu-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 1rem;
          font-size: 1rem;
          font-weight: 500;
          color: #E2E8F0; /* slate-200 */
          background-color: rgba(255, 255, 255, 0.05);
          transition: background-color 0.2s;
        }
        .mobile-menu-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        /* Define theme colors if not in Tailwind config */
        :root {
          --primary-400: #60a5fa;
          --primary-500: #3b82f6;
          --primary-600: #2563eb;
          --secondary-400: #f472b6;
          --secondary-500: #ec4899;
        }
        .bg-primary-500 { background-color: var(--primary-500); }
        .hover\\:bg-primary-600:hover { background-color: var(--primary-600); }
        .from-primary-400\\/50 { --tw-gradient-from: rgba(96, 165, 250, 0.5); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(96, 165, 250, 0)); }
        .from-primary-500 { --tw-gradient-from: var(--primary-500); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0)); }
        .to-secondary-400\\/50 { --tw-gradient-to: rgba(244, 114, 182, 0.5); }
        .to-secondary-500 { --tw-gradient-to: var(--secondary-500); }
      `}</style>
    </>
  );
};

export default Navbar;