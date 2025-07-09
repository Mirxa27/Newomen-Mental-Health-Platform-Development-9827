import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useGamificationStore } from '../../store/gamificationStore';

const { FiStar, FiTrendingUp, FiAward } = FiIcons;

const GamificationProgress = ({ showDetailed = false }) => {
  const { 
    crystals, 
    level, 
    experience, 
    achievements, 
    getProgressToNextLevel 
  } = useGamificationStore();
  
  const progress = getProgressToNextLevel();

  if (!showDetailed) {
    // Compact version for header/navbar
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <SafeIcon icon={FiStar} className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">{crystals}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">Level</span>
          <span className="text-sm font-bold text-primary-600">{level}</span>
        </div>
      </div>
    );
  }

  // Detailed version for profile/dashboard
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
      </div>
      
      {/* Crystals and Level */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiStar} className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600">{crystals}</div>
          <div className="text-sm text-gray-600">Crystals</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiAward} className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary-600">{level}</div>
          <div className="text-sm text-gray-600">Level</div>
        </div>
      </div>
      
      {/* Progress to Next Level */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress to Level {level + 1}</span>
          <span className="text-sm font-medium text-gray-700">
            {progress.current}/{progress.required} XP
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full"
          />
        </div>
      </div>
      
      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Achievements</h4>
          <div className="space-y-2">
            {achievements.slice(-3).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg"
              >
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiAward} className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {achievement.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GamificationProgress;
