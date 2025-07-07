import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useShadowWorkStore } from '../store/shadowWorkStore';
import QuestionCard from '../components/shadowwork/QuestionCard';
import ProgressBar from '../components/shadowwork/ProgressBar';
import InsightsPanel from '../components/shadowwork/InsightsPanel';

const { FiArrowLeft, FiArrowRight, FiCheck } = FiIcons;

const ShadowWork = () => {
  const { t } = useTranslation();
  const {
    currentQuestion,
    questions,
    answers,
    isCompleted,
    insights,
    nextQuestion,
    previousQuestion,
    completeAssessment,
  } = useShadowWorkStore();

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      nextQuestion();
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      previousQuestion();
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const hasAnswer = answers[currentQuestionData?.id];
  const isLastQuestion = currentQuestion === questions.length - 1;

  if (isCompleted && insights) {
    return <InsightsPanel insights={insights} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
            {t('shadowWorkTitle')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
            {t('shadowWorkSubtitle')}
          </p>
          <ProgressBar current={currentQuestion + 1} total={questions.length} />
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="mb-6 md:mb-8"
          >
            <QuestionCard
              question={currentQuestionData}
              questionNumber={currentQuestion + 1}
              totalQuestions={questions.length}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous question"
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">{t('back')}</span>
          </button>
          
          <div className="text-xs md:text-sm text-gray-500">
            {t('question')} {currentQuestion + 1} {t('of')} {questions.length}
          </div>
          
          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isLastQuestion ? "Complete assessment" : "Next question"}
          >
            <span className="text-sm md:text-base">{isLastQuestion ? 'Complete' : t('next')}</span>
            <SafeIcon icon={isLastQuestion ? FiCheck : FiArrowRight} className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShadowWork;