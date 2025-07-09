import React, { useState } from 'react';

const ProviderManagement = () => {
    // Mock data
    const [providers, setProviders] = useState([
        { id: 1, name: 'OpenAI', status: 'Active' },
        { id: 2, name: 'Anthropic', status: 'Inactive' },
        { id: 3, name: 'Google Gemini', status: 'Active' },
    ]);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">AI Provider Management</h2>
            <button className="px-4 py-2 bg-blue-500 text-white rounded mb-4">Add Provider</button>
            <ul>
                {providers.map(provider => (
                    <li key={provider.id} className="flex justify-between items-center p-2 border-b">
                        <span>{provider.name}</span>
                        <span>{provider.status}</span>
                        <div>
                            <button className="px-2 py-1 bg-gray-300 rounded mr-2">Configure</button>
                            <button className="px-2 py-1 bg-red-500 text-white rounded">Remove</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProviderManagement; 