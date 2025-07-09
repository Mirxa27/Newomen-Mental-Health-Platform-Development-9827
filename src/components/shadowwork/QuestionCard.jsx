import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useShadowWorkStore } from '../../store/shadowWorkStore';
import GlassCard from '../common/GlassCard';

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
    <GlassCard
      className="w-full max-w-4xl mx-auto"
      elasticity={0.25}
      cornerRadius={24}
      padding="32px"
      overLight={true}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full"
          >
            Question {questionNumber} of {totalQuestions}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs md:text-sm text-gray-500 capitalize bg-gray-50 px-3 py-1 rounded-full"
          >
            {question.category.replace('_', ' ')}
          </motion.span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-relaxed"
        >
          {questionText}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="relative">
            <textarea
              value={localAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Share your thoughts openly and honestly..."
              className="w-full h-32 md:h-36 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-300 placeholder-gray-500"
              style={{ minHeight: '140px' }}
              aria-label="Your answer"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {localAnswer.length} characters
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50/50 backdrop-blur-sm px-4 py-3 rounded-lg border border-blue-100/50"
          >
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Take your time. There are no right or wrong answers - only your truth.</span>
          </motion.div>
        </motion.div>
      </div>
    </GlassCard>
  );
};

export default QuestionCard;
