import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiStar, 
  FiTarget, 
  FiHeart, 
  FiSun, 
  FiMoon, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiPlay,
  FiPause,
  FiCheck,
  FiTrendingUp,
  FiCalendar,
  FiAward,
  FiBookOpen,
  FiSmile
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const NewMe = () => {
  const { t } = useTranslation();
  const { user, addCrystals } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState('challenges');
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [streakData, setStreakData] = useState({
    currentStreak: 3,
    longestStreak: 7,
    totalCompleted: 15
  });

  // Daily challenges data
  const dailyChallenges = [
    {
      id: 1,
      title: "Morning Gratitude",
      description: "Write down 3 things you're grateful for today",
      category: "mindfulness",
      difficulty: "easy",
      crystals: 5,
      estimatedTime: "5 minutes",
      icon: FiSun,
      color: "from-yellow-400 to-orange-500"
    },
    {
      id: 2,
      title: "Acts of Kindness",
      description: "Perform a random act of kindness for someone",
      category: "connection",
      difficulty: "medium",
      crystals: 10,
      estimatedTime: "15 minutes",
      icon: FiHeart,
      color: "from-pink-400 to-rose-500"
    },
    {
      id: 3,
      title: "Mindful Breathing",
      description: "Practice 5 minutes of deep breathing meditation",
      category: "wellness",
      difficulty: "easy",
      crystals: 8,
      estimatedTime: "5 minutes",
      icon: FiTarget,
      color: "from-blue-400 to-cyan-500"
    },
    {
      id: 4,
      title: "Learn Something New",
      description: "Spend 15 minutes learning about a topic that interests you",
      category: "growth",
      difficulty: "medium",
      crystals: 12,
      estimatedTime: "15 minutes",
      icon: FiBookOpen,
      color: "from-purple-400 to-indigo-500"
    },
    {
      id: 5,
      title: "Evening Reflection",
      description: "Reflect on your day and identify one lesson learned",
      category: "mindfulness",
      difficulty: "easy",
      crystals: 7,
      estimatedTime: "10 minutes",
      icon: FiMoon,
      color: "from-indigo-400 to-purple-500"
    }
  ];

  // Daily affirmations data
  const affirmations = [
    {
      id: 1,
      text: "I am capable of achieving my goals and dreams.",
      category: "self-belief",
      author: "Daily Wisdom"
    },
    {
      id: 2,
      text: "Every challenge I face is an opportunity for growth.",
      category: "resilience",
      author: "Inner Strength"
    },
    {
      id: 3,
      text: "I choose to focus on what I can control and let go of what I cannot.",
      category: "mindfulness",
      author: "Mindful Living"
    },
    {
      id: 4,
      text: "I am worthy of love, respect, and happiness.",
      category: "self-love",
      author: "Self-Compassion"
    },
    {
      id: 5,
      text: "My unique perspective and talents make a valuable contribution to the world.",
      category: "self-worth",
      author: "Personal Value"
    },
    {
      id: 6,
      text: "I embrace change as a natural part of life and growth.",
      category: "adaptability",
      author: "Life Wisdom"
    },
    {
      id: 7,
      text: "I am grateful for the abundance in my life, both big and small.",
      category: "gratitude",
      author: "Thankful Heart"
    }
  ];

  const handleCompleteChallenge = (challengeId) => {
    if (completedChallenges.includes(challengeId)) return;
    
    const challenge = dailyChallenges.find(c => c.id === challengeId);
    setCompletedChallenges([...completedChallenges, challengeId]);
    addCrystals(challenge.crystals);
    
    // Update streak
    setStreakData(prev => ({
      ...prev,
      currentStreak: prev.currentStreak + 1,
      totalCompleted: prev.totalCompleted + 1,
      longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1)
    }));
    
    toast.success(`Challenge completed! +${challenge.crystals} crystals earned! ⭐`, {
      duration: 3000,
      style: {
        background: 'linear-gradient(45deg, #10b981, #06b6d4)',
        color: 'white',
      }
    });
  };

  const nextAffirmation = () => {
    setCurrentAffirmation((prev) => (prev + 1) % affirmations.length);
  };

  const previousAffirmation = () => {
    setCurrentAffirmation((prev) => (prev - 1 + affirmations.length) % affirmations.length);
  };

  // Auto-rotate affirmations every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextAffirmation();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500 bg-green-100';
      case 'medium': return 'text-yellow-500 bg-yellow-100';
      case 'hard': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'mindfulness': return 'text-blue-600 bg-blue-100';
      case 'connection': return 'text-pink-600 bg-pink-100';
      case 'wellness': return 'text-green-600 bg-green-100';
      case 'growth': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            New Me Journey ✨
          </h1>
          <p className="text-lg text-gray-600">
            Daily challenges and affirmations for your transformation
          </p>
        </motion.div>

        {/* Streak Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card mb-8"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-2">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{streakData.currentStreak}</span>
              <span className="text-sm text-gray-600">Current Streak</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-2">
                <FiAward className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{streakData.longestStreak}</span>
              <span className="text-sm text-gray-600">Longest Streak</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full flex items-center justify-center mb-2">
                <FiCheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{streakData.totalCompleted}</span>
              <span className="text-sm text-gray-600">Total Completed</span>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-card inline-flex p-1">
            <button
              onClick={() => setSelectedTab('challenges')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                selectedTab === 'challenges'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiTarget className="w-5 h-5 inline mr-2" />
              Daily Challenges
            </button>
            <button
              onClick={() => setSelectedTab('affirmations')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                selectedTab === 'affirmations'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiHeart className="w-5 h-5 inline mr-2" />
              Affirmations
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'challenges' ? (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dailyChallenges.map((challenge, index) => {
                  const isCompleted = completedChallenges.includes(challenge.id);
                  const Icon = challenge.icon;
                  
                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`glass-card hover:shadow-xl transition-all duration-300 ${
                        isCompleted ? 'border-green-200 bg-green-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${challenge.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                          <span className="text-sm font-medium text-yellow-600 flex items-center">
                            <FiStar className="w-4 h-4 mr-1" />
                            {challenge.crystals}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {challenge.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4">
                        {challenge.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(challenge.category)}`}>
                            {challenge.category}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <FiCalendar className="w-4 h-4 mr-1" />
                            {challenge.estimatedTime}
                          </span>
                        </div>
                        
                        <motion.button
                          onClick={() => handleCompleteChallenge(challenge.id)}
                          disabled={isCompleted}
                          whileHover={{ scale: isCompleted ? 1 : 1.05 }}
                          whileTap={{ scale: isCompleted ? 1 : 0.95 }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            isCompleted
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <FiCheck className="w-4 h-4 inline mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <FiPlay className="w-4 h-4 inline mr-1" />
                              Start
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="affirmations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-3xl mx-auto">
                <motion.div
                  key={currentAffirmation}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="glass-card text-center p-8 mb-8"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSmile className="w-8 h-8 text-white" />
                  </div>
                  
                  <blockquote className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed mb-6">
                    "{affirmations[currentAffirmation].text}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(affirmations[currentAffirmation].category)}`}>
                      {affirmations[currentAffirmation].category}
                    </span>
                    <span className="text-gray-500">
                      — {affirmations[currentAffirmation].author}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <motion.button
                      onClick={previousAffirmation}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <FiRefreshCw className="w-5 h-5 text-gray-600 transform rotate-180" />
                    </motion.button>
                    
                    <div className="flex space-x-2">
                      {affirmations.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentAffirmation(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentAffirmation ? 'bg-primary-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <motion.button
                      onClick={nextAffirmation}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <FiRefreshCw className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>
                </motion.div>
                
                {/* Affirmation Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    💡 Tips for Using Affirmations
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Repeat affirmations daily, preferably in the morning</li>
                    <li>• Say them out loud or write them down for better impact</li>
                    <li>• Visualize yourself embodying the affirmation</li>
                    <li>• Choose affirmations that resonate with your current goals</li>
                    <li>• Be patient - positive changes take time to manifest</li>
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NewMe;