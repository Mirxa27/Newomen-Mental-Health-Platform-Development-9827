import React from 'react';

const SupportCircles = () => {
    // Mock data
    const circles = [
        { id: 1, name: 'Mindfulness Journey' },
        { id: 2, name: 'Healing Connections' },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold">Anonymous Support Circles</h2>
            <ul className="mt-4">
                {circles.map(circle => (
                    <li key={circle.id} className="p-2 border-b">
                        {circle.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SupportCircles; 