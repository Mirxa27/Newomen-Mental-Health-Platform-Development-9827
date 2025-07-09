import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiX, 
  FiSave, 
  FiSettings,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const AIProviderSettings = ({ provider, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    type: 'openai',
    apiKey: '',
    endpoint: '',
    model: '',
    voice: '',
    isDefault: false,
    settings: {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    }
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        type: provider.type || 'openai',
        apiKey: provider.apiKey || '',
        endpoint: provider.endpoint || '',
        model: provider.model || '',
        voice: provider.voice || '',
        isDefault: provider.isDefault || false,
        settings: {
          temperature: provider.settings?.temperature || 0.7,
          maxTokens: provider.settings?.maxTokens || 1000,
          topP: provider.settings?.topP || 1,
          frequencyPenalty: provider.settings?.frequencyPenalty || 0,
          presencePenalty: provider.settings?.presencePenalty || 0,
        }
      });
    } else {
      setFormData({
        name: '',
        type: 'openai',
        apiKey: '',
        endpoint: '',
        model: '',
        voice: '',
        isDefault: false,
        settings: {
          temperature: 0.7,
          maxTokens: 1000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
        }
      });
    }
  }, [provider]);

  useEffect(() => {
    const requiredFields = ['name', 'type', 'apiKey'];
    const isFormValid = requiredFields.every(field => formData[field] && formData[field].trim() !== '');
    setIsValid(isFormValid);
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onSave(formData);
    }
  };

  const providerTypes = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'azure', label: 'Azure OpenAI' },
    { value: 'huggingface', label: 'Hugging Face' },
    { value: 'custom', label: 'Custom API' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {provider ? 'Edit Provider' : 'Add New Provider'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="My OpenAI Provider"
                required
              />
            </div>

            {/* Provider Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {providerTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="sk-..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* API Endpoint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Endpoint
              </label>
              <input
                type="url"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://api.example.com/v1"
              />
            </div>
            
            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="gpt-4"
              />
            </div>
          </div>

          {/* Voice ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice ID (for voice features)
            </label>
            <input
              type="text"
              value={formData.voice}
              onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="alloy, echo, nova, etc."
            />
          </div>

          {/* Advanced Settings */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Model Settings</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {formData.settings?.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.settings?.temperature || 0.7}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, temperature: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={formData.settings?.maxTokens || 1000}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, maxTokens: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1"
                  max="4000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top P: {formData.settings?.topP}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.settings?.topP || 1}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, topP: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency Penalty: {formData.settings?.frequencyPenalty}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.settings?.frequencyPenalty || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, frequencyPenalty: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Default Provider */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
              Set as default provider
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              {isValid ? (
                <div className="flex items-center gap-2 text-green-600">
                  <FiCheck className="w-4 h-4" />
                  <span className="text-sm">Ready to save</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <FiAlertCircle className="w-4 h-4" />
                  <span className="text-sm">Please fill required fields</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                {provider ? 'Update' : 'Create'} Provider
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AIProviderSettings;
