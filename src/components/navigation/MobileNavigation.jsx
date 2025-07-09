import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiHome, 
  FiMessageCircle, 
  FiUser, 
  FiHeart, 
  FiWind,
  FiInfo,
  FiCheckSquare,
  FiSearch,
  FiCreditCard,
  FiZap,
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

  // Main navigation items for the mobile footer - modified selection for better UX
  const navItems = [
    { 
      id: 'home', 
      label: t('home'), 
      path: '/', 
      icon: FiHome,
      gradient: 'from-blue-400 to-cyan-400'
    },
    { 
      id: 'chat', 
      label: t('chat'), 
      path: '/chat', 
      icon: FiMessageCircle, 
      requiresAuth: true, 
      badge: conversations?.length || 0,
      gradient: 'from-indigo-400 to-blue-500'
    },
    // AI button will be in the center
    { 
      id: 'shadowWork',
      label: t('shadowWork'), 
      path: '/shadow-work/1', 
      icon: FiHeart, 
      requiresAuth: true,
      gradient: 'from-pink-400 to-rose-400'
    },
    { 
      id: 'breathing', 
      label: t('breathing'), 
      path: '/breathing', 
      icon: FiWind, 
      requiresAuth: true,
      gradient: 'from-purple-400 to-indigo-400'
    },
  ];
  
  // Secondary navigation items
  const secondaryNavItems = [
    { 
      id: 'personalityTest', 
      label: t('personalityTest'),
      path: '/personality-test',
      icon: FiHelpCircle,
      gradient: 'from-amber-400 to-orange-400' 
    },
    { 
      id: 'about', 
      label: t('about'), 
      path: '/about', 
      icon: FiInfo,
      gradient: 'from-emerald-400 to-teal-500'
    },
    { 
      id: 'search', 
      label: t('search'), 
      path: '/search', 
      icon: FiSearch, 
      requiresAuth: true,
      gradient: 'from-sky-400 to-blue-500'
    },
    { 
      id: 'subscription', 
      label: t('subscription'), 
      path: '/subscription', 
      icon: FiCreditCard, 
      requiresAuth: true,
      gradient: 'from-violet-400 to-purple-500'
    },
    { 
      id: 'profile', 
      label: t('profile'), 
      path: '/profile', 
      icon: FiUser, 
      requiresAuth: true,
      gradient: 'from-cyan-400 to-blue-500'
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
          {/* Liquid blobs outside nav bar */}
          <motion.div 
            className="absolute -top-16 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full filter blur-2xl"
            animate={{ 
              x: [0, 10, -10, 0],
              y: [0, -10, 10, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
          <motion.div 
            className="absolute -bottom-8 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full filter blur-2xl"
            animate={{ 
              x: [0, -10, 10, 0],
              y: [0, 10, -10, 0],
              scale: [1, 0.95, 1.05, 1]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1 
            }}
          />
          
          {/* Main navigation bar with glassmorphic effect */}
          <motion.div 
            className="liquid-nav-floating"
            whileHover={{
              scale: 1.01,
              transition: { duration: 0.3 }
            }}
          >
            <div className="relative flex items-center justify-between px-4 py-2">
              {/* Left items */}
              <div className="flex flex-1 justify-around">
                {filteredNavItems.slice(0, 2).map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => `group`}
                  >
                    {({ isActive }) => (
                      <div className="flex flex-col items-center py-2 px-3">
                        {/* Icon Container */}
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className={`relative p-3 rounded-xl transition-all duration-300 overflow-hidden
                            ${isActive ? 'shadow-lg' : ''}
                          `}
                        >
                          {/* Active/hover gradient background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 
                            group-hover:opacity-20 ${isActive ? 'opacity-30' : ''} transition-opacity duration-300 rounded-xl`}
                          />
                          
                          {/* Border effect */}
                          <div className={`absolute inset-0 rounded-xl ${isActive ? 'border-2 border-white/20' : 'border border-white/5'}`}/>
                          
                          <item.icon 
                            className={`relative z-10 w-6 h-6 ${
                              isActive ? 'text-white' : 'text-white/70 group-hover:text-white/90'
                            }`} 
                          />
                          
                          {/* Badge */}
                          {item.badge > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-900/80"
                            >
                              {item.badge > 9 ? '9+' : item.badge}
                            </motion.div>
                          )}
                        </motion.div>
                        
                        {/* Label */}
                        <motion.span 
                          className={`text-xs mt-1 font-medium ${
                            isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                          }`}
                          animate={{ 
                            scale: isActive ? 1.05 : 1
                          }}
                        >
                          {item.label}
                        </motion.span>
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
              
              {/* Center AI button */}
              <div className="relative -mt-8">
                <motion.button
                  onClick={handleAiButtonClick}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={aiButtonAnimating ? {
                    rotate: [0, 15, -15, 15, -15, 0],
                    scale: [1, 1.2, 1.2, 1.2, 1.2, 1],
                  } : {}}
                  transition={aiButtonAnimating ? {
                    duration: 0.8,
                    ease: "easeInOut",
                  } : {}}
                  className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 ai-button-glow ai-pulse"
                >
                  {/* Animated robot/AI face */}
                  <div className="relative w-full h-full p-3">
                    {/* AI Brain or Robot Face */}
                    {aiButtonAnimating ? (
                      // Animated AI face during activation
                      <motion.div className="w-full h-full relative">
                        {/* Animated pulses */}
                        <motion.div
                          className="absolute inset-0 rounded-full bg-white/30"
                          initial={{ scale: 0, opacity: 0.8 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 1, repeat: 1 }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full bg-white/20"
                          initial={{ scale: 0, opacity: 0.6 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 1, delay: 0.2, repeat: 1 }}
                        />
                        
                        {/* AI face animating */}
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                          <motion.path
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            d="M 6,12 C 6,8 8,5 12,5 C 16,5 18,8 18,12"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                          />
                          <motion.circle
                            cx="8"
                            cy="10"
                            r="1.5"
                            fill="white"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                          />
                          <motion.circle
                            cx="16"
                            cy="10"
                            r="1.5"
                            fill="white"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                          />
                          <motion.path
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            d="M 9,16 C 10,17 14,17 15,16"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.6 }}
                          />
                        </svg>
                      </motion.div>
                    ) : (
                      // Default AI icon
                      <motion.div
                        className="w-full h-full flex items-center justify-center"
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        <FiZap className="w-8 h-8 text-white" />
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Animated glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white/20"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </motion.button>
                
                {/* Label under AI button */}
                <motion.span 
                  className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white/90 whitespace-nowrap"
                  animate={{
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {showSecondaryMenu ? t('close') : "AI"}
                </motion.span>
              </div>
              
              {/* Right items */}
              <div className="flex flex-1 justify-around">
                {filteredNavItems.slice(2).map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => `group`}
                  >
                    {({ isActive }) => (
                      <div className="flex flex-col items-center py-2 px-3">
                        {/* Icon Container */}
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className={`relative p-3 rounded-xl transition-all duration-300 overflow-hidden
                            ${isActive ? 'shadow-lg' : ''}
                          `}
                        >
                          {/* Active/hover gradient background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 
                            group-hover:opacity-20 ${isActive ? 'opacity-30' : ''} transition-opacity duration-300 rounded-xl`}
                          />
                          
                          {/* Border effect */}
                          <div className={`absolute inset-0 rounded-xl ${isActive ? 'border-2 border-white/20' : 'border border-white/5'}`}/>
                          
                          <item.icon 
                            className={`relative z-10 w-6 h-6 ${
                              isActive ? 'text-white' : 'text-white/70 group-hover:text-white/90'
                            }`} 
                          />
                          
                          {/* Badge */}
                          {item.badge > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-gray-900/80"
                            >
                              {item.badge > 9 ? '9+' : item.badge}
                            </motion.div>
                          )}
                        </motion.div>
                        
                        {/* Label */}
                        <motion.span 
                          className={`text-xs mt-1 font-medium ${
                            isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                          }`}
                          animate={{ 
                            scale: isActive ? 1.05 : 1
                          }}
                        >
                          {item.label}
                        </motion.span>
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
            
            {/* Animated light reflections */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <motion.div
                className="absolute -top-2 left-1/4 w-32 h-2 bg-white/20 blur-md rounded-full"
                animate={{
                  left: ["0%", "75%", "0%"]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div
                className="absolute -bottom-2 right-1/4 w-24 h-2 bg-white/10 blur-md rounded-full"
                animate={{
                  right: ["0%", "70%", "0%"]
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 2
                }}
              />
              
              {/* Subtle particle effects */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 3) * 20}%`
                  }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    y: [-5, 5],
                    x: [-2, 2]
                  }}
                  transition={{
                    duration: 2 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                    repeatType: "reverse"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default MobileNavigation;
