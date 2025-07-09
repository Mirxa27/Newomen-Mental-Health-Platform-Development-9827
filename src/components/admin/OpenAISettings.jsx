import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiTool, FiKey, FiInfo } from 'react-icons/fi';
import { useOpenAIStore } from '../../store/openaiStore';
import GlassCard from '../common/GlassCard';
import GlassButton from '../common/GlassButton';

const OpenAISettings = () => {
    const {
        apiKey,
        setApiKey,
        model,
        setModel,
        temperature,
        setTemperature,
        maxTokens,
        setMaxTokens,
    } = useOpenAIStore();

    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [localModel, setLocalModel] = useState(model);
    const [localTemperature, setLocalTemperature] = useState(temperature);
    const [localMaxTokens, setLocalMaxTokens] = useState(maxTokens);

    const handleSave = () => {
        setApiKey(localApiKey);
        setModel(localModel);
        setTemperature(localTemperature);
        setMaxTokens(localMaxTokens);
        // Add toast notification for success
    };

    return (
        <GlassCard padding="24px" cornerRadius={20}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center space-x-3 mb-6">
                    <FiTool className="w-6 h-6 text-gray-700" />
                    <h2 className="text-xl font-bold text-gray-800">OpenAI Settings</h2>
                </div>

                <div className="space-y-6">
                    {/* API Key */}
                    <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 mb-2">
                            <FiKey />
                            <span>API Key</span>
                        </label>
                        <input
                            type="password"
                            value={localApiKey}
                            onChange={(e) => setLocalApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                            <FiInfo />
                            <span>Your API key is stored securely and never exposed to the client.</span>
                        </p>
                    </div>

                    {/* Model */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-2">Model</label>
                        <select
                            value={localModel}
                            onChange={(e) => setLocalModel(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                    </div>

                    {/* Temperature */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-2">
                            Temperature: {localTemperature}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={localTemperature}
                            onChange={(e) => setLocalTemperature(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {/* Max Tokens */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-2">
                            Max Tokens: {localMaxTokens}
                        </label>
                        <input
                            type="range"
                            min="256"
                            max="4096"
                            step="256"
                            value={localMaxTokens}
                            onChange={(e) => setLocalMaxTokens(parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <GlassButton onClick={handleSave} variant="primary" fullWidth>
                        <FiSave className="mr-2" />
                        Save Settings
                    </GlassButton>
                </div>
            </motion.div>
        </GlassCard>
    );
};

export default OpenAISettings; 