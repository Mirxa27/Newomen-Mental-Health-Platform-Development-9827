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
import AdvancedVoiceChat from '../components/chat/AdvancedVoiceChat';
import toast from 'react-hot-toast';

const Chat = () => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showRealtimeVoice, setShowRealtimeVoice] = useState(false);
  const [showAdvancedVoice, setShowAdvancedVoice] = useState(false);
  const [headline, setHeadline] = useState('');
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
    setLoading,
    setTyping,
  } = useChatStore();
  
  const { subscription, deductMinutes } = useAuthStore();
  const { getDefaultProvider } = useAIProviderStore();

  useEffect(() => {
    // If there's no active conversation, create a new one.
    if (!currentConversation && conversations.length === 0) {
      createConversation();
    }
    generateHeadline();
  }, [currentConversation, conversations, createConversation]);

  const generateHeadline = async () => {
    // First, set a random optimistic headline
    const optimisticHeadlines = [
      'A safe space for your thoughts.',
      'Your journey to clarity starts here.',
      'Unlock your inner strength.',
      'Connect with your authentic self.',
    ];
    setHeadline(optimisticHeadlines[Math.floor(Math.random() * optimisticHeadlines.length)]);

    try {
      const provider = getDefaultProvider();
      const apiKey = provider?.apiKey || import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) return; // Silently fail if no key

      const response = await fetch(provider.endpoint || 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: "Generate a short, welcoming, and inspiring headline (under 40 characters) for a mental health chat app for women. It should feel personal and empowering. Examples: 'Speak your truth today', 'A new chapter awaits', 'Your safe space to grow'." }],
          max_tokens: 20,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const generatedHeadline = data.choices?.[0]?.message?.content?.trim().replace(/"/g, '');
        if (generatedHeadline) {
          setHeadline(generatedHeadline);
        }
      }
    } catch (error) {
      console.error("Failed to generate AI headline:", error);
      // The optimistic headline will remain
    }
  };

  useEffect(() => {
    // Automatically scroll to the latest message.
    scrollToBottom();
  }, [currentConversation?.messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageContent) => {
    const content = messageContent.trim();
    if (!content || isLoading) return;

    if (subscription.minutesRemaining <= 0) {
      toast.error('No minutes remaining. Please upgrade your subscription.');
      return;
    }
    
    const userMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      emotion: emotionState,
    };
    
    addMessage(userMessage);
    setInputValue('');
    setLoading(true);
    setTyping(true);
    
    try {
      const aiContent = await generateAIResponse(content);
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        culturalContext: 'mena',
      };
      addMessage(aiResponse);
      // Deduct minutes based on the length of the AI's response
      const minutesUsed = Math.ceil(aiContent.length / 150); // Example: 1 min per 150 chars
      deductMinutes(minutesUsed);
    } catch (error) {
      console.error("Message sending failed:", error);
      toast.error('Failed to get a response. Please try again.');
      // Optional: Add a local error message to the chat
      addMessage({
        id: 'error-' + Date.now(),
        content: 'Sorry, I couldn\'t process that. Please check your connection and try again.',
        sender: 'system',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const generateAIResponse = async (userMessage) => {
    const systemPrompt = `You are Newomen, a compassionate AI companion for women's mental health and personal growth. Speak with warmth and cultural awareness using Arabic phrases like حبيبتي when appropriate.`;
    const provider = getDefaultProvider();
    const apiKey = provider?.apiKey || import.meta.env.VITE_OPENAI_API_KEY;
    const endpoint = provider?.endpoint || 'https://api.openai.com/v1/chat/completions';
    const model = provider?.model || 'gpt-4';
    const settings = provider?.settings || {};

    if (!apiKey) {
      throw new Error('Missing AI provider API key');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...currentConversation.messages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content })),
          { role: 'user', content: userMessage },
        ],
        max_tokens: settings.maxTokens || 250,
        temperature: settings.temperature ?? 0.7,
        top_p: settings.topP ?? 1,
        frequency_penalty: settings.frequencyPenalty ?? 0,
        presence_penalty: settings.presencePenalty ?? 0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || 'Sorry, I had trouble responding right now.';
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

  const handleStartAdvancedVoice = () => {
    if (subscription.minutesRemaining <= 0) {
      toast.error('No minutes remaining. Please upgrade your subscription.');
      return;
    }
    setShowAdvancedVoice(true);
  };

  const autoResizeTextarea = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    // Set a max height (e.g., 120px)
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <div className="h-[calc(100dvh-5rem)] md:h-full flex flex-col bg-gray-900/50 text-white">
      {/* Header */}
      <div className="p-4 z-10 bg-slate-900/50 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">{headline}</h1>
              <p className="text-sm text-gray-400">Your compassionate companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-3">
            <EmotionIndicator emotion={emotionState} />
            <div className="hidden md:flex px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
              <p className="text-xs md:text-sm font-medium text-white">
                {subscription.minutesRemaining} min
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRealtimeVoice}
              className="hidden md:inline-flex items-center justify-center px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-full text-white font-medium transition-colors"
              title="Start Voice Chat"
            >
              <FiPhone className="w-5 h-5 mr-2" /> Start Call
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleStartAdvancedVoice} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors" title="Advanced Voice Chat">
              <FiMic className="w-5 h-5" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <FiMoreHorizontal className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {currentConversation?.messages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Call To Action / Input Area */}
      <div className="p-4 bg-slate-900/50 backdrop-blur-lg border-t border-white/10" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        {/* Full-width Call Button for Mobile */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleStartRealtimeVoice}
          className="md:hidden w-full flex items-center justify-center gap-3 px-4 py-3 mb-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 rounded-xl text-white font-semibold text-lg transition-all shadow-lg"
          title="Start Voice Chat"
        >
          <FiPhone className="w-6 h-6" />
          <span>Start Voice Call</span>
          <span className="text-sm opacity-80">({subscription.minutesRemaining} min left)</span>
        </motion.button>

        {/* Text Input Area */}
        <div className="flex items-end gap-2 md:gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => createConversation()} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors self-end mb-1">
            <FiPlus className="w-5 h-5" />
          </motion.button>
          
          <div className="flex-1 relative bg-white/5 rounded-2xl border border-white/10 focus-within:border-primary-500/50 transition-colors">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                autoResizeTextarea(e);
              }}
              onKeyDown={handleKeyPress}
              placeholder={t('chatPlaceholder')}
              className="w-full bg-transparent px-4 py-3 pr-28 text-white placeholder:text-gray-400 resize-none outline-none"
              rows="1"
              style={{ minHeight: '50px' }}
            />
            <div className="absolute right-2 bottom-2 flex items-center">
              <motion.button whileTap={{ scale: 0.9 }} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                <FiPaperclip className="w-5 h-5" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsVoiceMode(!isVoiceMode)} className={`p-2 rounded-full transition-colors ${isVoiceMode ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                <FiMic className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-primary-500 hover:bg-primary-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-500 transition-colors self-end mb-1"
          >
            <FiSend className="w-5 h-5 text-white" />
          </motion.button>
        </div>
        
        <AnimatePresence>
          {isVoiceMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <VoiceInput onTranscript={(t) => setInputValue(t)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RealtimeVoiceChat isOpen={showRealtimeVoice} onClose={() => setShowRealtimeVoice(false)} />
      
      {/* Advanced Voice Chat Modal */}
      <AnimatePresence>
        {showAdvancedVoice && (
          <AdvancedVoiceChat 
            conversationId={currentConversation?.id}
            onClose={() => setShowAdvancedVoice(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;