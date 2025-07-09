import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BalanceWheel from '../components/onboarding/BalanceWheel';
import toast from 'react-hot-toast';

const BalanceWheelOnboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    toast.success(`Selected focus area: ${topic}`);
    
    // Navigate to the diagnostic test for the selected topic
    setTimeout(() => {
      navigate(`/diagnostic-test/${topic.toLowerCase()}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Growth Area
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Select the life area you'd like to focus on for your personal development journey.
          </p>
        </div>
        
        <BalanceWheel onSelectTopic={handleTopicSelect} />
        
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8 p-6 bg-white/80 rounded-xl shadow-lg"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Great choice! You selected: {selectedTopic}
            </h3>
            <p className="text-gray-600">
              Let's dive deeper with a personalized assessment for this area.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default BalanceWheelOnboarding;
