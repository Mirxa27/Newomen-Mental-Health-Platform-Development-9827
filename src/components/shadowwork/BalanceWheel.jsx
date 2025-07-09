import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const topics = [
  { name: 'Relationships', color: 'from-red-400 to-red-600', slug: 'relationships' },
  { name: 'Health', color: 'from-green-400 to-green-600', slug: 'health' },
  { name: 'Self-Esteem', color: 'from-blue-400 to-blue-600', slug: 'self-esteem' },
  { name: 'Family', color: 'from-yellow-400 to-yellow-600', slug: 'family' },
  { name: 'Self-Development', color: 'from-purple-400 to-purple-600', slug: 'self-development' },
];

const BalanceWheel = ({ onSelectTopic }) => {
  const wheelVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 md:mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Choose Your Focus Area</h2>
        <p className="text-lg text-gray-600">Select a life area to begin your journey of introspection.</p>
      </motion.div>
      
      <motion.div
        className="relative w-72 h-72 md:w-96 md:h-96"
        variants={wheelVariants}
        initial="initial"
        animate="animate"
      >
        {topics.map((topic, index) => {
          const angle = (index / topics.length) * 360 - 90; // Start from top
          const radian = (angle * Math.PI) / 180;
          const radius = 120; // md: 150
          const x = Math.cos(radian) * radius;
          const y = Math.sin(radian) * radius;

          return (
            <motion.div
              key={topic.name}
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
              }}
              variants={itemVariants}
            >
              <button
                onClick={() => onSelectTopic(topic.slug)}
                className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center text-center text-white font-semibold cursor-pointer bg-gradient-to-br ${topic.color} shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-white`}
              >
                {topic.name}
              </button>
            </motion.div>
          );
        })}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 md:w-48 md:h-48 bg-white rounded-full shadow-inner flex items-center justify-center text-gray-700 font-bold text-xl md:text-2xl text-center p-4">
          Balance Wheel
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-12 text-center"
      >
        <button 
          onClick={() => onSelectTopic('general')}
          className="group flex items-center justify-center space-x-2 px-6 py-3 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <span>I'm not sure, start a general session</span>
          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};

export default BalanceWheel;
