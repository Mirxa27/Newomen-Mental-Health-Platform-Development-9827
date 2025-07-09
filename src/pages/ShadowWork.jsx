import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import SafeIcon from '../components/common/SafeIcon';
import { useShadowWorkStore } from '../store/shadowWorkStore';
import QuestionCard from '../components/shadowwork/QuestionCard';
import ProgressBar from '../components/shadowwork/ProgressBar';
import InsightsPanel from '../components/shadowwork/InsightsPanel';
import BalanceWheel from '../components/shadowwork/BalanceWheel';
import DiagnosticTest from '../components/shadowwork/DiagnosticTest';

const { FiArrowLeft, FiArrowRight, FiCheck } = FiIcons;

const ShadowWork = () => {
  const { t } = useTranslation();
  const { questionId } = useParams();
  const navigate = useNavigate();
  const {
    currentQuestion,
    answers,
    isCompleted,
    insights,
    nextQuestion,
    previousQuestion,
    completeAssessment,
    setCurrentQuestion,
    selectedTopic,
    setTopic,
    getFilteredQuestions,
  } = useShadowWorkStore();

  const questions = useMemo(() => getFilteredQuestions(), [selectedTopic, getFilteredQuestions]);

  // Sync store with route parameter
  useEffect(() => {
    if (selectedTopic && questions.length > 0) {
      const index = questionId ? Number(questionId) - 1 : 0;
      if (index !== currentQuestion) {
        setCurrentQuestion(index);
      }
      if (!questionId) {
        navigate(`/shadow-work/${index + 1}`, { replace: true });
      }
    }
  }, [questionId, selectedTopic, questions.length, setCurrentQuestion, navigate, currentQuestion]);

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      const nextQ = currentQuestion + 2;
      nextQuestion();
      navigate(`/shadow-work/${nextQ}`);
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prevQ = currentQuestion;
      previousQuestion();
      navigate(`/shadow-work/${prevQ}`);
    }
  };

  const handleSelectTopic = (topic) => {
    setTopic(topic);
    if (topic === 'diagnostic') {
      navigate('/shadow-work/diagnostic');
    } else {
      navigate('/shadow-work/1');
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const hasAnswer = currentQuestionData && answers[currentQuestionData.id];
  const isLastQuestion = currentQuestion === questions.length - 1;

  if (!selectedTopic) {
    return <BalanceWheel onSelectTopic={handleSelectTopic} />;
  }
  
  if (selectedTopic === 'diagnostic') {
    return <DiagnosticTest />;
  }

  if (isCompleted && insights) {
    return <InsightsPanel insights={insights} />;
  }
  
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">No questions available for this topic yet.</h2>
        <button onClick={() => setTopic(null)} className="px-4 py-2 bg-primary-500 text-white rounded-lg">
          Choose another topic
        </button>
      </div>
    );
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
            Your Journey to Self-Discovery
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
            Uncover the hidden parts of yourself to grow stronger and more authentic.
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
            <span className="text-sm md:text-base">Back</span>
          </button>
          
          <div className="text-xs md:text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          
          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isLastQuestion ? "Complete assessment" : "Next question"}
          >
            <span className="text-sm md:text-base">{isLastQuestion ? 'Complete' : 'Next'}</span>
            <SafeIcon icon={isLastQuestion ? FiCheck : FiArrowRight} className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShadowWork;
