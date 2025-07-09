import React from 'react';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiUsers,
  FiMessageCircle,
  FiDollarSign,
  FiBarChart,
  FiPieChart,
  FiActivity,
  FiDownload,
  FiMail,
  FiFileText
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import GlassCard from '../common/GlassCard';
import GlassButton from '../common/GlassButton';

const Analytics = () => {
  const metrics = [
    {
      name: 'Total Revenue',
      value: '$54,320',
      change: '+12.5%',
      changeType: 'positive',
      icon: FiDollarSign,
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Active Users',
      value: '2,847',
      change: '+8.3%',
      changeType: 'positive',
      icon: FiUsers,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'Conversations',
      value: '18,234',
      change: '+15.2%',
      changeType: 'positive',
      icon: FiMessageCircle,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Conversion Rate',
      value: '3.2%',
      change: '+0.4%',
      changeType: 'positive',
      icon: FiTrendingUp,
      gradient: 'from-amber-500 to-orange-500'
    },
  ];

  const chartData = [
    { name: 'Jan', users: 400, revenue: 2400, conversations: 1200 },
    { name: 'Feb', users: 520, revenue: 2800, conversations: 1400 },
    { name: 'Mar', users: 680, revenue: 3200, conversations: 1800 },
    { name: 'Apr', users: 820, revenue: 3908, conversations: 2200 },
    { name: 'May', users: 1050, revenue: 4800, conversations: 2800 },
    { name: 'Jun', users: 1280, revenue: 5400, conversations: 3200 },
  ];

  const subscriptionData = [
    { name: 'Discovery', value: 45, color: '#8B5CF6' },
    { name: 'Growth', value: 35, color: '#06B6D4' },
    { name: 'Transformation', value: 20, color: '#F59E0B' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <GlassCard padding="12px" cornerRadius={8}>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </GlassCard>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-mobile-title font-bold">
          <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </span>
        </h1>
        <p className="text-gray-600 mt-2">Track your platform's performance and user engagement</p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard
              className="group hover:scale-105 transition-all duration-300"
              elasticity={0.3}
              padding="20px"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </GlassCard>
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
        >
          <GlassCard cornerRadius={20} padding="24px">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                  <FiTrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Subscription Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard cornerRadius={20} padding="24px">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <FiPieChart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Subscription Tiers</h3>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {subscriptionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Conversations Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard cornerRadius={20} padding="24px">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                <FiMessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Conversation Trends</h3>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="conversations" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard cornerRadius={20} padding="24px">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10">
              <FiActivity className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>

          <div className="space-y-4">
            {[
              { color: 'green', text: 'New user registration spike detected', time: '2 minutes ago' },
              { color: 'blue', text: 'Shadow work completion rate increased by 15%', time: '1 hour ago' },
              { color: 'purple', text: 'Monthly revenue target achieved', time: '3 hours ago' },
              { color: 'amber', text: 'System performance optimized', time: '5 hours ago' }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full mt-2 flex-shrink-0`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <GlassCard cornerRadius={20} padding="24px">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Export Data</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassButton variant="primary" size="md" className="flex items-center justify-center space-x-2">
              <FiDownload className="w-4 h-4" />
              <span>Export CSV</span>
            </GlassButton>
            <GlassButton variant="secondary" size="md" className="flex items-center justify-center space-x-2">
              <FiFileText className="w-4 h-4" />
              <span>PDF Report</span>
            </GlassButton>
            <GlassButton variant="outline" size="md" className="flex items-center justify-center space-x-2">
              <FiMail className="w-4 h-4" />
              <span>Email Summary</span>
            </GlassButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Analytics;