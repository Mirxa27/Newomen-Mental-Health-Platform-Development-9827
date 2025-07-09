import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useGamificationStore } from '../store/gamificationStore';
import toast from 'react-hot-toast';

const { FiPlay, FiPause, FiVolume2, FiHeart, FiSun, FiMoon, FiWind } = FiIcons;

const BreathingLibrary = () => {
  const { t } = useTranslation();
  const { awardCrystals, isFeatureUnlocked } = useGamificationStore();
  const [activeExercise, setActiveExercise] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef(null);

  const breathingExercises = [
    {
      id: 'box-breathing',
      name: 'Box Breathing',
      description: 'Equal counts for inhale, hold, exhale, hold. Great for focus and calm.',
      icon: FiSun,
      duration: '5 minutes',
      pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
      benefits: ['Reduces stress', 'Improves focus', 'Calms nervous system'],
      locked: false,
    },
    {
      id: '478-breathing',
      name: '4-7-8 Breathing',
      description: 'Inhale for 4, hold for 7, exhale for 8. Perfect for sleep and anxiety.',
      icon: FiMoon,
      duration: '3 minutes',
      pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
      benefits: ['Promotes sleep', 'Reduces anxiety', 'Lowers heart rate'],
      locked: false,
    },
    {
      id: 'coherent-breathing',
      name: 'Coherent Breathing',
      description: 'Equal inhale and exhale for 5 counts. Balances the nervous system.',
      icon: FiHeart,
      duration: '10 minutes',
      pattern: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
      benefits: ['Heart rate variability', 'Emotional balance', 'Mental clarity'],
      locked: !isFeatureUnlocked('breathing-library'),
    },
    {
      id: 'energizing-breath',
      name: 'Energizing Breath',
      description: 'Quick inhale, longer exhale to energize and invigorate.',
      icon: FiWind,
      duration: '2 minutes',
      pattern: { inhale: 3, hold1: 1, exhale: 6, hold2: 1 },
      benefits: ['Increases energy', 'Improves alertness', 'Boosts mood'],
      locked: !isFeatureUnlocked('breathing-library'),
    },
  ];

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startExercise = (exercise) => {
    if (exercise.locked) {
      toast.error('This exercise will unlock at level 5!');
      return;
    }

    setActiveExercise(exercise);
    setCurrentCycle(0);
    setPhase('inhale');
    setTimeLeft(exercise.pattern.inhale);
    setIsPlaying(true);

    // Start the breathing timer
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next phase
          return switchPhase(exercise);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const switchPhase = (exercise) => {
    setPhase(currentPhase => {
      let nextPhase = currentPhase;
      let nextTime = 0;

      switch (currentPhase) {
        case 'inhale':
          if (exercise.pattern.hold1 > 0) {
            nextPhase = 'hold1';
            nextTime = exercise.pattern.hold1;
          } else {
            nextPhase = 'exhale';
            nextTime = exercise.pattern.exhale;
          }
          break;
        case 'hold1':
          nextPhase = 'exhale';
          nextTime = exercise.pattern.exhale;
          break;
        case 'exhale':
          if (exercise.pattern.hold2 > 0) {
            nextPhase = 'hold2';
            nextTime = exercise.pattern.hold2;
          } else {
            nextPhase = 'inhale';
            nextTime = exercise.pattern.inhale;
            setCurrentCycle(prev => prev + 1);
          }
          break;
        case 'hold2':
          nextPhase = 'inhale';
          nextTime = exercise.pattern.inhale;
          setCurrentCycle(prev => prev + 1);
          break;
      }

      return nextPhase;
    });

    return timeLeft; // Return the new time for the next phase
  };

  const stopExercise = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setActiveExercise(null);
    setCurrentCycle(0);
    
    // Award crystals for completing a session
    if (currentCycle >= 3) {
      awardCrystals(10, 'Completed breathing exercise');
      toast.success('Great job! You earned 10 crystals for your breathing practice.');
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return switchPhase(activeExercise);
          }
          return prev - 1;
        });
      }, 1000);
      setIsPlaying(true);
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold1':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'hold2':
        return 'Hold';
      default:
        return 'Breathe';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'from-blue-400 to-blue-600';
      case 'hold1':
      case 'hold2':
        return 'from-purple-400 to-purple-600';
      case 'exhale':
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  if (activeExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {activeExercise.name}
          </h2>
          <p className="text-gray-600 mb-8">
            Cycle {currentCycle + 1}
          </p>

          {/* Breathing Circle */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <motion.div
              animate={{
                scale: phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.8 : 1,
              }}
              transition={{ duration: timeLeft, ease: "linear" }}
              className={`w-full h-full rounded-full bg-gradient-to-r ${getPhaseColor()} flex items-center justify-center shadow-lg`}
            >
              <div className="text-white text-center">
                <div className="text-xl font-semibold mb-2">
                  {getPhaseInstruction()}
                </div>
                <div className="text-3xl font-bold">
                  {timeLeft}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="p-4 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
            >
              <SafeIcon icon={isPlaying ? FiPause : FiPlay} className="w-6 h-6" />
            </button>
            
            <button
              onClick={stopExercise}
              className="px-6 py-4 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
            >
              End Session
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Breathing Practices Library
          </h1>
          <p className="text-xl text-gray-600">
            Guided breathing exercises to calm your mind and restore balance
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {breathingExercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg transition-all ${
                exercise.locked 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-xl cursor-pointer'
              }`}
              onClick={() => !exercise.locked && startExercise(exercise)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center ${
                  exercise.locked ? 'grayscale' : ''
                }`}>
                  <SafeIcon icon={exercise.icon} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {exercise.name}
                    {exercise.locked && (
                      <span className="ml-2 text-sm text-yellow-600">🔒 Level 5</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{exercise.duration}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                {exercise.description}
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Benefits:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {exercise.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {!exercise.locked && (
                <button className="w-full mt-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                  <SafeIcon icon={FiPlay} className="w-4 h-4" />
                  <span>Start Practice</span>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreathingLibrary;
