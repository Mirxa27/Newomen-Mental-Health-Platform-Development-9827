import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUsers, FiMessageCircle, FiDollarSign, FiTrendingUp, FiActivity } = FiIcons;

const AdminDashboard = () => {
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
      name: 'Engagement Rate',
      value: '89%',
      change: '+5%',
      changeType: 'positive',
      icon: FiTrendingUp,
    },
  ];

  const recentActivity = [
    { type: 'user_joined', message: 'Sarah Ahmed joined the platform', time: '2 minutes ago' },
    { type: 'subscription', message: 'New Growth tier subscription', time: '5 minutes ago' },
    { type: 'conversation', message: 'Shadow work session completed', time: '8 minutes ago' },
    { type: 'feedback', message: 'Positive feedback received', time: '12 minutes ago' },
    { type: 'user_joined', message: 'Fatima Al-Zahra joined the platform', time: '15 minutes ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your Newomen platform</p>
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
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          
          <div className="space-y-4">
            <button className="w-full text-left p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg hover:from-primary-100 hover:to-secondary-100 transition-colors">
              <h4 className="font-medium text-gray-900">Create New Prompt</h4>
              <p className="text-sm text-gray-600">Add new AI conversation prompts</p>
            </button>
            
            <button className="w-full text-left p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg hover:from-primary-100 hover:to-secondary-100 transition-colors">
              <h4 className="font-medium text-gray-900">Monitor Conversations</h4>
              <p className="text-sm text-gray-600">View real-time chat activity</p>
            </button>
            
            <button className="w-full text-left p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg hover:from-primary-100 hover:to-secondary-100 transition-colors">
              <h4 className="font-medium text-gray-900">Generate Report</h4>
              <p className="text-sm text-gray-600">Export analytics and insights</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;