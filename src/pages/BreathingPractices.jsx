import React from 'react';
import { motion } from 'framer-motion';

const exercises = [
  { name: 'Box Breathing', audio: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7f02c6351e.mp3' },
  { name: '4-7-8 Breath', audio: 'https://cdn.pixabay.com/download/audio/2021/09/01/audio_c9de0fdf28.mp3' },
];

const BreathingPractices = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Breathing Practices</h1>
      {exercises.map((ex, idx) => (
        <motion.div key={idx} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <h2 className="font-semibold text-gray-800 mb-2">{ex.name}</h2>
          <audio controls className="w-full">
            <source src={ex.audio} type="audio/mpeg" />
          </audio>
        </motion.div>
      ))}
    </div>
  </div>
);

export default BreathingPractices;
