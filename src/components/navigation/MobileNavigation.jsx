import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiMessageCircle, 
  FiMoon,
  FiUser, 
  FiCreditCard,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const MobileNavigation = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/chat', icon: FiMessageCircle, label: 'Chat' },
    { path: '/shadow-work', icon: FiMoon, label: 'Shadow' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const menuItems = [
    { path: '/subscription', icon: FiCreditCard, label: 'Subscription' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', icon: FiUser, label: 'Admin' });
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Glassmorphic Mobile Footer Navigation – pill shaped */}
      <motion.nav 
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 pointer-events-auto"
      >
        {/* Pill container */}
        <div
          className="flex items-center justify-between gap-1 bg-black/50 backdrop-blur-2xl border border-white/10 rounded-full px-3 py-2 shadow-lg safe-area-bottom w-[90vw] max-w-md mx-auto"
        >
          {/* Navigation items */}
          {navItems.map((item, idx) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="group relative flex-1"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-br from-primary-500/15 to-primary-600/20'
                    : 'hover:bg-glass-darkMedium'
                } ${idx !== 0 ? 'border-l border-white/10 pl-3' : ''}`}
              >
                <div className="relative">
                  <item.icon 
                    className={`relative z-10 w-6 h-6 transition-all duration-300 ${
                      isActive(item.path) 
                        ? 'text-white' 
                        : 'text-gray-300'
                    }`}
                  />
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 w-full h-full rounded-full bg-primary-600/70 blur-md animate-glow"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium transition-all duration-300 ${
                  isActive(item.path) 
                    ? 'text-white' 
                    : 'text-gray-300'
                }`}>
                  {item.label}
                </span>
                
                {/* Liquid animation on active */}
                {isActive(item.path) && (
                  <motion.div
                    className="absolute -bottom-1 w-1 h-1 bg-primary-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>
            </NavLink>
          ))}
          
          {/* Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(true)}
            className="flex-1 max-w-[64px] border-l border-white/10 ml-1"
          >
            <div className="flex flex-col items-center p-2 rounded-full hover:bg-glass-darkMedium transition-all duration-300">
              <FiMenu className="w-6 h-6 text-gray-300" />
              <span className="text-[10px] mt-1 font-medium text-gray-300">More</span>
            </div>
          </motion.button>
        </div>
      </motion.nav>

      {/* Fullscreen Glassmorphic Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 glass-modal-overlay z-50"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 bottom-24 z-50 glass-modal rounded-glass-lg p-6 max-w-sm mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Menu
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-glass-medium transition-all duration-300"
                >
                  <FiX className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>
              
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NavLink
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center p-4 rounded-2xl hover:bg-glass-medium transition-all duration-300 group"
                    >
                      <div className="p-2 rounded-full bg-gradient-to-br from-primary-500/10 to-primary-600/10 group-hover:from-primary-500/20 group-hover:to-primary-600/20 transition-all duration-300">
                        <item.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="ml-4 font-medium text-gray-700">
                        {item.label}
                      </span>
                    </NavLink>
                  </motion.div>
                ))}
              </div>
              
              {/* Liquid decoration */}
              <div className="absolute -top-20 -right-20 w-40 h-40 liquid-blob" />
              <div className="absolute -bottom-20 -left-20 w-32 h-32 liquid-blob animation-delay-2000" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </>
  );
};

export default MobileNavigation;
