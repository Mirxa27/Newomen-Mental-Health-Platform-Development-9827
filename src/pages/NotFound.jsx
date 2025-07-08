import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';

const { FiHome, FiArrowLeft, FiSearch } = FiIcons;

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden p-4">
      {/* Background floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-200/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary-200/10 rounded-full float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent-200/10 rounded-full float-slow"></div>
        <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-primary-200/5 rounded-full animate-float"></div>
      </div>
      
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="liquid-glass rounded-3xl p-8 md:p-12 relative"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiSearch} className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-4">
              404
            </h1>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4"
          >
            Page Not Found
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-gray-600 mb-8 text-lg leading-relaxed"
          >
            The page you're looking for seems to have wandered off on its own journey. 
            Let's get you back to discovering your authentic self.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/"
              className="liquid-glass px-6 py-3 bg-gradient-to-r from-primary-500/80 to-secondary-500/80 text-white rounded-lg hover:shadow-glow transition-all duration-300 inline-flex items-center space-x-2 border border-primary-200/50"
            >
              <SafeIcon icon={FiHome} className="w-5 h-5" />
              <span>Return Home</span>
            </Link>
            
            <motion.button
              onClick={() => window.history.back()}
              className="liquid-glass px-6 py-3 text-gray-700 rounded-lg hover:bg-white/30 transition-all duration-300 inline-flex items-center space-x-2 border border-white/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
              <span>Go Back</span>
            </motion.button>
          </motion.div>
          
          {/* Floating elements inside card */}
          <div className="absolute top-4 right-4 w-6 h-6 bg-primary-200/20 rounded-full animate-float"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 bg-secondary-200/20 rounded-full float-delayed"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;