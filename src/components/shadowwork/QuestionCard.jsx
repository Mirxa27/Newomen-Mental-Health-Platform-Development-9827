import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useShadowWorkStore } from '../../store/shadowWorkStore';

const QuestionCard = ({ question, questionNumber, totalQuestions }) => {
  const { i18n } = useTranslation();
  const { answers, answerQuestion } = useShadowWorkStore();
  const [localAnswer, setLocalAnswer] = useState(answers[question.id] || '');

  const handleAnswerChange = (value) => {
    setLocalAnswer(value);
    answerQuestion(question.id, value);
  };

  const questionText = i18n.language === 'ar' ? question.textAr : question.text;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-primary-600">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-500 capitalize">
            {question.category.replace('_', ' ')}
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
          {questionText}
        </h2>
      </div>

      <div className="space-y-4">
        <textarea
          value={localAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder="Share your thoughts openly and honestly..."
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
          style={{ minHeight: '120px' }}
        />
        
        <div className="text-sm text-gray-500">
          Take your time. There are no right or wrong answers - only your truth.
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;