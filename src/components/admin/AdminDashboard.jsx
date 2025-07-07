import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuthStore } from '../../store/authStore';

const { 
  FiUsers, 
  FiMessageCircle, 
  FiDollarSign, 
  FiTrendingUp, 
  FiActivity,
  FiCpu,
  FiSettings,
  FiShield,
  FiDatabase
} = FiIcons;

const AdminDashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    {
      name: 'Total Users',
      value: '2,847',
      change: '+12%',
      changeType: 'positive',
      icon: FiUsers,
    },
    {
      name: 'Active Conversations',
      value: '1,234',
      change: '+8%',
      changeType: 'positive',
      icon: FiMessageCircle,
    },
    {
      name: 'Monthly Revenue',
      value: '$45,678',
      change: '+23%',
      changeType: 'positive',
      icon: FiDollarSign,
    },
    {
      name: 'AI API Usage',
      value: '89%',
      change: '+5%',
      changeType: 'positive',
      icon: FiCpu,
    },
  ];

  const quickActions = [
    {
      title: 'AI Provider Settings',
      description: 'Configure OpenAI, Anthropic, and other AI providers',
      icon: FiCpu,
      link: '/admin/ai-providers',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'System Settings',
      description: 'Manage platform settings and configurations',
      icon: FiSettings,
      link: '/admin/settings',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'User Management',
      description: 'View and manage platform users',
      icon: FiUsers,
      link: '/admin/users',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Security Monitor',
      description: 'Monitor security events and access logs',
      icon: FiShield,
      link: '/admin/security',
      color: 'from-red-500 to-red-600'
    }
  ];

  const recentActivity = [
    {
      type: 'user_joined',
      message: 'Sarah Ahmed joined the platform',
      time: '2 minutes ago'
    },
    {
      type: 'ai_provider',
      message: 'OpenAI API key updated successfully',
      time: '5 minutes ago'
    },
    {
      type: 'subscription',
      message: 'New Growth tier subscription',
      time: '8 minutes ago'
    },
    {
      type: 'system',
      message: 'System settings backup completed',
      time: '12 minutes ago'
    },
    {
      type: 'user_joined',
      message: 'Fatima Al-Zahra joined the platform',
      time: '15 minutes ago'
    },
  ];

  const systemHealth = [
    { name: 'API Response Time', value: '245ms', status: 'healthy' },
    { name: 'Database Performance', value: '99.9%', status: 'healthy' },
    { name: 'AI Provider Status', value: 'All Active', status: 'healthy' },
    { name: 'Storage Usage', value: '67%', status: 'warning' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your Newomen platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={stat.icon} className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link
                to={action.link}
                className="block bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                  <SafeIcon icon={action.icon} className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <SafeIcon icon={FiDatabase} className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          </div>
          
          <div className="space-y-4">
            {systemHealth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-lg font-bold text-gray-700">{item.value}</p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    item.status === 'healthy' 
                      ? 'bg-green-500'
                      : item.status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <SafeIcon icon={FiActivity} className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;