import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const questions = [
  { id: 1, text: 'I enjoy leading group activities.' },
  { id: 2, text: 'I often help others before myself.' },
  { id: 3, text: 'I love brainstorming innovative ideas.' },
];

const PersonalityTest = () => {
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();
  const setPersonality = useAuthStore((s) => s.setPersonality);

  const handleSelect = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const score = {
      leader: (answers[1] || 0),
      nurturer: (answers[2] || 0),
      visionary: (answers[3] || 0),
    };
    const personality = Object.keys(score).reduce((a, b) => score[a] >= score[b] ? a : b);
    setPersonality(personality);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <motion.form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl space-y-6 w-full max-w-md" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <h2 className="text-xl font-bold text-center text-gray-900 mb-4">Quick Personality Test</h2>
        {questions.map(q => (
          <div key={q.id} className="space-y-2">
            <p className="font-medium text-gray-800">{q.text}</p>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-1">
                <input type="radio" name={`q${q.id}`} onChange={() => handleSelect(q.id, 1)} required />
                <span>Yes</span>
              </label>
              <label className="flex items-center space-x-1">
                <input type="radio" name={`q${q.id}`} onChange={() => handleSelect(q.id, 0)} />
                <span>No</span>
              </label>
            </div>
          </div>
        ))}
        <button type="submit" className="w-full bg-primary-500 text-white py-2 rounded-lg">Finish</button>
      </motion.form>
    </div>
  );
};

export default PersonalityTest;
