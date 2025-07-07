import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import ConversationMonitor from '../components/admin/ConversationMonitor';
import PromptManagement from '../components/admin/PromptManagement';
import Analytics from '../components/admin/Analytics';
import AIProviderSettings from '../components/admin/AIProviderSettings';
import SystemSettings from '../components/admin/SystemSettings';

const { 
  FiHome, 
  FiUsers, 
  FiMessageSquare, 
  FiEdit, 
  FiBarChart3, 
  FiCpu, 
  FiSettings 
} = FiIcons;

const Admin = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNav = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Users', href: '/admin/users', icon: FiUsers },
    { name: 'Conversations', href: '/admin/conversations', icon: FiMessageSquare },
    { name: 'Prompts', href: '/admin/prompts', icon: FiEdit },
    { name: 'Analytics', href: '/admin/analytics', icon: FiBarChart3 },
    { name: 'AI Providers', href: '/admin/ai-providers', icon: FiCpu },
    { name: 'System Settings', href: '/admin/settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Open sidebar"
        >
          <SafeIcon icon={FiIcons.FiMenu} className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
        <div className="w-10" />
      </div>

      <div className="flex">
        {/* Sidebar for desktop */}
        <div className="hidden md:block w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>

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
        </div>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed inset-0 z-40 flex md:hidden"
          >
            <div className="w-64 bg-white shadow-xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close sidebar">
                  <SafeIcon icon={FiIcons.FiX} className="w-5 h-5 text-gray-700" />
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
                      onClick={() => setSidebarOpen(false)}
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
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </motion.div>
        )}

        {/* Admin Content */}
        <div className="flex-1 p-4 md:p-8">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="conversations" element={<ConversationMonitor />} />
            <Route path="prompts" element={<PromptManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="ai-providers" element={<AIProviderSettings />} />
            <Route path="settings" element={<SystemSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;
