import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiHome, 
  FiMessageCircle, 
  FiUser, 
  FiWind,
  FiInfo,
  FiCheckSquare,
  FiCreditCard, 
  FiZap,
  FiBookOpen,
  FiStar,
} from 'react-icons/fi';
import { FiHelpCircle } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

const MobileNavigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { conversations } = useChatStore();
  const [aiButtonAnimating, setAiButtonAnimating] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Main navigation items for the mobile footer - enhanced for core features
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: FiHome,
      gradient: 'from-blue-400 to-cyan-400'
    },
    {
      id: 'aiCompanion',
      label: 'AI Companion',
      path: '/chat',
      icon: FiMessageCircle,
      gradient: 'from-purple-400 to-pink-400'
    },
    {
      id: 'newMe',
      label: 'New me',
      path: '/new-me',
      icon: FiStar,
      gradient: 'from-yellow-400 to-orange-400'
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: FiUser,
      gradient: 'from-cyan-400 to-blue-500'
    },
  ];
  
  // Secondary navigation items
  const secondaryNavItems = [
    { 
      id: 'shadowWork', 
      label: 'Shadow Work',
      path: '/shadow-work/1',
      icon: FiBookOpen,
      gradient: 'from-pink-400 to-rose-400' 
    },
    { 
      id: 'personalityTest', 
      label: 'Personality Test',
      path: '/personality-test',
      icon: FiHelpCircle,
      gradient: 'from-amber-400 to-orange-400' 
    },
    { 
      id: 'breathing', 
      label: 'Breathing', 
      path: '/breathing', 
      icon: FiWind,
      gradient: 'from-blue-400 to-indigo-500'
    },
    { 
      id: 'about', 
      label: 'About', 
      path: '/about', 
      icon: FiInfo,
      gradient: 'from-emerald-400 to-teal-500'
    },
    { 
      id: 'subscription', 
      label: 'Subscription', 
      path: '/subscription', 
      icon: FiCreditCard, 
      requiresAuth: true,
      gradient: 'from-violet-400 to-purple-500'
    },
  ];

  const [showSecondaryMenu, setShowSecondaryMenu] = useState(false);
  
  const filteredNavItems = navItems.filter(item => !item.requiresAuth || isAuthenticated);
  const filteredSecondaryNavItems = secondaryNavItems.filter(item => !item.requiresAuth || isAuthenticated);

  // Trigger AI button animation
  const handleAiButtonClick = () => {
    setAiButtonAnimating(true);
    setTimeout(() => {
      setAiButtonAnimating(false);
      setShowSecondaryMenu(!showSecondaryMenu);
    }, 800);
  };

  // Don't render on auth or admin pages
  if (location.pathname.startsWith('/auth') || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Liquid Glassmorphic Mobile Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4"
        style={{ 
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
          transform: `translateY(${scrollPosition * 0.02}px)`
        }}
      >
        {/* Secondary Menu (More Options) */}
        <AnimatePresence>
          {showSecondaryMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute bottom-full mb-6 left-4 right-4"
              style={{
                filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.25))'
              }}
            >
              <div className="relative liquid-nav p-4 mb-2">
                {/* Liquid blob decorations */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/20 rounded-full filter blur-xl animate-liquid-blob"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/20 rounded-full filter blur-xl animate-liquid-blob animation-delay-4000"></div>
                
                {/* Secondary menu grid */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 relative z-10">
                  {filteredSecondaryNavItems.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={() => setShowSecondaryMenu(false)}
                      className={({ isActive }) =>
                        `relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 overflow-hidden group`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Background gradient effect */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 ${isActive ? 'opacity-20' : ''} transition-opacity duration-300`}></div>
                          
                          {/* Icon container with gradient border */}
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-3 rounded-xl relative ${
                              isActive ? 'bg-white/20 shadow-inner' : ''
                            } ${isActive ? 'border-2 border-white/20' : 'border border-white/10'}`}
                          >
                            {isActive && (
                              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20 rounded-xl`}></div>
                            )}
                            <item.icon 
                              className={`w-5 h-5 ${
                                isActive ? 'text-white' : 'text-white/70 group-hover:text-white/90'
                              }`} 
                            />
                          </motion.div>
                          
                          {/* Label */}
                          <span className="text-xs mt-2 font-medium text-white/80 group-hover:text-white">
                            {item.label}
                          </span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Floating Navigation Bar */}
        <div className="relative mb-2">
          {/* Main navigation bar with glassmorphic effect */}
          <motion.div 
            className="relative bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-3"
            style={{
              background: 'linear-gradient(145deg, rgba(55, 65, 81, 0.95), rgba(31, 41, 55, 0.95))',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            whileHover={{
              scale: 1.01,
              transition: { duration: 0.3 }
            }}
          >
            <div className="relative flex items-center justify-between px-2">
              {/* Left items */}
              <div className="flex flex-1 justify-center">
                {filteredNavItems.slice(0, 2).map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className="group mx-4"
                  >
                    {({ isActive }) => (
                      <div className="flex flex-col items-center py-2">
                        {/* Icon Container */}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="relative p-2 rounded-xl transition-all duration-300"
                        >
                          <item.icon 
                            className={`w-6 h-6 ${
                              isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'
                            }`} 
                          />
                        </motion.div>
                        
                        {/* Label */}
                        <span 
                          className={`text-xs mt-1 font-medium ${
                            isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
              
              {/* Center AI button */}
              <div className="relative -mt-6">
                <motion.button
                  onClick={handleAiButtonClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={aiButtonAnimating ? {
                    rotate: [0, 15, -15, 15, -15, 0],
                    scale: [1, 1.1, 1.1, 1.1, 1.1, 1],
                  } : {}}
                  transition={aiButtonAnimating ? {
                    duration: 0.8,
                    ease: "easeInOut",
                  } : {}}
                  className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4), 0 2px 10px rgba(236, 72, 153, 0.3)'
                  }}
                >
                  <FiZap className="w-7 h-7 text-white" />
                  
                  {/* Animated glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white/20"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </motion.button>
                
                {/* Label under AI button */}
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-purple-400 whitespace-nowrap">
                  AI
                </span>
              </div>
              
              {/* Right items */}
              <div className="flex flex-1 justify-center">
                {filteredNavItems.slice(2).map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className="group mx-4"
                  >
                    {({ isActive }) => (
                      <div className="flex flex-col items-center py-2">
                        {/* Icon Container */}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="relative p-2 rounded-xl transition-all duration-300"
                        >
                          <item.icon 
                            className={`w-6 h-6 ${
                              isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'
                            }`} 
                          />
                        </motion.div>
                        
                        {/* Label */}
                        <span 
                          className={`text-xs mt-1 font-medium ${
                            isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default MobileNavigation;
