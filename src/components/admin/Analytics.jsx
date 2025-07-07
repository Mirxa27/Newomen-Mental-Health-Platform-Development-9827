import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiTrendingUp, 
  FiUsers, 
  FiMessageCircle, 
  FiDollarSign,
  FiBarChart3,
  FiPieChart,
  FiActivity
} = FiIcons;

const Analytics = () => {
  const metrics = [
    {
      name: 'Total Revenue',
      value: '$54,320',
      change: '+12.5%',
      changeType: 'positive',
      icon: FiDollarSign,
    },
    {
      name: 'Active Users',
      value: '2,847',
      change: '+8.3%',
      changeType: 'positive',
      icon: FiUsers,
    },
    {
      name: 'Conversations',
      value: '18,234',
      change: '+15.2%',
      changeType: 'positive',
      icon: FiMessageCircle,
    },
    {
      name: 'Conversion Rate',
      value: '3.2%',
      change: '+0.4%',
      changeType: 'positive',
      icon: FiTrendingUp,
    },
  ];

  const chartData = [
    { name: 'Jan', users: 400, revenue: 2400, conversations: 1200 },
    { name: 'Feb', users: 300, revenue: 1398, conversations: 980 },
    { name: 'Mar', users: 200, revenue: 9800, conversations: 1500 },
    { name: 'Apr', users: 278, revenue: 3908, conversations: 1800 },
    { name: 'May', users: 189, revenue: 4800, conversations: 2200 },
    { name: 'Jun', users: 239, revenue: 3800, conversations: 2600 },
  ];

  const subscriptionData = [
    { name: 'Discovery', value: 45, color: '#8B5CF6' },
    { name: 'Growth', value: 35, color: '#06B6D4' },
    { name: 'Transformation', value: 20, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your platform's performance and user engagement</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={metric.icon} className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
          </div>
          
          <div className="h-64 flex items-center justify-center text-gray-500">
            {/* Placeholder for chart - would integrate with recharts */}
            <div className="text-center">
              <SafeIcon icon={FiBarChart3} className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Chart visualization would be implemented here</p>
              <p className="text-sm mt-2">Using Recharts or similar library</p>
            </div>
          </div>
        </motion.div>

        {/* Subscription Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-6">
            <SafeIcon icon={FiPieChart} className="w-6 h-6 text-secondary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Subscription Tiers</h3>
          </div>
          
          <div className="space-y-4">
            {subscriptionData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center space-x-3 mb-6">
          <SafeIcon icon={FiActivity} className="w-6 h-6 text-accent-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">New user registration spike detected</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Shadow work completion rate increased by 15%</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Monthly revenue target achieved</p>
              <p className="text-xs text-gray-500">3 hours ago</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
        
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            Export to CSV
          </button>
          <button className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors">
            Generate PDF Report
          </button>
          <button className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors">
            Email Summary
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;