import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DailyAffirmation = () => {
    const [affirmation, setAffirmation] = useState('');

    useEffect(() => {
        // In a real app, this would be fetched from the backend based on user's personality
        const affirmations = [
            "I am worthy of love and respect.",
            "I am capable of achieving my dreams.",
            "I embrace my authentic self.",
            "I am resilient and can overcome any challenge."
        ];
        setAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-md text-center"
        >
            <p className="text-lg font-medium text-gray-700">{affirmation}</p>
        </motion.div>
    );
};

export default DailyAffirmation; 