import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { NewomenVoiceSession, generateEphemeralKey } from '../../services/realtimeAgent';
import { useAuthStore } from '../../store/authStore';
import { useAIProviderStore } from '../../store/aiProviderStore';
import toast from 'react-hot-toast';

const { FiMic, FiMicOff, FiPhone, FiPhoneOff, FiVolume2, FiVolumeX } = FiIcons;

const VoiceAgent = ({ onTranscript, onResponse, onClose }) => {
  const { t } = useTranslation();
  const { user, deductMinutes } = useAuthStore();
  const { getDefaultProvider } = useAIProviderStore();
  const [session, setSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [connectionError, setConnectionError] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    messagesExchanged: 0,
  });

  const sessionRef = useRef(null);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    initializeSession();
    return () => {
      cleanup();
    };
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);

      // Check for required browser APIs
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported in this browser');
      }
      
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported in this browser');
      }
      
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
          toast.success('Voice connection established');
        } else {
          stopDurationTimer();
          if (!connected) {
            toast.error('Voice connection lost');
          }
        }
      });

      voiceSession.on('transcript', (transcriptData) => {
        const userMessage = transcriptData.text || '';
        setTranscript(userMessage);
        onTranscript?.(transcriptData);
      });

      voiceSession.on('response', (responseData) => {
        const aiResponse = responseData.text || '';
        setResponse(aiResponse);
        setIsSpeaking(true);
        onResponse?.(responseData);
        
        setSessionStats(prev => ({
          ...prev,
          messagesExchanged: prev.messagesExchanged + 1,
        }));

        // Deduct minutes based on interaction
        const minutesUsed = Math.ceil((aiResponse?.length || 0) / 200);
        deductMinutes(minutesUsed);

        // Reset speaking state after speech completes
        setTimeout(() => {
          setIsSpeaking(false);
        }, (aiResponse?.length || 0) * 80); // Estimate speaking time
      });

      voiceSession.on('error', (error) => {
        console.error('Voice session error:', error);
        setConnectionError(error.message || 'Connection error');
        toast.error('Voice connection error: ' + error.message);
      });

      // Connect with user context
      const userContext = {
        name: user?.name,
        culturalContext: user?.preferences?.culturalContext || 'mena',
        language: user?.preferences?.language || 'en',
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
      setConnectionError(error.message);
      toast.error('Failed to start voice session: ' + error.message);
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
    onClose?.();
    toast.success(
      `Session ended. Duration: ${formatDuration(sessionStats.duration)}`
    );
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin w-10 h-10 md:w-12 md:h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connecting to Newomen...
          </h3>
          <p className="text-gray-600">
            Setting up your voice conversation
          </p>
        </div>
      </motion.div>
    );
  }

  if (connectionError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 text-center">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiPhoneOff} className="w-7 h-7 md:w-8 md:h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connection Failed
          </h3>
          <p className="text-gray-600 mb-4">
            {connectionError}
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={initializeSession}
              className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center z-50 p-4"
    >
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <SafeIcon icon={FiVolume2} className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            Voice Chat with Newomen
          </h2>
          <p className="text-white/80">
            {isConnected ? 'Connected - Speak naturally' : 'Connecting...'}
          </p>
        </div>

        {/* Session Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 mb-6 md:mb-8">
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
              <div className="text-xs md:text-sm text-white/80">Messages</div>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">Listening...</span>
                </div>
              </motion.div>
            )}
            
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-blue-500 rounded-full"
                        animate={{ height: [4, 16, 4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <span className="text-white font-medium">Newomen is speaking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript Display */}
          {transcript && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
              <div className="text-xs md:text-sm text-white/80 mb-1 md:mb-2">You said:</div>
              <div className="text-sm md:text-base text-white">{transcript}</div>
            </div>
          )}
          
          {/* Response Display */}
          {response && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4">
              <div className="text-xs md:text-sm text-white/80 mb-1 md:mb-2">Newomen:</div>
              <div className="text-sm md:text-base text-white">{response}</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 md:space-x-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleListening}
            disabled={!isConnected}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-white/20 hover:bg-white/30 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            <SafeIcon icon={isListening ? FiMicOff : FiMic} className="w-7 h-7 md:w-8 md:h-8" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEndCall}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all"
            aria-label="End call"
          >
            <SafeIcon icon={FiPhoneOff} className="w-7 h-7 md:w-8 md:h-8" />
          </motion.button>
        </div>

        {/* Instructions */}
        <div className="text-center mt-6 md:mt-8 text-white/80 text-xs md:text-sm">
          <p>Tap the microphone to start speaking</p>
          <p>Speak naturally - Newomen will respond with voice</p>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceAgent;
