import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';

const { FiMail, FiArrowLeft } = FiIcons;

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset instructions');
      }

      const data = await response.json();

      setIsSubmitted(true);
      toast.success(data.message);
      if (data.previewURL) {
        console.log(`Password reset preview URL: ${data.previewURL}`);
        toast.success(<span>Password reset preview URL: <a href={data.previewURL} target="_blank" rel="noopener noreferrer">{data.previewURL}</a></span>, {duration: 10000});
      }

    } catch (error) {
      toast.error(error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Newomen</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isSubmitted ? 'Check Your Email' : 'Forgot Password'}
          </h2>
          
          <p className="text-gray-600">
            {isSubmitted 
              ? 'We have sent password reset instructions to your email'
              : 'Enter your email and we\'ll send you instructions to reset your password'}
          </p>
        </div>

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiMail} className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-gray-600 mb-6">
                Please check your email inbox and follow the instructions to reset your password.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                to="/auth/login"
                className="block w-full py-3 px-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors text-center"
              >
                Back to Login
              </Link>
              
              <button
                onClick={() => setIsSubmitted(false)}
                className="block w-full py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Resend Instructions
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl space-y-6"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <SafeIcon
                  icon={FiMail}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
            </button>

            <div className="text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-500 font-medium transition-colors"
              >
                <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
