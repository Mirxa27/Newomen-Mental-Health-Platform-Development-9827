import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiSend, 
  FiMic, 
  FiPlus, 
  FiMoreHorizontal, 
  FiPhone,
  FiSmile,
  FiPaperclip
} from 'react-icons/fi';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useAIProviderStore } from '../store/aiProviderStore';
import VoiceInput from '../components/chat/VoiceInput';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import EmotionIndicator from '../components/chat/EmotionIndicator';
import RealtimeVoiceChat from '../components/chat/RealtimeVoiceChat';
import toast from 'react-hot-toast';

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
      return data.choices?.[0]?.message?.content?.trim() || 'Sorry, I had trouble responding right now.';
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
    <div className="h-[calc(100dvh-5rem)] md:h-[calc(100vh-4rem)] flex flex-col relative">
      {/* Liquid decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 liquid-blob opacity-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 liquid-blob opacity-10" style={{ animationDelay: '2s' }} />
      
      {/* Header - Glassmorphic */}
      <div className="glass-nav border-b border-white/20 p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl blur-xl opacity-50"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Newomen AI</h1>
              <p className="text-sm text-gray-600">Your compassionate companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <EmotionIndicator emotion={emotionState} />
            <div className="glass px-3 py-1.5 rounded-full">
              <p className="text-xs md:text-sm font-medium bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {subscription.minutesRemaining} min
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRealtimeVoice}
              className="p-2.5 glass-button-primary rounded-xl"
              title="Start Voice Chat"
            >
              <FiPhone className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 glass rounded-xl hover:bg-glass-medium transition-all duration-300"
            >
              <FiMoreHorizontal className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages Container - Glassmorphic */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        <AnimatePresence>
          {currentConversation?.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Glassmorphic */}
      <div className="glass-nav border-t border-white/20 p-4 safe-area-bottom">
        <div className="flex items-end gap-2 md:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => createConversation()}
            className="p-3 glass rounded-xl hover:bg-glass-medium transition-all duration-300"
          >
            <FiPlus className="w-5 h-5 text-gray-700" />
          </motion.button>
          
          <div className="flex-1 relative">
            <div className="glass rounded-2xl p-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  autoResizeTextarea(e);
                }}
                onKeyPress={handleKeyPress}
                placeholder={t('chatPlaceholder')}
                className="w-full bg-transparent px-4 py-3 pr-24 outline-none resize-none text-gray-800 placeholder:text-gray-500"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-glass-medium transition-all duration-300"
                >
                  <FiPaperclip className="w-4 h-4 text-gray-500" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-glass-medium transition-all duration-300"
                >
                  <FiSmile className="w-4 h-4 text-gray-500" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isVoiceMode 
                      ? 'bg-primary-500/20 text-primary-600' 
                      : 'hover:bg-glass-medium text-gray-500'
                  }`}
                >
                  <FiMic className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 glass-button-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend className="w-5 h-5" />
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
              <div className="glass rounded-2xl p-4">
                <VoiceInput onTranscript={handleVoiceInput} />
              </div>
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
