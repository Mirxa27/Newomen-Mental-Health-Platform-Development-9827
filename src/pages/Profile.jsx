import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useAuthStore } from '../store/authStore';
import { useShadowWorkStore } from '../store/shadowWorkStore';

const { FiUser, FiHeart, FiTarget, FiStar, FiEdit } = FiIcons;

const Profile = () => {
  const { t } = useTranslation();
  const { user, subscription } = useAuthStore();
  const { affirmations, actionPlan, insights } = useShadowWorkStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiUser} className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('welcome')}, {user?.name}!
          </h1>
          <p className="text-xl text-gray-600">
            Your personal growth dashboard
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <SafeIcon icon={FiEdit} className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <p className="font-medium text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Subscription</label>
                  <p className="font-medium text-gray-900 capitalize">{subscription.tier} Tier</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Minutes Remaining</label>
                  <p className="font-medium text-gray-900">{subscription.minutesRemaining}</p>
                </div>
              </div>
            </motion.div>

            {/* Daily Affirmations */}
            {affirmations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiHeart} className="w-5 h-5 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Daily Affirmations</h3>
                </div>
                
                <div className="space-y-3">
                  {affirmations.slice(0, 3).map((affirmation, index) => (
                    <div key={index} className="p-3 bg-pink-50 rounded-lg">
                      <p className="text-sm text-gray-700 italic">"{affirmation}"</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Action Plan & Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Plan */}
            {actionPlan && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <SafeIcon icon={FiTarget} className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Your Action Plan</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {actionPlan.map((category, index) => (
                    <div key={index} className="space-y-3">
                      <h4 className="font-medium text-gray-900">{category.category}</h4>
                      <ul className="space-y-2">
                        {category.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Progress Tracking */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiStar} className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">7</div>
                  <div className="text-sm text-gray-600">Days Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-600">42</div>
                  <div className="text-sm text-gray-600">Messages Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-600">3</div>
                  <div className="text-sm text-gray-600">Insights Gained</div>
                </div>
              </div>
            </motion.div>

            {/* Recent Insights */}
            {insights && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
                
                <div className="space-y-4">
                  {insights.hiddenStrengths.slice(0, 2).map((strength, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
                      <p className="text-sm text-gray-700">{strength}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;