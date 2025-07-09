import React from 'react';
import { FiAward, FiTrendingUp, FiStar } from 'react-icons/fi';

const GamificationDashboard = () => {
    // Mock data
    const stats = {
        crystals: 1250,
        level: 5,
        progress: 65, // percentage
    };

    const achievements = [
        { id: 1, name: 'First Step', icon: <FiStar /> },
        { id: 2, name: 'Consistent Growth', icon: <FiTrendingUp /> },
        { id: 3, name: 'Community Builder', icon: <FiAward /> },
    ];

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Your Growth Journey</h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div>Crystals: {stats.crystals}</div>
                <div>Level: {stats.level}</div>
                <div>Progress to Next Level: {stats.progress}%</div>
            </div>

            <h3 className="text-xl font-bold mb-4">Achievements</h3>
            <div className="flex space-x-4">
                {achievements.map(ach => (
                    <div key={ach.id} className="text-center">
                        <div className="p-4 bg-gray-200 rounded-full">{ach.icon}</div>
                        <p className="mt-2 text-sm">{ach.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GamificationDashboard; 