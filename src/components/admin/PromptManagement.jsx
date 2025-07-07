import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiEdit, FiTrash2, FiSave, FiX } = FiIcons;

const PromptManagement = () => {
  const [prompts, setPrompts] = useState([
    {
      id: 1,
      name: 'Welcome Message',
      category: 'onboarding',
      content: 'مرحباً حبيبتي! Welcome to Newomen. I\'m here to support you on your journey of self-discovery and growth. How are you feeling today?',
      isActive: true,
      tags: ['welcome', 'onboarding', 'arabic'],
    },
    {
      id: 2,
      name: 'Shadow Work Introduction',
      category: 'shadow-work',
      content: 'Let\'s begin this beautiful journey of shadow work together. إن شاء الله, we\'ll discover the hidden treasures within you. Are you ready to explore the parts of yourself that have been waiting to be seen?',
      isActive: true,
      tags: ['shadow-work', 'introduction', 'arabic'],
    },
    {
      id: 3,
      name: 'Daily Check-in',
      category: 'daily-support',
      content: 'الحمد لله for this new day! How is your heart feeling today? What emotions are asking for your attention?',
      isActive: true,
      tags: ['daily', 'check-in', 'emotions'],
    },
  ]);

  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    name: '',
    category: '',
    content: '',
    tags: '',
  });

  const categories = [
    'onboarding',
    'shadow-work',
    'daily-support',
    'integration',
    'transformation',
    'cultural-context',
    'emergency-support',
  ];

  const handleSavePrompt = (prompt) => {
    if (editingPrompt) {
      setPrompts(prompts.map(p => p.id === editingPrompt.id ? { ...prompt, id: editingPrompt.id } : p));
      setEditingPrompt(null);
    } else {
      setPrompts([...prompts, { ...prompt, id: Date.now(), isActive: true }]);
      setShowAddForm(false);
      setNewPrompt({ name: '', category: '', content: '', tags: '' });
    }
  };

  const handleDeletePrompt = (id) => {
    setPrompts(prompts.filter(p => p.id !== id));
  };

  const togglePromptStatus = (id) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const PromptForm = ({ prompt, onSave, onCancel }) => {
    const [formData, setFormData] = useState(prompt || {
      name: '',
      category: '',
      content: '',
      tags: '',
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      onSave({ ...formData, tags: tagsArray });
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
          className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Name
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
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter the prompt content..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., welcome, onboarding, arabic"
              />
            </div>

            <div className="flex justify-end space-x-4">
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
                Save Prompt
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
          <h1 className="text-3xl font-bold text-gray-900">Prompt Management</h1>
          <p className="text-gray-600 mt-2">Manage AI conversation prompts and responses</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          <span>Add Prompt</span>
        </button>
      </div>

      {/* Prompts List */}
      <div className="grid gap-6">
        {prompts.map((prompt, index) => (
          <motion.div
            key={prompt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{prompt.name}</h3>
                  <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                    {prompt.category.replace('-', ' ')}
                  </span>
                  <button
                    onClick={() => togglePromptStatus(prompt.id)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      prompt.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {prompt.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {prompt.content}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setEditingPrompt(prompt)}
                  className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiEdit} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
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
    </div>
  );
};

export default PromptManagement;