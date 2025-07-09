import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useShadowWorkStore } from '../../store/shadowWorkStore';
import { useNavigate } from 'react-router-dom';

const diagnosticQuestions = [
  { id: 'q1', text: 'How fulfilled do you feel in your personal relationships?', area: 'relationships' },
  { id: 'q2', text: 'How connected do you feel to your physical and mental well-being?', area: 'health' },
  { id: 'q3', text: 'How strong is your sense of self-worth and confidence?', area: 'self-esteem' },
  { id: 'q4', text: 'How harmonious are your family dynamics?', area: 'family' },
  { id: 'q5', text: 'Are you actively growing and developing as a person?', area: 'self-development' },
  { id: 'q6', text: 'Do you feel your relationships are balanced and reciprocal?', area: 'relationships' },
  { id: 'q7', text: 'Are you happy with your current lifestyle and health habits?', area: 'health' },
  { id: 'q8', text: 'Do you often compare yourself to others?', area: 'self-esteem' },
];

const DiagnosticTest = () => {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const setTopic = useShadowWorkStore((state) => state.setTopic);
  const navigate = useNavigate();

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateResults = () => {
    const scores = {
      relationships: 0,
      health: 0,
      'self-esteem': 0,
      family: 0,
      'self-development': 0,
    };
    const counts = { ...scores };

    diagnosticQuestions.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        // Lower scores indicate more need for work.
        scores[q.area] += parseInt(answer, 10);
        counts[q.area]++;
      }
    });

    const averages = {};
    for (const area in scores) {
      if (counts[area] > 0) {
        averages[area] = scores[area] / counts[area];
      }
    }

    // Find the area with the lowest average score
    const recommendedArea = Object.keys(averages).reduce((a, b) => averages[a] < averages[b] ? a : b);
    
    setResults({ recommendedArea, scores: averages });
  };

  const handleStartRecommendedTest = () => {
    setTopic(results.recommendedArea);
    navigate('/shadow-work/1');
  };
  
  const handleChooseAnother = () => {
    setTopic(null); // This will take them back to the BalanceWheel
    navigate('/shadow-work');
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Diagnostic Complete</h2>
          <p className="text-gray-600 mb-6">Based on your answers, we recommend focusing on:</p>
          <p className="text-3xl font-bold text-primary-600 capitalize mb-8">{results.recommendedArea.replace('-', ' ')}</p>
          <p className="text-gray-600 mb-6">This area seems to be where the most growth can happen for you right now.</p>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={handleStartRecommendedTest}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Start {results.recommendedArea.replace('-', ' ')} Test
            </button>
            <button 
              onClick={handleChooseAnother}
              className="w-full px-6 py-3 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Choose a different topic
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quick Diagnostic</h1>
          <p className="text-lg text-gray-600">Answer these questions to find your focus area.</p>
        </motion.div>

        <div className="space-y-8">
          {diagnosticQuestions.map((q, index) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-md"
            >
              <label htmlFor={q.id} className="block text-lg font-semibold text-gray-800 mb-4">{q.text}</label>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Needs Work</span>
                <span>Feeling Great</span>
              </div>
              <input
                type="range"
                id={q.id}
                min="1"
                max="5"
                value={answers[q.id] || '3'}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: diagnosticQuestions.length * 0.1 }}
          className="text-center mt-10"
        >
          <button
            onClick={calculateResults}
            disabled={Object.keys(answers).length < diagnosticQuestions.length}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            See My Recommendation
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default DiagnosticTest;
