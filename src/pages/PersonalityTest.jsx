import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';

const { FiArrowLeft, FiArrowRight, FiCheck, FiStar, FiHeart, FiTarget, FiCompass } = FiIcons;

const PersonalityTest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setPersonality, addCrystals } = useAuthStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [personalityResult, setPersonalityResult] = useState(null);

  const questions = [
    {
      id: 1,
      text: "In social situations, I tend to:",
      options: [
        { value: 'E', text: "Energize from being around others" },
        { value: 'I', text: "Feel drained and need alone time" }
      ]
    },
    {
      id: 2,
      text: "When making decisions, I prefer to:",
      options: [
        { value: 'S', text: "Focus on concrete facts and details" },
        { value: 'N', text: "Consider possibilities and patterns" }
      ]
    },
    {
      id: 3,
      text: "I make choices based on:",
      options: [
        { value: 'T', text: "Logic and objective analysis" },
        { value: 'F', text: "Personal values and emotions" }
      ]
    },
    {
      id: 4,
      text: "My approach to life is:",
      options: [
        { value: 'J', text: "Planned and organized" },
        { value: 'P', text: "Flexible and spontaneous" }
      ]
    },
    {
      id: 5,
      text: "I feel most fulfilled when:",
      options: [
        { value: 'helping', text: "Helping others grow and thrive" },
        { value: 'creating', text: "Creating something new and innovative" }
      ]
    },
    {
      id: 6,
      text: "In challenging situations, I:",
      options: [
        { value: 'lead', text: "Take charge and lead others" },
        { value: 'adapt', text: "Adapt and go with the flow" }
      ]
    },
    {
      id: 7,
      text: "My ideal work environment is:",
      options: [
        { value: 'collaborative', text: "Collaborative and people-focused" },
        { value: 'independent', text: "Independent with creative freedom" }
      ]
    },
    {
      id: 8,
      text: "I find meaning through:",
      options: [
        { value: 'connection', text: "Deep connections with others" },
        { value: 'purpose', text: "Pursuing a greater purpose" }
      ]
    }
  ];

  const personalityTypes = {
    'The Nurturer': {
      description: "You have a natural gift for caring and supporting others. Your empathy and compassion make you a healing presence in people's lives.",
      strengths: ["Deeply empathetic", "Excellent listener", "Naturally supportive", "Intuitive about others' needs"],
      icon: FiHeart,
      color: "from-rose-400 to-pink-500",
      crystals: 15
    },
    'The Visionary': {
      description: "You see possibilities where others see obstacles. Your innovative thinking and creativity inspire others to dream bigger.",
      strengths: ["Innovative thinker", "Creative problem solver", "Inspirational", "Future-focused"],
      icon: FiStar,
      color: "from-purple-400 to-indigo-500",
      crystals: 15
    },
    'The Leader': {
      description: "You have a natural ability to guide and motivate others. Your confidence and decision-making skills inspire trust and action.",
      strengths: ["Natural leader", "Decisive", "Motivational", "Strategic thinker"],
      icon: FiTarget,
      color: "from-blue-400 to-cyan-500",
      crystals: 15
    },
    'The Harmonizer': {
      description: "You bring balance and peace to any environment. Your ability to see all perspectives makes you a valuable mediator and friend.",
      strengths: ["Diplomatic", "Balanced perspective", "Peaceful nature", "Excellent mediator"],
      icon: FiCompass,
      color: "from-green-400 to-emerald-500",
      crystals: 15
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const calculatePersonality = () => {
    const scores = {
      E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
      helping: 0, creating: 0, lead: 0, adapt: 0,
      collaborative: 0, independent: 0, connection: 0, purpose: 0
    };

    Object.values(answers).forEach(value => {
      if (Object.prototype.hasOwnProperty.call(scores, value)) {
        scores[value]++;
      }
    });

    // Determine personality type based on answers
    if (scores.helping > scores.creating && scores.connection > scores.purpose) {
      return 'The Nurturer';
    } else if (scores.creating > scores.helping && (scores.N > scores.S || scores.independent > scores.collaborative)) {
      return 'The Visionary';
    } else if (scores.lead > scores.adapt && (scores.E > scores.I || scores.J > scores.P)) {
      return 'The Leader';
    } else {
      return 'The Harmonizer';
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const result = calculatePersonality();
      setPersonalityResult(result);
      setPersonality(result);
      addCrystals(personalityTypes[result].crystals);
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQ = questions[currentQuestion];
  const hasAnswer = answers[currentQ.id];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResult && personalityResult) {
    const result = personalityTypes[personalityResult];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${result.color} flex items-center justify-center shadow-2xl`}>
              <SafeIcon icon={result.icon} className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              You are {personalityResult}!
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {result.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Strengths:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.strengths.map((strength, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center space-x-2"
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${result.color}`}></div>
                  <span className="text-gray-700">{strength}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`glass-card bg-gradient-to-r ${result.color} text-white text-center`}
          >
            <h3 className="text-xl font-semibold mb-2">Congratulations!</h3>
            <p className="mb-4">You've earned {result.crystals} crystals for completing the personality test!</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/chat')}
                className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors"
              >
                Start AI Chat
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-white text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Discover Your Personality
          </h1>
          <p className="text-lg text-gray-600">
            Understand your unique strengths and traits
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{currentQuestion + 1}/{questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="glass-card mb-8"
          >
            <div className="mb-6">
              <div className="text-sm font-medium text-primary-600 mb-2">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-relaxed">
                {currentQ.text}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswer(currentQ.id, option.value)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    answers[currentQ.id] === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 font-medium">{option.text}</span>
                    {answers[currentQ.id] === option.value && (
                      <SafeIcon icon={FiCheck} className="w-5 h-5 text-primary-500" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="text-sm text-gray-500">
            {currentQuestion + 1} / {questions.length}
          </div>

          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}</span>
            <SafeIcon icon={currentQuestion === questions.length - 1 ? FiCheck : FiArrowRight} className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PersonalityTest;
