import React from 'react';
import { motion } from 'framer-motion';

const EmotionIndicator = ({ emotion }) => {
  const emotionColors = {
    neutral: 'bg-gray-400',
    happy: 'bg-yellow-400',
    sad: 'bg-blue-400',
    angry: 'bg-red-400',
    anxious: 'bg-purple-400',
    excited: 'bg-green-400',
    peaceful: 'bg-teal-400',
  };

  const emotionEmojis = {
    neutral: '😐',
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    excited: '🤩',
    peaceful: '😌',
  };

  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className="flex items-center space-x-2"
    >
      <div className={`w-3 h-3 rounded-full ${emotionColors[emotion]} animate-pulse`} />
      <span className="text-sm text-gray-600">
        {emotionEmojis[emotion]} {emotion}
      </span>
    </motion.div>
  );
};

export default EmotionIndicator;