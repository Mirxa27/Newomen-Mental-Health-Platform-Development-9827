import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const { 
  FiHome, 
  FiUsers, 
  FiMessageSquare, 
  FiEdit, 
  FiBarChart3, 
  FiCpu, 
  FiSettings,
  FiX
} = FiIcons;

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const adminNav = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Users', href: '/admin/users', icon: FiUsers },
    { name: 'Conversations', href: '/admin/conversations', icon: FiMessageSquare },
    { name: 'Prompts', href: '/admin/prompts', icon: FiEdit },
    { name: 'Analytics', href: '/admin/analytics', icon: FiBarChart3 },
    { name: 'AI Providers', href: '/admin/ai-providers', icon: FiCpu },
    { name: 'System Settings', href: '/admin/settings', icon: FiSettings },
  ];

  if (!isOpen && !isMobile) {
    return (
      <div className="hidden md:block w-16 bg-white/80 backdrop-blur-sm border-r border-gray-200 min-h-[calc(100vh-64px)] transition-all duration-300">
        <div className="py-6">
          <button
            onClick={toggleSidebar}
            className="w-full flex justify-center p-2 mb-6 text-gray-500 hover:text-gray-700"
          >
            <SafeIcon icon={FiSettings} className="w-5 h-5" />
          </button>
          
          <nav className="space-y-4">
            {adminNav.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex justify-center p-2
                    ${isActive 
                      ? 'text-primary-600' 
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                  title={item.name}
                >
                  <SafeIcon icon={item.icon} className="w-5 h-5" />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={toggleSidebar}
            />
          )}

          <motion.div
            initial={isMobile ? { x: -280 } : { opacity: 0 }}
            animate={isMobile ? { x: 0 } : { opacity: 1 }}
            exit={isMobile ? { x: -280 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed md:sticky top-16 left-0 bottom-0 w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 min-h-[calc(100vh-64px)] z-50 transition-all duration-300 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
                <button
                  onClick={toggleSidebar}
                  className="text-gray-500 hover:text-gray-700 md:hidden"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="space-y-2">
                {adminNav.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-500' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                        }
                      `}
                    >
                      <SafeIcon 
                        icon={item.icon} 
                        className={`
                          w-5 h-5 mr-3 transition-colors
                          ${isActive 
                            ? 'text-primary-600' 
                            : 'text-gray-400 group-hover:text-primary-600'
                          }
                        `} 
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Admin Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Admin Version 1.0.0</span>
                  <Link to="/" className="text-primary-600 hover:text-primary-700">
                    Exit Admin
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminSidebar;