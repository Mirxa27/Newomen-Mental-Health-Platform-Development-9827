import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useAIProviderStore } from '../store/aiProviderStore';
import VoiceInput from '../components/chat/VoiceInput';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import EmotionIndicator from '../components/chat/EmotionIndicator';
import RealtimeVoiceChat from '../components/chat/RealtimeVoiceChat';
import toast from 'react-hot-toast';

const { FiSend, FiMic, FiPlus, FiMoreHorizontal, FiPhone } = FiIcons;

const Chat = () => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showRealtimeVoice, setShowRealtimeVoice] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { 
    currentConversation, 
    conversations, 
    isLoading, 
    isTyping, 
    emotionState,
    addMessage, 
    createConversation, 
    selectConversation,
    setLoading,
    setTyping,
  } = useChatStore();
  const { subscription, deductMinutes } = useAuthStore();
  const { getDefaultProvider } = useAIProviderStore();

  useEffect(() => {
    if (!currentConversation && conversations.length === 0) {
      createConversation();
    }
  }, [currentConversation, conversations, createConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || isLoading) return;

    if (subscription.minutesRemaining <= 0) {
      toast.error('No minutes remaining. Please upgrade your subscription.');
      return;
    }
    
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
      emotion: emotionState,
    };
    
    addMessage(userMessage);
    setInputValue('');
    setLoading(true);
    setTyping(true);
    
    try {
      const aiContent = await generateAIResponse(message);

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        culturalContext: 'mena',
      };

      addMessage(aiResponse);

      // Deduct minutes based on message length
      const minutesUsed = Math.ceil(aiContent.length / 100);
      deductMinutes(minutesUsed);
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const generateAIResponse = async (userMessage) => {
    const systemPrompt = `You are Newomen, a compassionate AI companion for women's mental health and personal growth. Speak with warmth and cultural awareness using Arabic phrases like حبيبتي when appropriate.`;
    const provider = getDefaultProvider();
    const apiKey = provider?.apiKey || import.meta.env.VITE_OPENAI_API_KEY;
    const endpoint = provider?.endpoint || 'https://api.openai.com/v1';
    const model = provider?.model || 'gpt-4';
    const settings = provider?.settings || {};

    if (!apiKey) {
      throw new Error('Missing AI provider API key');
    }

    try {
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          max_tokens: settings.maxTokens || 150,
          temperature: settings.temperature ?? 0.7,
          top_p: settings.topP ?? 1,
          frequency_penalty: settings.frequencyPenalty ?? 0,
          presence_penalty: settings.presencePenalty ?? 0,
        }),
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('OpenAI request failed:', error);
      return 'Sorry, I had trouble responding right now.';
    }
  };

  const handleVoiceInput = (transcript) => {
    setInputValue(transcript);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleStartRealtimeVoice = () => {
    if (subscription.minutesRemaining <= 0) {
      toast.error('No minutes remaining. Please upgrade your subscription.');
      return;
    }
    
    setShowRealtimeVoice(true);
  };

  // Auto-resize textarea
  const autoResizeTextarea = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Background floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200/5 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-secondary-200/5 rounded-full float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent-200/5 rounded-full float-slow"></div>
      </div>
      
      {/* Header */}
      <div className="glass-navbar border-b border-white/20 p-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center animate-glow">
              <span className="text-white font-bold">N</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Newomen AI</h1>
              <p className="text-sm text-gray-600">Your compassionate companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <EmotionIndicator emotion={emotionState} />
            <div className="liquid-glass px-3 py-1 rounded-full text-xs md:text-sm text-gray-600 border border-white/20">
              {subscription.minutesRemaining} min left
            </div>
            <motion.button 
              onClick={handleStartRealtimeVoice}
              className="liquid-glass p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 rounded-lg hover:shadow-glow transition-all duration-300 border border-purple-200/50"
              title="Start Voice Chat"
              aria-label="Start Voice Chat"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiPhone} className="w-5 h-5" />
            </motion.button>
            <motion.button 
              className="liquid-glass p-2 hover:bg-white/20 rounded-lg transition-all duration-300 border border-white/20"
              aria-label="More options"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiMoreHorizontal} className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        <AnimatePresence>
          {currentConversation?.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-footer border-t border-white/20 p-3 md:p-4 relative z-10">
        <div className="flex items-end space-x-2 md:space-x-4">
          <motion.button 
            onClick={() => createConversation()}
            className="liquid-glass p-2 md:p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50/50 rounded-lg transition-all duration-300 border border-white/20"
            aria-label="New conversation"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5" />
          </motion.button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                autoResizeTextarea(e);
              }}
              onKeyPress={handleKeyPress}
              placeholder={t('chatPlaceholder')}
              className="glass-input w-full px-3 py-2 pr-10 rounded-xl md:rounded-2xl resize-none transition-all duration-300 text-gray-900 placeholder-gray-500"
              rows="1"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              aria-label="Message input"
            />
            <motion.button 
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${
                isVoiceMode ? 'text-primary-600 bg-primary-50/50' : 'text-gray-500 hover:text-primary-600'
              }`}
              aria-label="Toggle voice input"
              aria-pressed={isVoiceMode}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SafeIcon icon={FiMic} className="w-4 h-4" />
            </motion.button>
          </div>
          
          <motion.button 
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="liquid-glass p-2 md:p-3 bg-gradient-to-r from-primary-500/80 to-secondary-500/80 text-white rounded-lg hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-primary-200/50"
            aria-label="Send message"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiSend} className="w-5 h-5" />
          </motion.button>
        </div>
        
        <AnimatePresence>
          {isVoiceMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <VoiceInput onTranscript={handleVoiceInput} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Realtime Voice Chat */}
      <RealtimeVoiceChat 
        isOpen={showRealtimeVoice} 
        onClose={() => setShowRealtimeVoice(false)} 
      />
    </div>
  );
};

export default Chat;
