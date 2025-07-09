import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHeart, FiActivity, FiUser, FiUsers, FiTrendingUp } = FiIcons;

const BalanceWheel = ({ onSelectTopic }) => {
  const [hoveredTopic, setHoveredTopic] = useState(null);

  const topics = [
    { 
      name: "relationships", 
      displayName: "Relationships",
      color: "#FF6B6B", 
      icon: FiHeart,
      description: "Strengthen bonds and improve communication"
    },
    { 
      name: "health", 
      displayName: "Health",
      color: "#4ECDC4", 
      icon: FiActivity,
      description: "Physical wellness and mental health"
    },
    { 
      name: "self-esteem", 
      displayName: "Self-Esteem",
      color: "#45B7D1", 
      icon: FiUser,
      description: "Build confidence and self-worth"
    },
    { 
      name: "family", 
      displayName: "Family",
      color: "#F9D423", 
      icon: FiUsers,
      description: "Navigate family dynamics and responsibilities"
    },
    { 
      name: "self-dev", 
      displayName: "Self-Development",
      color: "#CDB4DB", 
      icon: FiTrendingUp,
      description: "Personal growth and skill building"
    },
  ];

  const wheelVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const sliceVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <motion.div
        className="relative w-80 h-80 md:w-96 md:h-96"
        variants={wheelVariants}
        initial="initial"
        animate="animate"
      >
        {topics.map((topic, i) => {
          const angle = (i / topics.length) * 360;
          const isHovered = hoveredTopic === topic.name;
          
          return (
            <motion.div
              key={topic.name}
              className="absolute inset-0 cursor-pointer"
              style={{ transform: `rotate(${angle}deg)` }}
              variants={sliceVariants}
              onHoverStart={() => setHoveredTopic(topic.name)}
              onHoverEnd={() => setHoveredTopic(null)}
              whileHover={{ scale: 1.05 }}
              onClick={() => onSelectTopic(topic.name)}
            >
              {/* Slice background */}
              <div
                className="absolute w-full h-full opacity-80"
                style={{
                  background: `conic-gradient(from ${angle}deg, ${topic.color} 0deg, ${topic.color} 72deg, transparent 72deg)`,
                  clipPath: 'polygon(50% 50%, 50% 0%, 85.4% 14.6%, 50% 50%)',
                }}
              />
              
              {/* Icon and label container */}
              <div
                className="absolute flex flex-col items-center justify-center"
                style={{
                  top: '25%',
                  left: '50%',
                  transform: `translateX(-50%) translateY(-50%) rotate(${-angle}deg)`,
                  width: '80px',
                  height: '80px',
                }}
              >
                <motion.div
                  className="bg-white rounded-full p-3 shadow-lg mb-2"
                  whileHover={{ scale: 1.1 }}
                  style={{ backgroundColor: isHovered ? topic.color : 'white' }}
                >
                  <SafeIcon 
                    icon={topic.icon} 
                    className={`w-6 h-6 ${isHovered ? 'text-white' : ''}`}
                    style={{ color: isHovered ? 'white' : topic.color }}
                  />
                </motion.div>
                <motion.span 
                  className="text-xs font-semibold text-center leading-tight"
                  style={{ 
                    color: isHovered ? topic.color : '#374151',
                    fontWeight: isHovered ? '700' : '600'
                  }}
                >
                  {topic.displayName}
                </motion.span>
              </div>
            </motion.div>
          );
        })}
        
        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-white rounded-full shadow-lg border-4 border-gray-100 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">Choose</span>
          </div>
        </div>
      </motion.div>
      
      {/* Topic description */}
      {hoveredTopic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-6 p-4 bg-white/90 rounded-xl shadow-lg max-w-xs text-center"
        >
          <h3 className="font-semibold text-gray-900 mb-2">
            {topics.find(t => t.name === hoveredTopic)?.displayName}
          </h3>
          <p className="text-sm text-gray-600">
            {topics.find(t => t.name === hoveredTopic)?.description}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BalanceWheel;
