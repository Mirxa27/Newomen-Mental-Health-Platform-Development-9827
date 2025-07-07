import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiStar, FiTarget, FiHeart, FiMessageCircle } = FiIcons;

const InsightsPanel = ({ insights }) => {
  const { shadowPatterns, hiddenStrengths, transformationAreas } = insights;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiStar} className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Shadow Work Insights
          </h1>
          <p className="text-xl text-gray-600">
            ما شاء الله! You've completed a profound journey of self-discovery
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Shadow Patterns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiTarget} className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Shadow Patterns</h3>
            </div>
            
            <ul className="space-y-3">
              {shadowPatterns.map((pattern, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Hidden Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiHeart} className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hidden Strengths</h3>
            </div>
            
            <ul className="space-y-3">
              {hiddenStrengths.map((strength, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Transformation Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiStar} className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Growth Areas</h3>
            </div>
            
            <ul className="space-y-3">
              {transformationAreas.map((area, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl p-8 text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-4">
            الحمد لله! Your Journey Continues
          </h2>
          <p className="text-lg mb-6 opacity-90">
            You've taken the first step toward authentic self-discovery. Now let's integrate these insights into your daily life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chat"
              className="bg-white text-primary-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiMessageCircle} className="w-5 h-5" />
              <span>Continue with AI Companion</span>
            </Link>
            
            <Link
              to="/profile"
              className="border border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              View Your Action Plan
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InsightsPanel;