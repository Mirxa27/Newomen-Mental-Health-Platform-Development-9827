import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  FiMessageSquare, 
  FiSidebar, 
  FiSend, 
  FiPhone, 
  FiPlus, 
  FiMoreVertical, 
  FiTrash2,
  FiMic,
  FiMoreHorizontal,
  FiPaperclip
} from 'react-icons/fi';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import EmotionIndicator from '../components/chat/EmotionIndicator';
import RealtimeVoiceChat from '../components/chat/RealtimeVoiceChat';
import VoiceAgentIntegration from '../components/chat/VoiceAgentIntegration';
import NewomenLogo from '../components/common/NewomenLogo';
import useSocket from '../hooks/useSocket';
import VoiceAgent from '../components/chat/VoiceAgent';
import { sendMessageStream } from '../services/chat';
import { useAIProviderStore } from '../store/aiProviderStore';
import toast from 'react-hot-toast';

const ChatSidebar = ({
  conversations,
  currentConversation,
  onSelect,
  onCreate,
  onDelete,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200/80 flex items-center justify-between">
        <NewomenLogo />
        <button onClick={onCreate} className="p-2 rounded-lg hover:bg-gray-200/50">
          <FiPlus size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(convo => (
          <div
            key={convo.id}
            onClick={() => onSelect(convo.id)}
            className={`p-4 m-2 rounded-lg cursor-pointer transition-colors duration-200 flex justify-between items-center ${
              currentConversation?.id === convo.id ? 'bg-primary-100/50' : 'hover:bg-gray-100/70'
            }`}
          >
            <span className="font-medium text-sm text-gray-700 truncate">{convo.title}</span>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onDelete(convo.id); 
              }} 
              className="p-1 text-gray-400 hover:text-red-500 rounded-full"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Chat = () => {
  const { t } = useTranslation();
  
  // UI State
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [headline, setHeadline] = useState('');
  
  // Voice Agent States
  const [showRealtimeVoice, setShowRealtimeVoice] = useState(false);
  const [showWebRTCVoice, setShowWebRTCVoice] = useState(false);
  const [isVoiceAgentActive, setIsVoiceAgentActive] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Store hooks
  const {
    conversations,
    currentConversation,
    isLoading,
    isTyping,
    emotionState,
    addMessage,
    createConversation,
    setLoading,
    setTyping,
    updateLastMessageContent,
    fetchConversations,
    selectConversation,
    sendMessage: sendStoreMessage,
    deleteConversation
  } = useChatStore();
  
  const { subscription, deductMinutes } = useAuthStore();
  const { getDefaultProvider } = useAIProviderStore();
  const { joinConversation, leaveConversation, emitTyping } = useSocket();

  // Effects
  useEffect(() => {
    fetchConversations();
    if (!currentConversation && conversations.length === 0) {
      createConversation();
    }
    generateHeadline();
  }, [fetchConversations, currentConversation, conversations, createConversation]);

  useEffect(() => {
    if (currentConversation) {
      joinConversation(currentConversation.id);
    }
    return () => {
      if (currentConversation) {
        leaveConversation(currentConversation.id);
      }
    };
  }, [currentConversation, joinConversation, leaveConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, isTyping]);

  // Generate dynamic headline
  const generateHeadline = async () => {
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
      if (!apiKey) return;

      const response = await fetch(provider.endpoint || 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model || 'gpt-3.5-turbo',
          messages: [{ 
            role: 'user', 
            content: "Generate a short, welcoming, and inspiring headline (under 40 characters) for a mental health chat app for women. It should feel personal and empowering." 
          }],
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
    }
  };

  // Message handling
  const handleSendMessage = async (messageContent) => {
    const content = messageContent || inputValue || message;
    if (!content.trim() || isLoading) return;

    if (subscription.minutesRemaining <= 0) {
      toast.error('No minutes remaining. Please upgrade your subscription.');
      return;
    }

    if (!currentConversation) {
      await handleCreateConversation();
    }
    
    const userMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      emotion: emotionState,
    };
    
    addMessage(userMessage);
    setInputValue('');
    setMessage('');
    setLoading(true);
    setTyping(true);
    
    try {
      const aiMessageId = 'ai-' + Date.now();
      addMessage({
        id: aiMessageId,
        content: '',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        culturalContext: 'mena',
      });

      let fullContent = '';
      await sendMessageStream(content, currentConversation.id, (data) => {
        const chunk = data.chunk || data.choices?.[0]?.delta?.content || '';
        fullContent += chunk;
        updateLastMessageContent(currentConversation.id, aiMessageId, chunk);
      });

      const minutesUsed = Math.ceil(fullContent.length / 150);
      deductMinutes(minutesUsed);
      
    } catch (error) {
      console.error("Message sending failed:", error);
      toast.error('Failed to get a response. Please try again.');
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

  const handleCreateConversation = async () => {
    const newConversation = await createConversation('New Chat', 'Hello!');
    if (newConversation) {
      selectConversation(newConversation.id);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voice handlers
  const handleStartRealtimeVoice = () => {
    if (subscription.minutesRemaining <= 0) {
      toast.error('No minutes remaining. Please upgrade your subscription.');
      return;
    }
    setShowRealtimeVoice(true);
  };

  const handleStartWebRTCVoice = () => {
    if (subscription.minutesRemaining <= 0) {
      toast.error('No minutes remaining. Please upgrade your subscription.');
      return;
    }
    setShowWebRTCVoice(true);
  };

  const handleToggleVoiceAgent = () => {
    if (!currentConversation) {
      toast.error("Please select or start a conversation first.");
      return;
    }
    setIsVoiceAgentActive(prev => !prev);
  };

  const autoResizeTextarea = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-80 bg-white/70 backdrop-blur-lg border-r border-gray-200/80 flex flex-col"
          >
            <ChatSidebar
              conversations={conversations}
              currentConversation={currentConversation}
              onSelect={selectConversation}
              onCreate={handleCreateConversation}
              onDelete={deleteConversation}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col transition-all duration-300">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 p-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-gray-200 rounded-full"
            >
              <FiSidebar />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {currentConversation?.title || headline}
              </h2>
              <p className="text-sm text-gray-500">Your compassionate companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <EmotionIndicator emotion={emotionState} />
            <div className="hidden md:flex px-3 py-1.5 rounded-full bg-primary-100 border border-primary-200">
              <p className="text-xs md:text-sm font-medium text-primary-700">
                {subscription.minutesRemaining} min
              </p>
            </div>
            
            {/* Voice Controls */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRealtimeVoice}
              className="hidden md:inline-flex items-center justify-center px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-full text-white font-medium transition-colors"
              title="Start Voice Chat"
            >
              <FiPhone className="w-4 h-4 mr-2" />
              Start Call
            </motion.button>
            
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={handleStartWebRTCVoice} 
              className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors" 
              title="WebRTC Voice Chat"
            >
              <FiMic className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleVoiceAgent}
              className={`p-3 rounded-full transition-colors duration-300 ${
                isVoiceAgentActive ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
              }`}
              aria-label={isVoiceAgentActive ? "End Voice Call" : "Start Voice Call"}
            >
              <FiPhone size={20} />
            </motion.button>
            
            <button className="p-2 hover:bg-gray-200 rounded-full">
              <FiMoreVertical />
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && !currentConversation && (
            <div className="text-center text-gray-500">Loading conversations...</div>
          )}
          
          {currentConversation ? (
            <AnimatePresence initial={false}>
              {currentConversation.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -50 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <MessageBubble message={msg} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            !isLoading && (
              <div className="text-center text-gray-500 pt-10">
                Select or create a conversation to begin.
              </div>
            )
          )}
          
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/80">
          {/* Mobile Voice Button */}
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

          {/* Input Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue || message}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputValue(value);
                  setMessage(value);
                  autoResizeTextarea(e);
                  if (currentConversation) {
                    emitTyping(currentConversation.id, value.length > 0);
                  }
                }}
                onKeyDown={handleKeyPress}
                placeholder={t('chatPlaceholder') || "Type your message..."}
                className="w-full p-3 pr-12 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-500 resize-none outline-none"
                rows="1"
                disabled={!currentConversation}
                style={{ minHeight: '48px' }}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <motion.button 
                  type="button"
                  whileTap={{ scale: 0.9 }} 
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiPaperclip className="w-4 h-4" />
                </motion.button>
                <motion.button 
                  type="button"
                  whileTap={{ scale: 0.9 }} 
                  onClick={() => setIsVoiceMode(!isVoiceMode)} 
                  className={`p-2 rounded-full transition-colors ${
                    isVoiceMode ? 'bg-primary-500/20 text-primary-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiMic className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            
            <motion.button 
              type="submit" 
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-400 transition-colors" 
              disabled={!currentConversation || !(inputValue || message).trim() || isLoading}
            >
              <FiSend />
            </motion.button>
          </form>
        </div>

        {/* Voice Agent Overlay */}
        <AnimatePresence>
          {isVoiceAgentActive && currentConversation && (
            <motion.div
              className="absolute bottom-24 right-4 z-20"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              drag
              dragConstraints={{ top: -400, left: -600, right: 0, bottom: 0 }}
            >
              <VoiceAgent roomName={currentConversation.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Voice Chat Modals */}
      <RealtimeVoiceChat 
        isOpen={showRealtimeVoice} 
        onClose={() => setShowRealtimeVoice(false)} 
      />
      
      <AnimatePresence>
        {showWebRTCVoice && (
          <VoiceAgentIntegration
            onTranscript={(transcript) => {
              setInputValue(transcript);
              handleSendMessage(transcript);
            }}
            onResponse={(response) => {
              addMessage({
                id: Date.now().toString(),
                content: response.text,
                sender: 'ai',
                timestamp: new Date().toISOString(),
              });
            }}
            onClose={() => setShowWebRTCVoice(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;