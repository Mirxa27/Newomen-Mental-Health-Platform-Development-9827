import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiClock,
  FiStar,
  FiHeart,
  FiMessageCircle,
  FiMic,
  FiUsers,
  FiActivity,
  FiShield,
  FiGlobe,
  FiSmartphone
} from 'react-icons/fi';

const FeatureCompletionDashboard = () => {
  const [completedFeatures, setCompletedFeatures] = useState([]);

  const allFeatures = [
    {
      id: 'auth',
      name: 'Authentication System',
      description: 'Complete JWT-based authentication with protected routes',
      icon: FiShield,
      status: 'completed',
      color: 'from-green-400 to-green-600',
      route: '/auth/login'
    },
    {
      id: 'chat',
      name: 'AI Chat System',
      description: 'Intelligent conversations with OpenAI integration',
      icon: FiMessageCircle,
      status: 'completed',
      color: 'from-blue-400 to-blue-600',
      route: '/chat'
    },
    {
      id: 'shadow-work',
      name: 'Shadow Work Journey',
      description: 'Deep self-discovery through guided introspection',
      icon: FiHeart,
      status: 'completed',
      color: 'from-purple-400 to-purple-600',
      route: '/shadow-work/1'
    },
    {
      id: 'personality',
      name: 'Personality Assessment',
      description: 'Comprehensive personality test with insights',
      icon: FiStar,
      status: 'completed',
      color: 'from-yellow-400 to-orange-600',
      route: '/personality-test'
    },
    {
      id: 'breathing',
      name: 'Breathing Practices',
      description: 'Interactive mindfulness and breathing exercises',
      icon: FiActivity,
      status: 'completed',
      color: 'from-cyan-400 to-cyan-600',
      route: '/breathing'
    },
    {
      id: 'voice',
      name: 'Voice Chat',
      description: 'Real-time voice interactions with AI companion',
      icon: FiMic,
      status: 'enhanced',
      color: 'from-indigo-400 to-indigo-600',
      route: '/chat'
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      description: 'Comprehensive management and analytics platform',
      icon: FiUsers,
      status: 'completed',
      color: 'from-red-400 to-red-600',
      route: '/admin'
    },
    {
      id: 'realtime',
      name: 'Real-Time Metrics',
      description: 'Live system monitoring and user activity',
      icon: FiActivity,
      status: 'completed',
      color: 'from-pink-400 to-pink-600',
      route: '/admin/realtime'
    },
    {
      id: 'mobile',
      name: 'Mobile PWA',
      description: 'Progressive Web App with offline capabilities',
      icon: FiSmartphone,
      status: 'completed',
      color: 'from-teal-400 to-teal-600',
      route: '/'
    },
    {
      id: 'i18n',
      name: 'Internationalization',
      description: 'Multi-language support with cultural context',
      icon: FiGlobe,
      status: 'completed',
      color: 'from-violet-400 to-violet-600',
      route: '/settings'
    }
  ];

  useEffect(() => {
    // Simulate loading completion status
    setCompletedFeatures(allFeatures);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'enhanced':
        return <FiStar className="w-5 h-5 text-yellow-500" />;
      default:
        return <FiClock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'enhanced':
        return 'Enhanced';
      default:
        return 'In Progress';
    }
  };

  const completedCount = completedFeatures.filter(f => f.status === 'completed').length;
  const enhancedCount = completedFeatures.filter(f => f.status === 'enhanced').length;
  const totalFeatures = allFeatures.length;
  const completionPercentage = Math.round(((completedCount + enhancedCount) / totalFeatures) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-2xl">
            <FiCheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Platform Completion Status
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Newomen Mental Health Platform - Development Complete
          </p>
          
          {/* Progress Summary */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">{completionPercentage}%</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">Complete</p>
                <p className="text-sm text-gray-600">Overall Progress</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{completedCount}</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">Features</p>
                <p className="text-sm text-gray-600">Fully Implemented</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-yellow-600">{enhancedCount}</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">Enhanced</p>
                <p className="text-sm text-gray-600">Advanced Features</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              className="h-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
                  {React.createElement(feature.icon, { className: 'w-6 h-6 text-white' })}
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(feature.status)}
                  <span className="text-sm font-medium text-gray-600">
                    {getStatusText(feature.status)}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {feature.description}
              </p>
              
              <Link
                to={feature.route}
                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
              >
                <span>Explore Feature</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl p-8 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            🎉 Platform Development Complete!
          </h2>
          <p className="text-lg mb-6 opacity-90">
            The Newomen Mental Health Platform is now fully functional with all core features implemented,
            enhanced user experience, and production-ready infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chat"
              className="bg-white/20 backdrop-blur-sm px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors"
            >
              Start Using Platform
            </Link>
            <Link
              to="/admin"
              className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeatureCompletionDashboard;
