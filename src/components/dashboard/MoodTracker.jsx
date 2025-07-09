import React, { useState } from 'react';
import { motion } from 'framer-motion';

const moods = [
    { name: 'Happy', emoji: '😊' },
    { name: 'Calm', emoji: '😌' },
    { name: 'Sad', emoji: '😢' },
    { name: 'Anxious', emoji: '😟' },
    { name: 'Excited', emoji: '🤩' },
];

const MoodTracker = () => {
    const [selectedMood, setSelectedMood] = useState(null);

    return (
        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4 text-center">How are you feeling today?</h3>
            <div className="flex justify-around">
                {moods.map(mood => (
                    <motion.button
                        key={mood.name}
                        onClick={() => setSelectedMood(mood)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-full ${selectedMood?.name === mood.name ? 'bg-blue-500' : 'bg-gray-200'}`}
                    >
                        <span className="text-2xl">{mood.emoji}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default MoodTracker; 