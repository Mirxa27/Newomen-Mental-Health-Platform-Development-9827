import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import { useAIProviderStore } from '../../store/aiProviderStore';

const { FiSettings, FiSave, FiEye, FiEyeOff, FiCheck, FiX, FiPlus, FiTrash2 } = FiIcons;

const AIProviderSettings = () => {
  const {
    providers,
    addProvider,
    updateProvider,
    deleteProvider,
    setDefaultProvider,
    toggleActive,
  } = useAIProviderStore();
  const [showApiKeys, setShowApiKeys] = useState({});
  const [editingProvider, setEditingProvider] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const providerTypes = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'azure', label: 'Azure OpenAI' },
    { value: 'google', label: 'Google AI' },
    { value: 'custom', label: 'Custom Provider' }
  ];

  const handleSaveProvider = (providerData) => {
    if (editingProvider) {
      updateProvider(editingProvider.id, providerData);
      setEditingProvider(null);
    } else {
      addProvider({ ...providerData, id: Date.now().toString() });
      setShowAddForm(false);
    }
    toast.success('Provider settings saved successfully');
  };

  const handleDeleteProvider = (id) => {
    if (providers.find(p => p.id === id)?.isDefault) {
      toast.error('Cannot delete the default provider');
      return;
    }
    deleteProvider(id);
    toast.success('Provider deleted successfully');
  };

  const handleSetDefault = (id) => {
    setDefaultProvider(id);
    toast.success('Default provider updated');
  };

  const handleToggleActive = (id) => {
    const provider = providers.find(p => p.id === id);
    if (provider?.isDefault && provider?.isActive) {
      toast.error('Cannot deactivate the default provider');
      return;
    }
    toggleActive(id);
  };

  const testConnection = async (provider) => {
    toast.loading('Testing connection...');
    try {
      const response = await fetch(`${provider.endpoint}/models`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.apiKey}`,
        },
      });
      toast.dismiss();

      if (response.ok) {
        toast.success('Connection successful');
      } else {
        toast.error('Connection failed');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Connection failed');
    }
  };

  const ProviderForm = ({ provider, onSave, onCancel }) => {
    const [formData, setFormData] = useState(provider || {
      name: '',
      type: 'openai',
      apiKey: '',
      endpoint: '',
      model: '',
      isActive: true,
      isDefault: false,
      settings: {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
      }
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

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
              className="text-gray-500 hover:text-gray-700"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {providerTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter API key..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  required
                />
              </div>
              
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
                  required
                />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Model Settings</h4>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                Active
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="mr-2"
                />
                Set as Default
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Save Provider
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Provider Settings</h1>
          <p className="text-gray-600 mt-2">Manage AI providers and their configurations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          <span>Add Provider</span>
        </button>
      </div>

      {/* Providers List */}
      <div className="grid gap-6">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                    {provider.type}
                  </span>
                  {provider.isDefault && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Default
                    </span>
                  )}
                  <button
                    onClick={() => handleToggleActive(provider.id)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      provider.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {provider.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Endpoint:</span> {provider.endpoint}
                  </div>
                  <div>
                    <span className="font-medium">Model:</span> {provider.model}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">API Key:</span>
                    <span>
                      {showApiKeys[provider.id] ? provider.apiKey : '••••••••••••••••'}
                    </span>
                    <button
                      onClick={() => setShowApiKeys({
                        ...showApiKeys,
                        [provider.id]: !showApiKeys[provider.id]
                      })}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <SafeIcon 
                        icon={showApiKeys[provider.id] ? FiEyeOff : FiEye} 
                        className="w-4 h-4" 
                      />
                    </button>
                  </div>
                  <div>
                    <span className="font-medium">Temperature:</span> {provider.settings?.temperature}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => testConnection(provider)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Test Connection"
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                </button>
                
                {!provider.isDefault && (
                  <button
                    onClick={() => handleSetDefault(provider.id)}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                    title="Set as Default"
                  >
                    <SafeIcon icon={FiSettings} className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => setEditingProvider(provider)}
                  className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Edit Provider"
                >
                  <SafeIcon icon={FiSettings} className="w-4 h-4" />
                </button>
                
                {!provider.isDefault && (
                  <button
                    onClick={() => handleDeleteProvider(provider.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Provider"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <ProviderForm
          onSave={handleSaveProvider}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingProvider && (
        <ProviderForm
          provider={editingProvider}
          onSave={handleSaveProvider}
          onCancel={() => setEditingProvider(null)}
        />
      )}
    </div>
  );
};

export default AIProviderSettings;