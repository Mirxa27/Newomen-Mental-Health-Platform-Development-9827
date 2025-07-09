import React, { useState } from 'react';
import { motion } from 'framer-motion';

const areas = [
    { name: 'Relationships', color: '#FF6B6B' },
    { name: 'Health & Wellness', color: '#4ECDC4' },
    { name: 'Family Dynamics', color: '#45B7D1' },
    { name: 'Self-Development', color: '#F7B801' },
    // Add more areas as needed
];

const BalanceWheel = ({ onSelect }) => {
    const [selectedArea, setSelectedArea] = useState(null);

    const handleSelect = (area) => {
        setSelectedArea(area);
        onSelect(area);
    };

    return (
        <div className="relative w-96 h-96">
            {areas.map((area, index) => {
                const angle = (index / areas.length) * 360;
                return (
                    <motion.div
                        key={area.name}
                        className="absolute top-0 left-0 w-full h-full"
                        style={{ transform: `rotate(${angle}deg)` }}
                    >
                        <div
                            onClick={() => handleSelect(area)}
                            className="w-1/2 h-1/2 cursor-pointer"
                            style={{
                                backgroundColor: area.color,
                                transformOrigin: 'bottom right',
                                clipPath: 'polygon(100% 100%, 0 100%, 100% 0)'
                            }}
                        >
                            <span className="absolute transform -rotate-45" style={{ bottom: '70%', right: '70%' }}>
                                {area.name}
                            </span>
                        </div>
                    </motion.div>
                );
            })}
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
    );
};

export default BalanceWheel; 