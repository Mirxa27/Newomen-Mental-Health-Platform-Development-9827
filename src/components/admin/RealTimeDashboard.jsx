import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiActivity, 
  FiUsers, 
  FiMessageCircle, 
  FiTrendingUp,
  FiServer,
  FiWifi,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const RealTimeDashboard = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    totalSessions: 0,
    averageSessionDuration: 0,
    messagesPerSecond: 0,
    systemHealth: 'excellent',
    responseTime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    storageUsage: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/admin/metrics/realtime', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch realtime metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'excellent': return FiCheckCircle;
      case 'good': return FiCheckCircle;
      case 'warning': return FiAlertTriangle;
      case 'critical': return FiAlertTriangle;
      default: return FiActivity;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatPercent = (value) => `${Math.round(value)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Dashboard</h2>
          <p className="text-gray-600">Live system metrics and user activity</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchMetrics}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getHealthColor(metrics.systemHealth)}`}>
            {React.createElement(getHealthIcon(metrics.systemHealth), { className: 'w-4 h-4' })}
            <span className="text-sm font-medium capitalize">{metrics.systemHealth}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <span className="text-sm font-medium">{formatPercent(metrics.cpuUsage)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.cpuUsage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="text-sm font-medium">{formatPercent(metrics.memoryUsage)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.memoryUsage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Storage Usage</span>
              <span className="text-sm font-medium">{formatPercent(metrics.storageUsage)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.storageUsage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <FiWifi className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">Online now</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalSessions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiActivity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <FiTrendingUp className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm text-blue-600">Today</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Session</p>
              <p className="text-3xl font-bold text-gray-900">{formatDuration(metrics.averageSessionDuration)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiMessageCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <FiActivity className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-sm text-purple-600">Duration</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Response Time</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.responseTime}ms</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiServer className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <FiCheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">Optimal</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Messages Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Activity</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Messages per second: </span>
            <span className="font-bold text-gray-900">{metrics.messagesPerSecond.toFixed(1)}</span>
          </div>
          <div className="text-sm text-gray-500">
            Real-time throughput
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealTimeDashboard;
