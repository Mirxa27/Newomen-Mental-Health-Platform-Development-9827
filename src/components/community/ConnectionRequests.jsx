import React from 'react';

const ConnectionRequests = () => {
    // Mock data
    const requests = [
        { id: 1, name: 'UserA' },
        { id: 2, name: 'UserB' },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold">Connection Requests</h2>
            <ul className="mt-4">
                {requests.map(req => (
                    <li key={req.id} className="flex justify-between items-center p-2 border-b">
                        <span>{req.name}</span>
                        <div>
                            <button className="px-2 py-1 bg-green-500 text-white rounded mr-2">Accept</button>
                            <button className="px-2 py-1 bg-red-500 text-white rounded">Decline</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConnectionRequests; 