import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import toast from 'react-hot-toast';

const questions = [
  {
    question: "When facing a challenge, you are more likely to:",
    answers: [
      { text: "Analyze the situation logically and create a step-by-step plan.", type: "Analyst" },
      { text: "Trust your intuition and go with what feels right.", type: "Creative" },
      { text: "Seek support and advice from friends or family.", type: "Connector" },
      { text: "Take immediate action and adapt as you go.", type: "Driver" },
    ],
  },
  {
    question: "When you have free time, you prefer to:",
    answers: [
      { text: "Read a book or learn something new.", type: "Analyst" },
      { text: "Engage in a creative hobby like painting, writing, or music.", type: "Creative" },
      { text: "Spend quality time with loved ones.", type: "Connector" },
      { text: "Do something active or adventurous.", type: "Driver" },
    ],
  },
  {
    question: "In a team project, you are the one who:",
    answers: [
      { text: "Organizes the tasks and ensures everything is on track.", type: "Analyst" },
      { text: "Brings new and innovative ideas to the table.", type: "Creative" },
      { text: "Makes sure everyone feels heard and included.", type: "Connector" },
      { text: "Pushes the team to meet deadlines and achieve goals.", type: "Driver" },
    ],
  },
];

const PersonalityTest = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const { user, updateUserProfile } = useAuthStore();
  const { awardCrystals, addAchievement } = useGamificationStore();

  const handleAnswer = (type) => {
    setAnswers([...answers, type]);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    const counts = answers.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const personalityType = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    
    const growthZone = getGrowthZone(personalityType);

    const personalityData = {
      type: personalityType,
      growthZone: growthZone,
      assessmentDate: new Date().toISOString(),
    };

    try {
      await updateUserProfile({
        ...user,
        personality: personalityData,
      });
      
      // Award crystals and achievement for completing personality test
      const reward = awardCrystals(50, 'Completed personality test');
      addAchievement(
        'personality-test-complete',
        'Self-Discovery Pioneer',
        'Completed the personality assessment'
      );
      
      if (reward.leveledUp) {
        toast.success(`Congratulations! You've reached level ${reward.level} and unlocked new features!`);
      } else {
        toast.success('Personality profile updated! You earned 50 crystals!');
      }
      
      onComplete(personalityData);
    } catch (error) {
      toast.error('Failed to save your results. Please try again.');
    }
  };

  const getGrowthZone = (type) => {
    switch (type) {
      case "Analyst":
        return "Connecting with your emotions and trusting your intuition.";
      case "Creative":
        return "Bringing structure to your ideas and creating actionable plans.";
      case "Connector":
        return "Setting personal boundaries and prioritizing your own needs.";
      case "Driver":
        return "Practicing patience and considering all options before acting.";
      default:
        return "Exploring different facets of your personality.";
    }
  };

  return (
    <div className="p-4 md:p-8 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
        Discover Your Inner Strength
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Answer a few questions to understand your unique personality.
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-700 mb-4">
              {questions[currentQuestion].question}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questions[currentQuestion].answers.map((answer, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(answer.type)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-primary-100 border border-gray-200 rounded-lg transition-colors"
                >
                  {answer.text}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="text-center text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PersonalityTest;
