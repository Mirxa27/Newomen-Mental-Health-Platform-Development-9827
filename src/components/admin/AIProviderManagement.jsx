import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiPlay, 
  FiPause,
  FiCheckCircle,
  FiXCircle,
  FiSettings,
  FiMic,
  FiVolume2,
  FiMessageCircle,
  FiActivity,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const AIProviderManagement = () => {
  const { t } = useTranslation();
  const [providers, setProviders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'REALTIME_VOICE',
    apiKey: '',
    apiUrl: '',
    model: '',
    voice: '',
    settings: {},
    isDefault: false,
  });

  const providerTypes = [
    { value: 'REALTIME_VOICE', label: 'Real-time Voice Chat', icon: FiMic },
    { value: 'TEXT_TO_SPEECH', label: 'Text to Speech', icon: FiVolume2 },
    { value: 'SPEECH_TO_TEXT', label: 'Speech to Text', icon: FiMic },
    { value: 'CHAT', label: 'Text Chat', icon: FiMessageCircle },
  ];

  const presetProviders = {
    'OpenAI Realtime': {
      type: 'REALTIME_VOICE',
      apiUrl: 'https://api.openai.com/v1/realtime',
      model: 'gpt-4o-realtime-preview-2024-12-17',
      voice: 'nova',
      settings: {
        temperature: 0.7,
        max_tokens: 500,
      },
    },
    'ElevenLabs': {
      type: 'TEXT_TO_SPEECH',
      apiUrl: 'https://api.elevenlabs.io/v1',
      model: 'eleven_multilingual_v2',
      voice: '21m00Tcm4TlvDq8ikWAM',
      settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true,
      },
    },
    'Google Speech': {
      type: 'SPEECH_TO_TEXT',
      apiUrl: 'https://speech.googleapis.com/v1',
      model: 'latest_long',
      settings: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        alternativeLanguageCodes: ['ar'],
      },
    },
    'Azure Speech': {
      type: 'TEXT_TO_SPEECH',
      apiUrl: 'https://eastus.tts.speech.microsoft.com',
      voice: 'en-US-AriaNeural',
      settings: {
        region: 'eastus',
        rate: 'medium',
        pitch: 'medium',
      },
    },
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/ai-providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      } else {
        toast.error('Failed to fetch AI providers');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Error fetching providers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingProvider 
        ? `/api/ai-providers/${editingProvider.id}`
        : '/api/ai-providers';
      
      const method = editingProvider ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchProviders();
        setShowForm(false);
        setEditingProvider(null);
        resetForm();
        toast.success(editingProvider ? 'Provider updated' : 'Provider created');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save provider');
      }
    } catch (error) {
      console.error('Error saving provider:', error);
      toast.error('Error saving provider');
    }
  };

  const handleEdit = (provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      apiKey: '', // Don't prefill API key for security
      apiUrl: provider.apiUrl || '',
      model: provider.model || '',
      voice: provider.voice || '',
      settings: provider.settings || {},
      isDefault: provider.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (providerId) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;

    try {
      const response = await fetch(`/api/ai-providers/${providerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        await fetchProviders();
        toast.success('Provider deleted');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete provider');
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('Error deleting provider');
    }
  };

  const testConnection = async (providerId) => {
    setTestingProvider(providerId);
    
    try {
      const response = await fetch(`/api/ai-providers/${providerId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Connection test successful');
      } else {
        toast.error(result.message || 'Connection test failed');
      }
      
      await fetchProviders(); // Refresh to get updated status
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Error testing connection');
    } finally {
      setTestingProvider(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'REALTIME_VOICE',
      apiKey: '',
      apiUrl: '',
      model: '',
      voice: '',
      settings: {},
      isDefault: false,
    });
  };

  const handlePresetSelect = (presetName) => {
    const preset = presetProviders[presetName];
    setFormData({
      ...formData,
      name: presetName,
      ...preset,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-500';
      case 'INACTIVE': return 'text-yellow-500';
      case 'ERROR': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return FiCheckCircle;
      case 'INACTIVE': return FiPause;
      case 'ERROR': return FiXCircle;
      default: return FiActivity;
    }
  };

  const getTypeIcon = (type) => {
    const typeConfig = providerTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : FiSettings;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Provider Management</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Provider
        </motion.button>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {providers.map((provider) => {
          const StatusIcon = getStatusIcon(provider.status);
          const TypeIcon = getTypeIcon(provider.type);
          
          return (
            <motion.div
              key={provider.id}
              layout
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <TypeIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                    <p className="text-sm text-gray-600">{provider.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-4 h-4 ${getStatusColor(provider.status)}`} />
                  {provider.isDefault && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {provider.model && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Model:</span>{' '}
                    <span className="text-gray-600">{provider.model}</span>
                  </div>
                )}
                {provider.voice && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Voice:</span>{' '}
                    <span className="text-gray-600">{provider.voice}</span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Usage:</span>{' '}
                  <span className="text-gray-600">{provider.usageCount || 0} times</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => testConnection(provider.id)}
                  disabled={testingProvider === provider.id}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <FiPlay className="w-3 h-3" />
                  {testingProvider === provider.id ? 'Testing...' : 'Test'}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(provider)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add/Edit Provider Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingProvider ? 'Edit Provider' : 'Add New Provider'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Quick Presets */}
                  {!editingProvider && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quick Setup
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(presetProviders).map((presetName) => (
                          <button
                            key={presetName}
                            type="button"
                            onClick={() => handlePresetSelect(presetName)}
                            className="p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
                          >
                            {presetName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Provider Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Provider Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {providerTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key *
                    </label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={editingProvider ? 'Leave blank to keep existing key' : 'Enter API key'}
                      required={!editingProvider}
                    />
                  </div>

                  {/* API URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API URL
                    </label>
                    <input
                      type="url"
                      value={formData.apiUrl}
                      onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://api.provider.com/v1"
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="gpt-4o-realtime-preview"
                    />
                  </div>

                  {/* Voice */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voice ID
                    </label>
                    <input
                      type="text"
                      value={formData.voice}
                      onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="nova, alloy, echo, etc."
                    />
                  </div>

                  {/* Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Settings (JSON)
                    </label>
                    <textarea
                      value={JSON.stringify(formData.settings, null, 2)}
                      onChange={(e) => {
                        try {
                          const settings = JSON.parse(e.target.value);
                          setFormData({ ...formData, settings });
                        } catch (error) {
                          // Invalid JSON, keep the raw value
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent h-24 font-mono text-sm"
                      placeholder='{"temperature": 0.7, "max_tokens": 500}'
                    />
                  </div>

                  {/* Default Provider */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                      Set as default provider for this type
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingProvider(null);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                      {editingProvider ? 'Update' : 'Create'} Provider
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIProviderManagement;