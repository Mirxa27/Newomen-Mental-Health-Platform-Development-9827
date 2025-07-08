import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiSearch,
  FiPlus,
  FiUser, 
  FiCreditCard,
  FiMenu,
  FiX
} from 'react-icons/fi';
// Assuming useAuthStore is correctly set up with Zustand
// import { useAuthStore } from '../../store/authStore';

// Mock store for demonstration purposes
const useAuthStore = () => ({ user: { role: 'admin' } });

const MobileNavigation = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/search', icon: FiSearch, label: 'Search' },
    { path: '/add', icon: FiPlus, label: 'Add' },
    { path: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const menuItems = [
    { path: '/subscription', icon: FiCreditCard, label: 'Subscription' },
  ];

  // Conditionally add admin link
  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', icon: FiUser, label: 'Admin' });
  }

  return (
    <>
      {/* Main Glassmorphic Mobile Navigation */}
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 30, delay: 0.2 }}
        // Hides the navigation on non-mobile screens and ensures safe area padding
        className="md:hidden fixed left-0 right-0 z-50 flex justify-center pointer-events-auto"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        {/* Pill-shaped container with glassmorphic effect */}
        <div
          className="flex items-center justify-around gap-1 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full shadow-lg w-[95vw] max-w-sm mx-auto"
          // Adds padding to respect the iPhone home bar/notch area
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))', paddingTop: '0.5rem' }}
        >
          {/* Main Navigation Items */}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              // Use react-router's `isActive` for cleaner state checking
              className={({ isActive }) => `
                group relative flex-1 flex flex-col items-center justify-center p-2 rounded-full 
                transition-colors duration-300
                ${isActive ? '' : 'hover:bg-white/10'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <item.icon 
                      className={`relative z-10 w-6 h-6 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      }`}
                    />
                    {/* Animated highlight for the active tab */}
                    {isActive && (
                      <motion.div
                        layoutId="activeMobileTab"
                        className="absolute inset-[-8px] rounded-full bg-primary-500/40"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          
          {/* "More" Menu Button */}
          <div className="self-stretch border-l border-white/10 mx-1" />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(true)}
            className="group flex-1 max-w-[64px] flex flex-col items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors duration-300"
          >
            <FiMenu className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors duration-300" />
            <span className="text-[10px] mt-1 font-medium text-gray-300 group-hover:text-white transition-colors duration-300">More</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Fullscreen Glassmorphic "More" Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 bottom-[110px] z-[70] p-6 rounded-3xl overflow-hidden
                         bg-gray-800/50 backdrop-blur-2xl border border-white/10 shadow-2xl"
              style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
            >
              {/* Decorative Liquid Blobs */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/30 rounded-full filter blur-3xl animate-liquid-blob" />
              <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-secondary-500/30 rounded-full filter blur-3xl animate-liquid-blob animation-delay-2000" />

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Menu</h3>
                  <motion.button
                    whileTap={{ scale: 0.9, rotate: 90 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
                  >
                    <FiX className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
                
                <div className="space-y-2">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <NavLink
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center p-3 rounded-xl hover:bg-white/10 transition-colors duration-300 group"
                      >
                        <div className="p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
                          <item.icon className="w-5 h-5 text-primary-400" />
                        </div>
                        <span className="ml-4 font-medium text-gray-200">{item.label}</span>
                      </NavLink>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* 
        Self-contained styles for portability. 
        These define the custom animations for the liquid glassmorphic effect.
        (Requires a CSS-in-JS solution like styled-jsx or Emotion, or add to global CSS)
      */}
      <style jsx global>{`
        @keyframes liquid-blob-animation {
          0% { transform: scale(1) translate(0px, 0px); }
          33% { transform: scale(1.1) translate(20px, -30px); }
          66% { transform: scale(0.9) translate(-20px, 20px); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        .animate-liquid-blob {
          animation: liquid-blob-animation 15s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: -7s; /* Use negative delay to start at a different point */
        }
        /* Define primary/secondary colors if not in Tailwind config */
        :root {
          --primary-400: #60a5fa; /* Example: blue-400 */
          --primary-500: #3b82f6; /* Example: blue-500 */
          --secondary-500: #ec4899; /* Example: pink-500 */
        }
        .bg-primary-500\\/40 { background-color: rgba(59, 130, 246, 0.4); }
        .bg-primary-500\\/30 { background-color: rgba(59, 130, 246, 0.3); }
        .bg-secondary-500\\/30 { background-color: rgba(236, 72, 153, 0.3); }
        .text-primary-400 { color: var(--primary-400); }
      `}</style>
    </>
  );
};

export default MobileNavigation;