import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiMessageSquare, FiSidebar, FiSend, FiPhone, FiPlus, FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import NewomenLogo from '../components/common/NewomenLogo';
import useSocket from '../hooks/useSocket';
import VoiceAgent from '../components/chat/VoiceAgent';
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
            className={`p-4 m-2 rounded-lg cursor-pointer transition-colors duration-200 flex justify-between items-center ${currentConversation?.id === convo.id ? 'bg-primary-100/50' : 'hover:bg-gray-100/70'}`}
          >
            <span className="font-medium text-sm text-gray-700 truncate">{convo.title}</span>
            <button onClick={(e) => { e.stopPropagation(); onDelete(convo.id); }} className="p-1 text-gray-400 hover:text-red-500 rounded-full">
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
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isVoiceAgentActive, setIsVoiceAgentActive] = useState(false);

  const {
    conversations,
    currentConversation,
    isLoading,
    isTyping,
    fetchConversations,
    selectConversation,
    createConversation,
    sendMessage,
    deleteConversation
  } = useChatStore();
  const { joinConversation, leaveConversation, emitTyping } = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

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
  }, [currentConversation?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === '' || !currentConversation) return;
    await sendMessage(currentConversation.id, message);
    setMessage('');
    emitTyping(currentConversation?.id, false);
  };

  const handleCreateConversation = async () => {
    const newConversation = await createConversation('New Chat', 'Hello!');
    if (newConversation) {
      selectConversation(newConversation.id);
    }
  };

  const handleToggleVoiceAgent = () => {
    if (!currentConversation) {
      toast.error("Please select or start a conversation first.");
      return;
    }
    setIsVoiceAgentActive(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
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

      <main className="flex-1 flex flex-col transition-all duration-300">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 p-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-200 rounded-full">
              <FiSidebar />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">{currentConversation?.title || 'Chat'}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleVoiceAgent}
              className={`p-3 rounded-full transition-colors duration-300 ${isVoiceAgentActive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
              aria-label={isVoiceAgentActive ? "End Voice Call" : "Start Voice Call"}
            >
              <FiPhone size={20} />
            </motion.button>
            <button className="p-2 hover:bg-gray-200 rounded-full"><FiMoreVertical /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && !currentConversation && <div>Loading conversations...</div>}
          {currentConversation ? (
            currentConversation.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          ) : (
            !isLoading && <div className="text-center text-gray-500 pt-10">Select or create a conversation to begin.</div>
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/80">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (currentConversation) emitTyping(currentConversation.id, e.target.value.length > 0);
              }}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-500"
              disabled={!currentConversation}
            />
            <button type="submit" className="p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-400" disabled={!currentConversation || !message.trim()}>
              <FiSend />
            </button>
          </form>
        </div>

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
    </div>
  );
};

export default Chat;