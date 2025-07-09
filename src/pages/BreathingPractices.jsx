import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import GlassCard from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';

const { FiPlay, FiPause, FiRefreshCw, FiHeart, FiWind, FiSun, FiMoon, FiActivity } = FiIcons;

const BreathingPractices = () => {
  const { t } = useTranslation();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const intervalRef = useRef(null);
  const sessionRef = useRef(null);

  const exercises = [
    {
      id: 1,
      name: 'Box Breathing',
      nameAr: 'تنفس الصندوق',
      description: 'Navy SEAL technique for focus and calm',
      descriptionAr: 'تقنية البحرية الأمريكية للتركيز والهدوء',
      icon: FiActivity,
      color: 'from-blue-400 to-indigo-500',
      phases: [
        { name: 'Inhale', duration: 4, color: 'bg-blue-400' },
        { name: 'Hold', duration: 4, color: 'bg-indigo-400' },
        { name: 'Exhale', duration: 4, color: 'bg-purple-400' },
        { name: 'Hold', duration: 4, color: 'bg-blue-300' }
      ],
      benefits: ['Reduces stress', 'Improves focus', 'Calms nervous system']
    },
    {
      id: 2,
      name: '4-7-8 Breathing',
      nameAr: 'تنفس ٤-٧-٨',
      description: 'Dr. Weil\'s natural tranquilizer',
      descriptionAr: 'المهدئ الطبيعي للدكتور ويل',
      icon: FiMoon,
      color: 'from-purple-400 to-pink-500',
      phases: [
        { name: 'Inhale', duration: 4, color: 'bg-purple-400' },
        { name: 'Hold', duration: 7, color: 'bg-indigo-400' },
        { name: 'Exhale', duration: 8, color: 'bg-pink-400' }
      ],
      benefits: ['Promotes sleep', 'Reduces anxiety', 'Aids relaxation']
    },
    {
      id: 3,
      name: 'Energizing Breath',
      nameAr: 'التنفس المنشط',
      description: 'Morning breath work for vitality',
      descriptionAr: 'تمارين التنفس الصباحية للحيوية',
      icon: FiSun,
      color: 'from-yellow-400 to-orange-500',
      phases: [
        { name: 'Inhale', duration: 2, color: 'bg-yellow-400' },
        { name: 'Exhale', duration: 2, color: 'bg-orange-400' }
      ],
      benefits: ['Increases energy', 'Improves alertness', 'Boosts mood']
    },
    {
      id: 4,
      name: 'Heart Coherence',
      nameAr: 'تماسك القلب',
      description: 'Heart-centered breathing for emotional balance',
      descriptionAr: 'التنفس المتمركز حول القلب للتوازن العاطفي',
      icon: FiHeart,
      color: 'from-rose-400 to-red-500',
      phases: [
        { name: 'Inhale', duration: 5, color: 'bg-rose-400' },
        { name: 'Exhale', duration: 5, color: 'bg-red-400' }
      ],
      benefits: ['Emotional balance', 'Heart health', 'Stress reduction']
    }
  ];

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (sessionRef.current) clearInterval(sessionRef.current);
    };
  }, []);

  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setIsActive(true);
    setCycleCount(0);
    setSessionDuration(0);
    setCurrentPhase(exercise.phases[0].name.toLowerCase());
    setTimeRemaining(exercise.phases[0].duration);

    // Session timer
    sessionRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    // Breathing timer
    let phaseIndex = 0;
    let remainingTime = exercise.phases[0].duration;

    intervalRef.current = setInterval(() => {
      remainingTime--;
      setTimeRemaining(remainingTime);

      if (remainingTime === 0) {
        phaseIndex = (phaseIndex + 1) % exercise.phases.length;

        if (phaseIndex === 0) {
          setCycleCount(prev => prev + 1);
        }

        const nextPhase = exercise.phases[phaseIndex];
        setCurrentPhase(nextPhase.name.toLowerCase());
        remainingTime = nextPhase.duration;
        setTimeRemaining(remainingTime);
      }
    }, 1000);
  };

  const stopExercise = () => {
    setIsActive(false);
    setSelectedExercise(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (sessionRef.current) clearInterval(sessionRef.current);
  };

  const pauseExercise = () => {
    setIsActive(!isActive);
    if (isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (sessionRef.current) clearInterval(sessionRef.current);
    } else {
      // Resume timers
      sessionRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);

      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Handle phase transition
            return selectedExercise.phases[0].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPhaseData = () => {
    if (!selectedExercise) return null;
    return selectedExercise.phases.find(p => p.name.toLowerCase() === currentPhase);
  };

  if (selectedExercise) {
    const phaseData = getCurrentPhaseData();
    const progress = phaseData ? ((phaseData.duration - timeRemaining) / phaseData.duration) * 100 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {selectedExercise.name}
            </h1>
            <p className="text-blue-200 text-sm md:text-base">
              {selectedExercise.description}
            </p>
          </motion.div>

          {/* Breathing Circle */}
          <motion.div className="relative mb-8">
            <svg width="280" height="280" className="transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke={phaseData?.color?.replace('bg-', '') ? `rgb(${phaseData.color.includes('blue') ? '59, 130, 246' : phaseData.color.includes('purple') ? '147, 51, 234' : phaseData.color.includes('pink') ? '236, 72, 153' : '248, 113, 113'})` : 'rgb(59, 130, 246)'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <motion.div
                key={currentPhase}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-6xl font-light mb-2">
                  {timeRemaining}
                </div>
                <div className="text-lg md:text-xl capitalize font-medium">
                  {currentPhase}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard
              padding="20px"
              cornerRadius={16}
              className="text-white text-center min-w-[200px]"
              overLight={false}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-blue-200">Cycles</div>
                  <div className="text-xl font-semibold">{cycleCount}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-200">Duration</div>
                  <div className="text-xl font-semibold">{formatTime(sessionDuration)}</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={pauseExercise}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <SafeIcon icon={isActive ? FiPause : FiPlay} className="w-6 h-6" />
            </button>
            <button
              onClick={stopExercise}
              className="w-12 h-12 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center text-red-300 hover:bg-red-500/30 transition-all"
            >
              <SafeIcon icon={FiRefreshCw} className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Breathing Practices
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your wellbeing through the power of mindful breathing
          </p>
        </motion.div>

        {/* Exercise Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${exercise.color} p-1 rounded-3xl`}
              onClick={() => startExercise(exercise)}
            >
              <GlassCard
                className="bg-white/95 backdrop-blur-sm h-full"
                padding="24px"
                cornerRadius={20}
                overLight={true}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${exercise.color} flex items-center justify-center text-white shadow-lg`}>
                    <SafeIcon icon={exercise.icon} className="w-8 h-8" />
                  </div>
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <SafeIcon icon={FiPlay} className="w-6 h-6 text-gray-600" />
                  </motion.div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {exercise.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {exercise.description}
                </p>

                <div className="space-y-2 mb-6">
                  <h4 className="font-semibold text-gray-800 text-sm">Benefits:</h4>
                  <ul className="space-y-1">
                    {exercise.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {exercise.phases.length} phases
                  </div>
                  <GlassButton
                    variant="primary"
                    size="md"
                    className={`bg-gradient-to-r ${exercise.color} text-white font-medium shadow-lg hover:shadow-xl`}
                  >
                    Start Practice
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <GlassCard padding="32px" cornerRadius={24} className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Breathing Practice Tips
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <SafeIcon icon={FiWind} className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p><strong>Find your rhythm:</strong> Don't force the breath, let it flow naturally</p>
              </div>
              <div>
                <SafeIcon icon={FiHeart} className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p><strong>Stay consistent:</strong> Regular practice yields the best results</p>
              </div>
              <div>
                <SafeIcon icon={FiSun} className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p><strong>Create space:</strong> Find a quiet, comfortable place to practice</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default BreathingPractices;
