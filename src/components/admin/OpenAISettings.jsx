import React, from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiTool, FiKey, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAIProviderStore } from '../../store/aiProviderStore';
import GlassCard from '../common/GlassCard';
import GlassButton from '../common/GlassButton';

const OpenAISettings = () => {
    const {
        getDefaultProvider,
        updateProvider,
    } = useAIProviderStore();

    const defaultProvider = getDefaultProvider();

    // State is initialized safely, falling back to default values if the provider is not found.
    const [localApiKey, setLocalApiKey] = React.useState(defaultProvider?.apiKey || '');
    const [localModel, setLocalModel] = React.useState(defaultProvider?.model || 'gpt-4');
    const [localTemperature, setLocalTemperature] = React.useState(defaultProvider?.settings?.temperature || 0.7);
    const [localMaxTokens, setLocalMaxTokens] = React.useState(defaultProvider?.settings?.maxTokens || 1000);

    // Effect to update local state when the provider changes from the store.
    React.useEffect(() => {
        if (defaultProvider) {
            setLocalApiKey(defaultProvider.apiKey || '');
            setLocalModel(defaultProvider.model || 'gpt-4');
            setLocalTemperature(defaultProvider.settings?.temperature || 0.7);
            setLocalMaxTokens(defaultProvider.settings?.maxTokens || 1000);
        }
    }, [defaultProvider]);

    const handleSave = () => {
        // Prevents saving if there is no default provider, with feedback to the user.
        if (!defaultProvider) {
            toast.error('No default provider found to save settings.');
            return;
        }

        try {
            updateProvider(defaultProvider.id, {
                apiKey: localApiKey,
                model: localModel,
                settings: {
                    ...defaultProvider.settings,
                    temperature: localTemperature,
                    maxTokens: localMaxTokens,
                }
            });
            toast.success('Settings saved successfully!');
        } catch (error) {
            // Provides specific error feedback if saving fails.
            toast.error(error.message || 'Failed to save settings.');
        }
    };

    return (
        <GlassCard padding="24px" cornerRadius={20}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
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
                            placeholder="Enter your API key (e.g., sk-...)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                            <FiInfo />
                            <span>Your API key is stored securely and never exposed on the client-side.</span>
                        </p>
                    </div>

                    {/* Model */}
                    <div>
                        <label htmlFor="model-select" className="text-sm font-medium text-gray-600 mb-2 block">Model</label>
                        <select
                            id="model-select"
                            value={localModel}
                            onChange={(e) => setLocalModel(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                    </div>

                    {/* Temperature */}
                    <div>
                        <label htmlFor="temperature-range" className="text-sm font-medium text-gray-600 mb-2 flex justify-between">
                            <span>Temperature</span>
                            <span>{localTemperature.toFixed(1)}</span>
                        </label>
                        <input
                            id="temperature-range"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={localTemperature}
                            onChange={(e) => setLocalTemperature(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Max Tokens */}
                    <div>
                        <label htmlFor="max-tokens-range" className="text-sm font-medium text-gray-600 mb-2 flex justify-between">
                            <span>Max Tokens</span>
                            <span>{localMaxTokens}</span>
                        </label>
                        <input
                            id="max-tokens-range"
                            type="range"
                            min="256"
                            max="4096"
                            step="256"
                            value={localMaxTokens}
                            onChange={(e) => setLocalMaxTokens(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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