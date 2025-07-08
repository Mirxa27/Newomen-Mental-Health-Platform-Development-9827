import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { usePromptStore } from '../../store/promptStore';
import toast from 'react-hot-toast';

const { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiRefreshCw, FiEye, FiCode, FiSearch, FiFilter, FiPhone, FiAlertTriangle } = FiIcons;

const PromptManagement = () => {
  const {
    prompts,
    systemPrompt,
    addPrompt,
    updatePrompt,
    deletePrompt,
    togglePromptStatus,
    generateSystemPrompt,
  } = usePromptStore();

  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'all',
    'onboarding',
    'shadow-work',
    'daily-support',
    'integration',
    'transformation',
    'cultural-context',
    'emergency-support',
    'voice-interaction',
    'professional',
  ];

  const categoryLabels = {
    'all': 'All Categories',
    'onboarding': 'Onboarding',
    'shadow-work': 'Shadow Work',
    'daily-support': 'Daily Support',
    'integration': 'Integration',
    'transformation': 'Transformation',
    'cultural-context': 'Cultural Context',
    'emergency-support': 'Emergency Support',
    'voice-interaction': 'Voice Interaction',
    'professional': 'Professional Boundaries',
  };

  // Initialize system prompt on mount
  useEffect(() => {
    generateSystemPrompt();
  }, [generateSystemPrompt]);

  // Filter prompts based on category and search
  const filteredPrompts = prompts.filter(prompt => {
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesCategory && matchesSearch;
  });

  const handleSavePrompt = (promptData) => {
    try {
      if (editingPrompt) {
        updatePrompt(editingPrompt.id, promptData);
        toast.success('Prompt updated successfully');
        setEditingPrompt(null);
      } else {
        addPrompt(promptData);
        toast.success('Prompt added successfully');
        setShowAddForm(false);
      }
    } catch (error) {
      toast.error('Failed to save prompt');
      console.error('Error saving prompt:', error);
    }
  };

  const handleDeletePrompt = (id) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        deletePrompt(id);
        toast.success('Prompt deleted successfully');
      } catch (error) {
        toast.error('Failed to delete prompt');
        console.error('Error deleting prompt:', error);
      }
    }
  };

  const handleToggleStatus = (id) => {
    try {
      togglePromptStatus(id);
      toast.success('Prompt status updated');
    } catch (error) {
      toast.error('Failed to update prompt status');
      console.error('Error toggling prompt status:', error);
    }
  };

  const handleRegenerateSystemPrompt = () => {
    try {
      generateSystemPrompt();
      toast.success('System prompt regenerated');
    } catch (error) {
      toast.error('Failed to regenerate system prompt');
      console.error('Error regenerating system prompt:', error);
    }
  };

  const PromptForm = ({ prompt, onSave, onCancel }) => {
    const [formData, setFormData] = useState(prompt || {
      name: '',
      category: '',
      content: '',
      tags: '',
      priority: 5,
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const tagsArray = typeof formData.tags === 'string' 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : formData.tags || [];
      
      onSave({ 
        ...formData, 
        tags: tagsArray,
        priority: parseInt(formData.priority) || 5,
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {prompt ? 'Edit Prompt' : 'Add New Prompt'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt Name *
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
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>
                      {categoryLabels[category]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter the prompt content that will guide the AI's responses..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This content will be incorporated into the AI's system instructions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., welcome, onboarding, arabic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority || 5}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers = higher priority in system prompt
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>Save Prompt</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const SystemPromptModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Generated System Prompt
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {systemPrompt}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompt Management</h1>
          <p className="text-gray-600 mt-2">Manage AI conversation prompts for realtime voice therapy</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRegenerateSystemPrompt}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
            <span>Regenerate</span>
          </button>
          <button
            onClick={() => setShowSystemPrompt(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiEye} className="w-4 h-4" />
            <span>View System Prompt</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Prompt</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="min-w-[200px]">
            <div className="relative">
              <SafeIcon icon={FiFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Prompts List */}
      <div className="grid gap-6">
        <AnimatePresence>
          {filteredPrompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{prompt.name}</h3>
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs rounded-full font-medium">
                      {categoryLabels[prompt.category] || prompt.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      Priority: {prompt.priority}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(prompt.id)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors font-medium ${
                        prompt.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {prompt.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {prompt.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags && prompt.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={() => setEditingPrompt(prompt)}
                    className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit prompt"
                  >
                    <SafeIcon icon={FiEdit} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(prompt.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete prompt"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <SafeIcon icon={FiCode} className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first prompt'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <PromptForm
          onSave={handleSavePrompt}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingPrompt && (
        <PromptForm
          prompt={editingPrompt}
          onSave={handleSavePrompt}
          onCancel={() => setEditingPrompt(null)}
        />
      )}

      {/* System Prompt Modal */}
      <SystemPromptModal 
        isOpen={showSystemPrompt} 
        onClose={() => setShowSystemPrompt(false)} 
      />

      {/* Realtime Conversation Configuration */}
      <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <SafeIcon icon={FiPhone} className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Realtime Voice Conversation Settings
            </h3>
            <p className="text-sm text-gray-600">
              Configure how the AI behaves in realtime voice conversations
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Voice Interaction Prompts</h4>
            <p className="text-sm text-gray-600 mb-2">
              {prompts.filter(p => p.category === 'voice-interaction' && p.isActive).length} active
            </p>
            <button
              onClick={() => setSelectedCategory('voice-interaction')}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Manage Voice Prompts →
            </button>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Crisis Detection Protocols</h4>
            <p className="text-sm text-gray-600 mb-2">
              {prompts.filter(p => p.category === 'emergency-support' && p.isActive).length} active
            </p>
            <button
              onClick={() => setSelectedCategory('emergency-support')}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Manage Crisis Protocols →
            </button>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Critical Notice</h4>
              <p className="text-sm text-yellow-700">
                Realtime voice conversations strictly follow admin-defined prompts. Ensure crisis protocols, 
                cultural sensitivity guidelines, and therapeutic boundaries are properly configured before 
                enabling voice features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptManagement;