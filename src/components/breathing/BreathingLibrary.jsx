import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useGamificationStore } from '../../store/gamificationStore';
import toast from 'react-hot-toast';

const { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiClock } = FiIcons;

const breathingPractices = [
  {
    id: 1,
    title: "4-7-8 Breathing",
    titleAr: "تنفس 4-7-8",
    description: "A calming technique that reduces anxiety and helps with sleep",
    descriptionAr: "تقنية مهدئة تقلل من القلق وتساعد على النوم",
    duration: "4 minutes",
    difficulty: "Beginner",
    audioUrl: "/audio/breathing-4-7-8.mp3", // In production, these would be real audio files
    instructions: [
      "Exhale completely through your mouth",
      "Close your mouth and inhale through your nose for 4 counts",
      "Hold your breath for 7 counts",
      "Exhale through your mouth for 8 counts",
      "Repeat this cycle 4 times"
    ],
    instructionsAr: [
      "أخرجي الهواء بالكامل من فمك",
      "أغلقي فمك واستنشقي من أنفك لمدة 4 عدات",
      "احبسي أنفاسك لمدة 7 عدات",
      "أخرجي الهواء من فمك لمدة 8 عدات",
      "كرري هذه الدورة 4 مرات"
    ]
  },
  {
    id: 2,
    title: "Box Breathing",
    titleAr: "تنفس الصندوق",
    description: "Military technique for stress management and focus",
    descriptionAr: "تقنية عسكرية لإدارة الضغط والتركيز",
    duration: "5 minutes",
    difficulty: "Intermediate",
    audioUrl: "/audio/breathing-box.mp3",
    instructions: [
      "Inhale for 4 counts",
      "Hold for 4 counts",
      "Exhale for 4 counts",
      "Hold empty for 4 counts",
      "Repeat for 5 minutes"
    ],
    instructionsAr: [
      "استنشقي لمدة 4 عدات",
      "احبسي لمدة 4 عدات",
      "أخرجي الهواء لمدة 4 عدات",
      "ابقي فارغة لمدة 4 عدات",
      "كرري لمدة 5 دقائق"
    ]
  },
  {
    id: 3,
    title: "Belly Breathing",
    titleAr: "تنفس البطن",
    description: "Deep diaphragmatic breathing for relaxation",
    descriptionAr: "تنفس الحجاب الحاجز العميق للاسترخاء",
    duration: "6 minutes",
    difficulty: "Beginner",
    audioUrl: "/audio/breathing-belly.mp3",
    instructions: [
      "Place one hand on your chest, one on your belly",
      "Breathe in slowly through your nose",
      "Feel your belly rise more than your chest",
      "Exhale slowly through pursed lips",
      "Continue for 6 minutes"
    ],
    instructionsAr: [
      "ضعي يداً على صدرك وأخرى على بطنك",
      "استنشقي ببطء من أنفك",
      "اشعري ببطنك يرتفع أكثر من صدرك",
      "أخرجي الهواء ببطء من شفتيك المضمومتين",
      "واصلي لمدة 6 دقائق"
    ]
  },
  {
    id: 4,
    title: "Alternate Nostril",
    titleAr: "تنفس الأنف المتناوب",
    description: "Yogic breathing to balance energy and calm the mind",
    descriptionAr: "تنفس يوغي لتوازن الطاقة وتهدئة العقل",
    duration: "8 minutes",
    difficulty: "Advanced",
    audioUrl: "/audio/breathing-alternate.mp3",
    instructions: [
      "Sit comfortably with your spine straight",
      "Use your thumb to close your right nostril",
      "Inhale through your left nostril",
      "Close left nostril with ring finger, release thumb",
      "Exhale through right nostril and continue alternating"
    ],
    instructionsAr: [
      "اجلسي براحة مع استقامة العمود الفقري",
      "استخدمي إبهامك لإغلاق أنفك الأيمن",
      "استنشقي من أنفك الأيسر",
      "أغلقي الأنف الأيسر بالبنصر، حرري الإبهام",
      "أخرجي الهواء من الأنف الأيمن واستمري بالتناوب"
    ]
  }
];

const BreathingLibrary = () => {
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef(null);
  const { awardCrystals, addAchievement, isFeatureUnlocked } = useGamificationStore();

  useEffect(() => {
    // Check if breathing library is unlocked
    if (!isFeatureUnlocked('breathing-library')) {
      toast.error('Breathing library unlocks at level 5!');
    }
  }, [isFeatureUnlocked]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Award crystals for completing a breathing practice
    awardCrystals(15, 'Completed breathing practice');
    addAchievement(
      `breathing-${selectedPractice.id}`,
      `${selectedPractice.title} Master`,
      `Completed the ${selectedPractice.title} breathing practice`
    );
    
    toast.success('Great job! You earned 15 crystals for completing the breathing practice.');
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  if (!isFeatureUnlocked('breathing-library')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Breathing Library Locked
          </h2>
          <p className="text-gray-600 mb-6">
            Complete more assessments to unlock the breathing practices library!
          </p>
          <p className="text-sm text-gray-500">
            Unlocks at Level 5
          </p>
        </div>
      </div>
    );
  }

  if (selectedPractice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedPractice(null)}
            className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <SafeIcon icon={FiSkipBack} className="w-5 h-5" />
            <span>Back to Library</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedPractice.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {selectedPractice.description}
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <SafeIcon icon={FiClock} className="w-4 h-4" />
                  <span>{selectedPractice.duration}</span>
                </div>
                <span>•</span>
                <span>{selectedPractice.difficulty}</span>
              </div>
            </div>

            {/* Audio Player */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <audio
                ref={audioRef}
                src={selectedPractice.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
              />
              
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={handlePlayPause}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:shadow-lg transition-all"
                >
                  <SafeIcon icon={isPlaying ? FiPause : FiPlay} className="w-6 h-6" />
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div
                    className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiVolume2} className="w-5 h-5 text-gray-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => {
                      setVolume(e.target.value);
                      if (audioRef.current) {
                        audioRef.current.volume = e.target.value;
                      }
                    }}
                    className="w-20"
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Instructions
                </h3>
                <ol className="space-y-2">
                  {selectedPractice.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  التعليمات
                </h3>
                <ol className="space-y-2">
                  {selectedPractice.instructionsAr.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 text-right" dir="rtl">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Audio Breathing Practices
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Guided breathing exercises to help you relax, focus, and find inner peace. 
            Choose from our collection of scientifically-backed breathing techniques.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {breathingPractices.map((practice, index) => (
            <motion.div
              key={practice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setSelectedPractice(practice)}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SafeIcon icon={FiPlay} className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {practice.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {practice.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <SafeIcon icon={FiClock} className="w-4 h-4" />
                  <span>{practice.duration}</span>
                </div>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                  {practice.difficulty}
                </span>
              </div>
              
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all">
                Start Practice
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreathingLibrary;
