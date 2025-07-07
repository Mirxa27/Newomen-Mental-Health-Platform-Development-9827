import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMessageCircle, FiUser, FiClock, FiFilter, FiEye, FiX } = FiIcons;

const ConversationMonitor = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

  const conversations = [
    {
      id: 1,
      user: 'Sarah Ahmed',
      title: 'Shadow Work Session',
      messageCount: 15,
      duration: '23 min',
      status: 'active',
      lastMessage: 'I feel like I\'m finally understanding my patterns...',
      timestamp: '2024-01-20 14:30',
      emotion: 'reflective',
    },
    {
      id: 2,
      user: 'Fatima Al-Zahra',
      title: 'Daily Check-in',
      messageCount: 8,
      duration: '12 min',
      status: 'completed',
      lastMessage: 'Thank you for helping me process this, حبيبتي',
      timestamp: '2024-01-20 13:45',
      emotion: 'grateful',
    },
    {
      id: 3,
      user: 'Aisha Mohammad',
      title: 'Integration Session',
      messageCount: 22,
      duration: '35 min',
      status: 'active',
      lastMessage: 'This insight about my relationship patterns is profound',
      timestamp: '2024-01-20 15:20',
      emotion: 'insightful',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmotionColor = (emotion) => {
    switch (emotion) {
      case 'reflective': return 'bg-purple-100 text-purple-800';
      case 'grateful': return 'bg-green-100 text-green-800';
      case 'insightful': return 'bg-blue-100 text-blue-800';
      case 'sad': return 'bg-gray-100 text-gray-800';
      case 'happy': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Conversation Monitor</h1>
        <p className="text-gray-600 mt-2">Monitor real-time conversations and AI interactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center">
            <SafeIcon icon={FiMessageCircle} className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Conversations</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center">
            <SafeIcon icon={FiUser} className="w-8 h-8 text-secondary-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Users Online</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center">
            <SafeIcon icon={FiClock} className="w-8 h-8 text-accent-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">18m</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <div className="flex items-center">
            <SafeIcon icon={FiFilter} className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Flagged</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Conversations</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {conversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiUser} className="w-5 h-5 text-white" />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{conversation.user}</h4>
                    <p className="text-sm text-gray-600">{conversation.title}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(conversation.status)}`}>
                        {conversation.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEmotionColor(conversation.emotion)}`}>
                        {conversation.emotion}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {conversation.messageCount} messages • {conversation.duration}
                    </p>
                  </div>
                  
                  <button className="text-primary-600 hover:text-primary-800">
                    <SafeIcon icon={FiEye} className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-700 italic">
                  "{conversation.lastMessage}"
                </p>
                <p className="text-xs text-gray-500 mt-1">{conversation.timestamp}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedConversation(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Conversation Details
              </h3>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">User</p>
                  <p className="font-medium text-gray-900">{selectedConversation.user}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">{selectedConversation.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Messages</p>
                  <p className="font-medium text-gray-900">{selectedConversation.messageCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Emotion</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEmotionColor(selectedConversation.emotion)}`}>
                    {selectedConversation.emotion}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Last Message</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900 italic">
                    "{selectedConversation.lastMessage}"
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ConversationMonitor;