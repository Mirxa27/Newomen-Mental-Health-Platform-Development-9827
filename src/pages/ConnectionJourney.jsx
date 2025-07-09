import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const questions = [
    { id: 1, text: "What is your primary love language?" },
    { id: 2, text: "How do you prefer to resolve conflicts?" },
    { id: 3, text: "What are your long-term relationship goals?" },
];

const CompatibilityTest = ({ user1, user2, onSubmit }) => {
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentUser, setCurrentUser] = useState(1);

    const handleAnswerChange = (e) => {
        setAnswers({
            ...answers,
            [`user${currentUser}_q${questions[currentQuestionIndex].id}`]: e.target.value
        });
    };

    const handleNext = () => {
        if (currentUser === 1) {
            setCurrentUser(2);
        } else {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setCurrentUser(1);
            } else {
                onSubmit(answers);
            }
        }
    };

    return (
        <div className="p-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Compatibility Test for {currentUser === 1 ? user1 : user2}</h2>
            <motion.div key={currentQuestionIndex}>
                <p className="text-lg mb-4">{questions[currentQuestionIndex].text}</p>
                <textarea
                    onChange={handleAnswerChange}
                    className="w-full p-2 border rounded"
                    rows="4"
                />
                <button onClick={handleNext} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
                    {currentUser === 1 ? 'Next Person' : (currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit')}
                </button>
            </motion.div>
        </div>
    );
};

const ConnectionJourney = () => {
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (answers) => {
        setIsLoading(true);
        try {
            const response = await api.post('/connection-journey/analyze', { answers });
            setResults(response.data.analysis);
        } catch (error) {
            console.error("Failed to get analysis:", error);
            setResults("Sorry, we couldn't analyze your results at this time.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Connection Journey</h1>
            {isLoading ? (
                <div>Loading...</div>
            ) : results ? (
                <div>
                    <h2 className="text-xl font-bold">Results</h2>
                    <p>{results}</p>
                </div>
            ) : (
                <CompatibilityTest user1="Partner 1" user2="Partner 2" onSubmit={handleSubmit} />
            )}
        </div>
    );
};

export default ConnectionJourney; 