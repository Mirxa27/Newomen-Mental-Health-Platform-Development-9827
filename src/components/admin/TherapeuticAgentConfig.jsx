import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSave, 
  FiX, 
  FiEye,
  FiToggleLeft,
  FiToggleRight,
  FiUser,
  FiHeart,
  FiCpu,
  FiTarget,
  FiSettings,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiMessageSquare,
  FiShield
} from 'react-icons/fi';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const TherapeuticAgentConfig = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [therapyTypes, setTherapyTypes] = useState([]);
  const [selectedTab, setSelectedTab] = useState('agents');

  // Therapeutic agent types and their configurations
  const agentTypes = [
    {
      id: 'cognitive_behavioral',
      name: 'Cognitive Behavioral Therapy (CBT)',
      icon: FiCpu,
      color: 'from-blue-400 to-cyan-500',
      description: 'Focuses on identifying and changing negative thought patterns and behaviors',
      techniques: ['Thought challenging', 'Behavioral activation', 'Exposure therapy', 'Cognitive restructuring']
    },
    {
      id: 'dialectical_behavioral',
      name: 'Dialectical Behavior Therapy (DBT)',
      icon: FiTarget,
      color: 'from-purple-400 to-pink-500',
      description: 'Combines CBT with mindfulness and emotion regulation techniques',
      techniques: ['Mindfulness', 'Distress tolerance', 'Emotion regulation', 'Interpersonal effectiveness']
    },
    {
      id: 'acceptance_commitment',
      name: 'Acceptance and Commitment Therapy (ACT)',
      icon: FiHeart,
      color: 'from-green-400 to-emerald-500',
      description: 'Focuses on accepting difficult thoughts and feelings while committing to valued actions',
      techniques: ['Mindfulness', 'Values clarification', 'Psychological flexibility', 'Committed action']
    },
    {
      id: 'solution_focused',
      name: 'Solution-Focused Brief Therapy (SFBT)',
      icon: FiTarget,
      color: 'from-orange-400 to-red-500',
      description: 'Emphasizes solutions and strengths rather than problems and weaknesses',
      techniques: ['Miracle question', 'Scaling questions', 'Exception finding', 'Goal setting']
    },
    {
      id: 'humanistic',
      name: 'Humanistic Therapy',
      icon: FiUser,
      color: 'from-teal-400 to-blue-500',
      description: 'Emphasizes human potential and self-actualization',
      techniques: ['Active listening', 'Unconditional positive regard', 'Empathy', 'Genuineness']
    },
    {
      id: 'mindfulness_based',
      name: 'Mindfulness-Based Therapy',
      icon: FiHeart,
      color: 'from-indigo-400 to-purple-500',
      description: 'Integrates mindfulness practices with therapeutic interventions',
      techniques: ['Meditation', 'Body awareness', 'Present moment focus', 'Non-judgmental awareness']
    }
  ];

  // Default agent configuration
  const defaultAgent = {
    name: '',
    type: 'cognitive_behavioral',
    description: '',
    isActive: true,
    personality: {
      tone: 'supportive',
      empathy_level: 'high',
      directness: 'moderate',
      formality: 'casual'
    },
    capabilities: {
      session_duration: 30,
      max_sessions_per_day: 5,
      specializations: [],
      crisis_support: false,
      group_therapy: false
    },
    therapy_settings: {
      primary_approach: '',
      secondary_approaches: [],
      intervention_style: 'collaborative',
      homework_assignments: true,
      progress_tracking: true
    },
    user_restrictions: {
      age_min: 18,
      age_max: 65,
      severity_levels: ['mild', 'moderate'],
      excluded_conditions: []
    }
  };

  const [formData, setFormData] = useState(defaultAgent);

  // Load agents and therapy types on component mount
  useEffect(() => {
    loadAgents();
    loadTherapyTypes();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - would be replaced with actual API call
      const mockAgents = [
        {
          id: 1,
          name: 'CBT Assistant',
          type: 'cognitive_behavioral',
          description: 'Specialized in cognitive behavioral therapy techniques',
          isActive: true,
          personality: {
            tone: 'supportive',
            empathy_level: 'high',
            directness: 'moderate',
            formality: 'casual'
          },
          capabilities: {
            session_duration: 30,
            max_sessions_per_day: 5,
            specializations: ['anxiety', 'depression'],
            crisis_support: false,
            group_therapy: false
          },
          therapy_settings: {
            primary_approach: 'cognitive_behavioral',
            secondary_approaches: ['mindfulness_based'],
            intervention_style: 'collaborative',
            homework_assignments: true,
            progress_tracking: true
          },
          user_restrictions: {
            age_min: 18,
            age_max: 65,
            severity_levels: ['mild', 'moderate'],
            excluded_conditions: []
          },
          usage_stats: {
            total_sessions: 156,
            active_users: 23,
            satisfaction_score: 4.6
          },
          created_at: '2024-01-15',
          updated_at: '2024-01-20'
        },
        {
          id: 2,
          name: 'DBT Companion',
          type: 'dialectical_behavioral',
          description: 'Focuses on emotional regulation and distress tolerance',
          isActive: true,
          personality: {
            tone: 'calm',
            empathy_level: 'very_high',
            directness: 'gentle',
            formality: 'casual'
          },
          capabilities: {
            session_duration: 45,
            max_sessions_per_day: 3,
            specializations: ['borderline_personality', 'emotional_regulation'],
            crisis_support: true,
            group_therapy: true
          },
          therapy_settings: {
            primary_approach: 'dialectical_behavioral',
            secondary_approaches: ['mindfulness_based'],
            intervention_style: 'directive',
            homework_assignments: true,
            progress_tracking: true
          },
          user_restrictions: {
            age_min: 16,
            age_max: 70,
            severity_levels: ['moderate', 'severe'],
            excluded_conditions: ['psychosis']
          },
          usage_stats: {
            total_sessions: 89,
            active_users: 15,
            satisfaction_score: 4.8
          },
          created_at: '2024-01-10',
          updated_at: '2024-01-18'
        }
      ];
      setAgents(mockAgents);
    } catch (error) {
      toast.error('Failed to load therapeutic agents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTherapyTypes = async () => {
    try {
      setTherapyTypes(agentTypes);
    } catch (error) {
      toast.error('Failed to load therapy types');
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      // Would make API call to create agent
      const newAgent = {
        ...formData,
        id: Date.now(),
        usage_stats: {
          total_sessions: 0,
          active_users: 0,
          satisfaction_score: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setAgents([...agents, newAgent]);
      setFormData(defaultAgent);
      setShowCreateForm(false);
      toast.success('Therapeutic agent created successfully');
    } catch (error) {
      toast.error('Failed to create therapeutic agent');
    }
  };

  const handleUpdateAgent = async (agentId, updates) => {
    try {
      const updatedAgents = agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, ...updates, updated_at: new Date().toISOString() }
          : agent
      );
      setAgents(updatedAgents);
      setEditingAgent(null);
      toast.success('Agent updated successfully');
    } catch (error) {
      toast.error('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      setAgents(agents.filter(agent => agent.id !== agentId));
      toast.success('Agent deleted successfully');
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };

  const handleToggleAgent = async (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    await handleUpdateAgent(agentId, { isActive: !agent.isActive });
  };

  const getAgentTypeInfo = (type) => {
    return agentTypes.find(t => t.id === type) || agentTypes[0];
  };

  const AgentForm = ({ agent, onSubmit, onCancel }) => {
    const [localFormData, setLocalFormData] = useState(agent || defaultAgent);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(localFormData);
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {agent ? 'Edit Therapeutic Agent' : 'Create New Therapeutic Agent'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={localFormData.name}
                    onChange={(e) => setLocalFormData({...localFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Therapy Type
                  </label>
                  <select
                    value={localFormData.type}
                    onChange={(e) => setLocalFormData({...localFormData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {agentTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={localFormData.description}
                  onChange={(e) => setLocalFormData({...localFormData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                  required
                />
              </div>
            </div>

            {/* Personality Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personality Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <select
                    value={localFormData.personality.tone}
                    onChange={(e) => setLocalFormData({
                      ...localFormData,
                      personality: {...localFormData.personality, tone: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="supportive">Supportive</option>
                    <option value="calm">Calm</option>
                    <option value="encouraging">Encouraging</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empathy Level
                  </label>
                  <select
                    value={localFormData.personality.empathy_level}
                    onChange={(e) => setLocalFormData({
                      ...localFormData,
                      personality: {...localFormData.personality, empathy_level: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Capabilities</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={localFormData.capabilities.session_duration}
                    onChange={(e) => setLocalFormData({
                      ...localFormData,
                      capabilities: {...localFormData.capabilities, session_duration: parseInt(e.target.value)}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="15"
                    max="90"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Sessions Per Day
                  </label>
                  <input
                    type="number"
                    value={localFormData.capabilities.max_sessions_per_day}
                    onChange={(e) => setLocalFormData({
                      ...localFormData,
                      capabilities: {...localFormData.capabilities, max_sessions_per_day: parseInt(e.target.value)}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="1"
                    max="20"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFormData.capabilities.crisis_support}
                    onChange={(e) => setLocalFormData({
                      ...localFormData,
                      capabilities: {...localFormData.capabilities, crisis_support: e.target.checked}
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Crisis Support</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFormData.capabilities.group_therapy}
                    onChange={(e) => setLocalFormData({
                      ...localFormData,
                      capabilities: {...localFormData.capabilities, group_therapy: e.target.checked}
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Group Therapy</span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                {agent ? 'Update Agent' : 'Create Agent'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Therapeutic Agents</h1>
          <p className="text-gray-600 mt-2">Configure and manage AI therapeutic agents</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Create Agent</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'agents', label: 'Agents', icon: FiCpu },
          { id: 'therapy_types', label: 'Therapy Types', icon: FiCpu },
          { id: 'settings', label: 'Global Settings', icon: FiSettings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTab === tab.id
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'agents' && (
          <motion.div
            key="agents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {agents.map(agent => {
                  const typeInfo = getAgentTypeInfo(agent.type);
                  const Icon = typeInfo.icon;
                  
                  return (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Header */}
                      <div className={`p-6 bg-gradient-to-r ${typeInfo.color} text-white`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-8 h-8" />
                            <div>
                              <h3 className="text-xl font-bold">{agent.name}</h3>
                              <p className="text-white/80">{typeInfo.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleAgent(agent.id)}
                            className="text-white hover:text-white/80 transition-colors"
                          >
                            {agent.isActive ? (
                              <FiToggleRight className="w-6 h-6" />
                            ) : (
                              <FiToggleLeft className="w-6 h-6" />
                            )}
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-white/90">
                          <div className="flex items-center space-x-1">
                            <FiMessageSquare className="w-4 h-4" />
                            <span>{agent.usage_stats.total_sessions} sessions</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiUser className="w-4 h-4" />
                            <span>{agent.usage_stats.active_users} users</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiCheck className="w-4 h-4" />
                            <span>{agent.usage_stats.satisfaction_score}/5</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <p className="text-gray-600 mb-4">{agent.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Session Duration:</span>
                            <span className="font-medium">{agent.capabilities.session_duration} min</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Max Sessions/Day:</span>
                            <span className="font-medium">{agent.capabilities.max_sessions_per_day}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Crisis Support:</span>
                            <span className={`font-medium ${agent.capabilities.crisis_support ? 'text-green-600' : 'text-gray-400'}`}>
                              {agent.capabilities.crisis_support ? 'Yes' : 'No'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Status:</span>
                            <span className={`font-medium ${agent.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {agent.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingAgent(agent)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'therapy_types' && (
          <motion.div
            key="therapy_types"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agentTypes.map(type => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${type.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{type.name}</h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{type.description}</p>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Techniques:</h4>
                      <ul className="space-y-1">
                        {type.techniques.map(technique => (
                          <li key={technique} className="text-sm text-gray-600 flex items-center">
                            <FiCheck className="w-3 h-3 text-green-500 mr-2" />
                            {technique}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {selectedTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Global Agent Settings</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Session Duration (minutes)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Concurrent Sessions
                    </label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Security Settings</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Require user authentication</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Log all conversations</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable content filtering</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Agent Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <AgentForm
            onSubmit={handleCreateAgent}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
        
        {editingAgent && (
          <AgentForm
            agent={editingAgent}
            onSubmit={(updatedAgent) => handleUpdateAgent(editingAgent.id, updatedAgent)}
            onCancel={() => setEditingAgent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TherapeuticAgentConfig;