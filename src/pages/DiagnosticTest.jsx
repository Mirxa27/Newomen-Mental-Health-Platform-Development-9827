import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useGamificationStore } from '../store/gamificationStore';
import toast from 'react-hot-toast';

const { FiArrowLeft, FiArrowRight, FiCheck, FiTrendingUp } = FiIcons;

const DiagnosticTest = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { awardCrystals, addAchievement } = useGamificationStore();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState(null);

  const diagnosticQuestions = {
    relationships: [
      {
        id: 1,
        question: "How satisfied are you with your current relationships?",
        scale: true,
        options: ["Very Unsatisfied", "Unsatisfied", "Neutral", "Satisfied", "Very Satisfied"]
      },
      {
        id: 2,
        question: "Do you feel heard and understood by those close to you?",
        scale: true,
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
      },
      {
        id: 3,
        question: "How comfortable are you setting boundaries?",
        scale: true,
        options: ["Very Uncomfortable", "Uncomfortable", "Neutral", "Comfortable", "Very Comfortable"]
      },
      {
        id: 4,
        question: "Do you feel you can be your authentic self in relationships?",
        scale: true,
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
      },
      {
        id: 5,
        question: "How do you handle conflict in relationships?",
        multiple: true,
        options: ["Avoid it", "Get defensive", "Listen actively", "Communicate openly", "Seek compromise"]
      }
    ],
    health: [
      {
        id: 1,
        question: "How would you rate your overall physical health?",
        scale: true,
        options: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
      },
      {
        id: 2,
        question: "How often do you engage in physical activity?",
        scale: true,
        options: ["Never", "Monthly", "Weekly", "Several times a week", "Daily"]
      },
      {
        id: 3,
        question: "How well do you manage stress?",
        scale: true,
        options: ["Very Poorly", "Poorly", "Okay", "Well", "Very Well"]
      },
      {
        id: 4,
        question: "How satisfied are you with your sleep quality?",
        scale: true,
        options: ["Very Unsatisfied", "Unsatisfied", "Neutral", "Satisfied", "Very Satisfied"]
      },
      {
        id: 5,
        question: "What health habits would you like to improve?",
        multiple: true,
        options: ["Diet", "Exercise", "Sleep", "Stress management", "Mental health care"]
      }
    ],
    "self-esteem": [
      {
        id: 1,
        question: "How comfortable are you with who you are?",
        scale: true,
        options: ["Very Uncomfortable", "Uncomfortable", "Neutral", "Comfortable", "Very Comfortable"]
      },
      {
        id: 2,
        question: "How often do you practice self-compassion?",
        scale: true,
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
      },
      {
        id: 3,
        question: "Do you believe you deserve good things in life?",
        scale: true,
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
      },
      {
        id: 4,
        question: "How do you respond to your mistakes?",
        multiple: true,
        options: ["Self-criticism", "Learning opportunity", "Shame", "Acceptance", "Growth mindset"]
      },
      {
        id: 5,
        question: "What affects your self-worth most?",
        multiple: true,
        options: ["Others' opinions", "Achievements", "Appearance", "Inner values", "Relationships"]
      }
    ]
  };

  const questions = diagnosticQuestions[topic] || diagnosticQuestions.relationships;
  const currentQuestionData = questions[currentQuestion];

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [currentQuestionData.id]: value
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeTest();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeTest = () => {
    // Calculate results based on answers
    const scaleAnswers = Object.entries(answers)
      .filter(([id, value]) => {
        const question = questions.find(q => q.id === parseInt(id));
        return question && question.scale && typeof value === 'number';
      })
      .map(([_, value]) => value);

    const averageScore = scaleAnswers.length > 0 
      ? scaleAnswers.reduce((sum, score) => sum + score, 0) / scaleAnswers.length 
      : 3;

    let category, recommendations;
    
    if (averageScore >= 4) {
      category = "Thriving";
      recommendations = [
        "Continue your excellent practices",
        "Consider mentoring others in this area",
        "Set new challenging goals"
      ];
    } else if (averageScore >= 3) {
      category = "Growing";
      recommendations = [
        "Focus on consistency in positive habits",
        "Identify specific areas for improvement",
        "Celebrate your progress so far"
      ];
    } else {
      category = "Developing";
      recommendations = [
        "Start with small, manageable changes",
        "Consider seeking additional support",
        "Be patient and compassionate with yourself"
      ];
    }

    setResults({
      score: Math.round(averageScore * 20), // Convert to percentage
      category,
      recommendations,
      topic: topic.charAt(0).toUpperCase() + topic.slice(1)
    });

    // Award crystals and achievements
    const reward = awardCrystals(75, `Completed ${topic} diagnostic test`);
    addAchievement(
      `diagnostic-${topic}`,
      `${topic.charAt(0).toUpperCase() + topic.slice(1)} Assessment Complete`,
      `Completed the diagnostic test for ${topic}`
    );

    if (reward.leveledUp) {
      toast.success(`Congratulations! You've reached level ${reward.level}!`);
    }

    setIsCompleted(true);
  };

  const hasAnswer = answers[currentQuestionData?.id] !== undefined;

  if (isCompleted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiCheck} className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {results.topic} Assessment Complete!
            </h1>
            
            <div className="text-6xl font-bold text-primary-600 mb-2">
              {results.score}%
            </div>
            
            <div className="text-xl text-gray-700 mb-6">
              Status: <span className="font-semibold text-primary-600">{results.category}</span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations for Growth:</h3>
              <ul className="space-y-2">
                {results.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-primary-500 mt-0.5" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/shadow-work')}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Continue with Shadow Work
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                View Progress
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {topic.charAt(0).toUpperCase() + topic.slice(1)} Assessment
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            This diagnostic will help identify which areas need attention and suggest personalized growth strategies.
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestionData.question}
            </h2>
            
            <div className="space-y-3">
              {currentQuestionData.scale ? (
                // Scale questions (1-5)
                currentQuestionData.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index + 1)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      answers[currentQuestionData.id] === index + 1
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      <span className="text-sm text-gray-500">{index + 1}</span>
                    </div>
                  </button>
                ))
              ) : (
                // Multiple choice questions
                currentQuestionData.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const current = answers[currentQuestionData.id] || [];
                      const isSelected = current.includes(option);
                      const newSelection = isSelected
                        ? current.filter(item => item !== option)
                        : [...current, option];
                      handleAnswer(newSelection);
                    }}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      answers[currentQuestionData.id]?.includes(option)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>Previous</span>
          </button>
          
          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}</span>
            <SafeIcon icon={currentQuestion === questions.length - 1 ? FiCheck : FiArrowRight} className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTest;
