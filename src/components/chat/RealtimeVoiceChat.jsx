import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { NewomenVoiceSession, generateEphemeralKey } from '../../services/realtimeAgent';
import { useAuthStore } from '../../store/authStore';
import { useAIProviderStore } from '../../store/aiProviderStore';
import { useChatStore } from '../../store/chatStore';
import toast from 'react-hot-toast';

const { FiMic, FiMicOff, FiPhone, FiPhoneOff, FiVolume2 } = FiIcons;

const RealtimeVoiceChat = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, subscription, deductMinutes } = useAuthStore();
  const { getDefaultProvider } = useAIProviderStore();
  const { addMessage } = useChatStore();
  const [session, setSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    messagesExchanged: 0,
    minutesUsed: 0,
  });
  
  const sessionRef = useRef(null);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const conversationEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      initializeSession();
      // Prevent screen from sleeping during voice session
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(err => {
          console.log('Wake lock request failed:', err);
        });
      }
    }
    
    return () => {
      cleanup();
    };
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to the bottom when new messages arrive
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);

  const initializeSession = async () => {
    if (subscription.minutesRemaining <= 0) {
      toast.error('No minutes remaining. Please upgrade your subscription.');
      onClose();
      return;
    }
    
    try {
      setIsLoading(true);
      
      const provider = getDefaultProvider();
      const apiKey = await generateEphemeralKey(provider?.apiKey);
      if (!apiKey) {
        throw new Error(
          'Missing API key. Set your OpenAI key in Admin → AI Provider Settings or .env'
        );
      }
      
      const voiceSession = new NewomenVoiceSession();
      sessionRef.current = voiceSession;

      // Set up event listeners
      voiceSession.on('connection_change', (state) => {
        const connected = state === 'connected';
        setIsConnected(connected);
        if (connected) {
          startTimeRef.current = Date.now();
          startDurationTimer();
          toast.success('🎙️ Voice connection established');
        } else {
          stopDurationTimer();
          if (isOpen) {
            toast.error('Voice connection lost');
          }
        }
      });

      voiceSession.on('transcript', (transcriptData) => {
        const userMessage = transcriptData.text || '';
        if (userMessage.trim()) {
          const messageObj = {
            id: Date.now().toString(),
            content: userMessage,
            sender: 'user',
            timestamp: new Date().toISOString(),
            type: 'voice',
          };
          
          addMessage(messageObj);
          setConversationHistory(prev => [...prev, messageObj]);
        }
      });

      voiceSession.on('response', (responseData) => {
        const aiResponse = responseData.text || '';
        setIsSpeaking(true);
        
        if (aiResponse.trim()) {
          const messageObj = {
            id: (Date.now() + 1).toString(),
            content: aiResponse,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            type: 'voice',
            culturalContext: 'mena',
          };
          
          addMessage(messageObj);
          setConversationHistory(prev => [...prev, messageObj]);

          // Calculate and deduct minutes
          const minutesUsed = Math.ceil(aiResponse.length / 150);
          deductMinutes(minutesUsed);
          
          setSessionStats(prev => ({
            ...prev,
            messagesExchanged: prev.messagesExchanged + 1,
            minutesUsed: prev.minutesUsed + minutesUsed,
          }));
        }
        
        // Reset speaking state after estimated speech duration
        setTimeout(() => {
          setIsSpeaking(false);
        }, Math.max(2000, aiResponse.length * 80));
      });

      voiceSession.on('error', (error) => {
        console.error('Voice session error:', error);
        toast.error('Voice connection error: ' + error.message);
      });

      // Connect with user context
      const userContext = {
        name: user?.name,
        culturalContext: user?.preferences?.culturalContext || 'mena',
        language: user?.preferences?.language || 'en',
        sessionType: 'voice_chat',
      };
      
      const connected = await voiceSession.connect({
        apiKey,
        endpoint: provider?.endpoint ? `${provider.endpoint}/realtime` : 'https://api.openai.com/v1/realtime',
        model: provider?.model || 'gpt-4o-realtime-preview-2025-06-03',
        voice: provider?.settings?.voice || 'nova',
        userContext,
      });
      setSession(voiceSession);
      
      if (!connected) {
        throw new Error('Failed to establish voice connection');
      }
    } catch (error) {
      console.error('Failed to initialize voice session:', error);
      toast.error('Failed to start voice session: ' + error.message);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const startDurationTimer = () => {
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setSessionStats(prev => ({
          ...prev,
          duration
        }));
      }
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const cleanup = async () => {
    stopDurationTimer();
    if (sessionRef.current) {
      await sessionRef.current.disconnect();
      sessionRef.current = null;
    }
    setSession(null);
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setConversationHistory([]);
  };

  const handleToggleListening = () => {
    if (!session || !isConnected) return;

    if (isListening) {
      session.stopListening();
      setIsListening(false);
    } else {
      session.startListening();
      setIsListening(true);
    }
  };

  const handleEndCall = async () => {
    await cleanup();
    onClose();
    toast.success(
      `Session ended. Duration: ${formatDuration(sessionStats.duration)}, Messages: ${sessionStats.messagesExchanged}`
    );
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 z-50 overflow-hidden"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 text-center max-w-sm mx-4">
              <div className="animate-spin w-10 h-10 md:w-12 md:h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connecting to Newomen...
              </h3>
              <p className="text-gray-600">
                Initializing voice conversation
              </p>
            </div>
          </div>
        )}

        {/* Main Interface */}
        <div className="flex flex-col h-full safe-area-insets">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 bg-black bg-opacity-20">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiVolume2} className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white">Newomen Voice Chat</h1>
                <p className="text-sm text-white/80">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="text-right text-white text-sm">
                <div className="font-semibold">Minutes Left</div>
                <div className="text-lg font-bold">{subscription.minutesRemaining}</div>
              </div>
              <button
                onClick={handleEndCall}
                className="w-10 h-10 md:w-12 md:h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors touch-target"
                aria-label="End call"
              >
                <SafeIcon icon={FiPhoneOff} className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Session Stats */}
          <div className="px-4 md:px-6 py-3 md:py-4 bg-black bg-opacity-10">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {formatDuration(sessionStats.duration)}
                </div>
                <div className="text-xs md:text-sm text-white/80">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {sessionStats.messagesExchanged}
                </div>
                <div className="text-xs md:text-sm text-white/80">Exchanges</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {sessionStats.minutesUsed}
                </div>
                <div className="text-xs md:text-sm text-white/80">Minutes Used</div>
              </div>
            </div>
          </div>

          {/* Conversation Display */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 scroll-container">
            {conversationHistory.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{message.content}</p>
                  <div className="text-xs mt-2 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={conversationEndRef} />
          </div>

          {/* Active Status */}
          <div className="px-4 md:px-6 py-3 md:py-4">
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 md:p-4 mb-3 md:mb-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium text-sm md:text-base">Listening...</span>
                    <div className="flex space-x-1 ml-auto">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-green-500 rounded-full"
                          animate={{ height: [4, 16, 4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              
              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 md:p-4 mb-3 md:mb-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 bg-blue-500 rounded-full"
                          animate={{ height: [4, 20, 4] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                    <span className="text-white font-medium text-sm md:text-base">Newomen is speaking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="p-4 md:p-6 bg-black bg-opacity-20 safe-area-bottom">
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleListening}
                disabled={!isConnected}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all touch-target ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                <SafeIcon icon={isListening ? FiMicOff : FiMic} className="w-8 h-8 md:w-10 md:h-10" />
              </motion.button>
            </div>
            <div className="text-center mt-3 md:mt-4 text-white/80 text-xs md:text-sm">
              <p>
                {isListening ? 'Tap to stop listening' : 'Tap to start speaking'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RealtimeVoiceChat;
