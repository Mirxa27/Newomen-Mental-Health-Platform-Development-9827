import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import * as HiIcons from 'react-icons/hi';
import * as MdIcons from 'react-icons/md';
import SafeIcon from '../common/SafeIcon';
import { WebRTCVoiceAgent } from '../../services/webrtcVoiceAgent';
import { useAuthStore } from '../../store/authStore';
import { useAIProviderStore } from '../../store/aiProviderStore';
import toast from 'react-hot-toast';

const { 
  FiMic, FiMicOff, FiPhone, FiPhoneOff, FiVolume2, FiVolumeX, 
  FiWifi, FiWifiOff, FiSettings, FiActivity, FiClock, FiMessageCircle 
} = FiIcons;

const { 
  HiOutlineSignal, HiOutlineSignalOff, HiOutlineCog, 
  HiOutlineChartBar, HiOutlineUserGroup 
} = HiIcons;

const { 
  MdRecordVoiceOver, MdStop, MdPlayArrow, MdPause, 
  MdVolumeUp, MdVolumeOff, MdCallEnd, MdCall 
} = MdIcons;

const WebRTCVoiceAgentComponent = ({ onTranscript, onResponse, onClose, onStats }) => {
  const { t } = useTranslation();
  const { user, deductMinutes } = useAuthStore();
  const { getDefaultProvider } = useAIProviderStore();
  
  // Agent state
  const [agent, setAgent] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isPeerConnected, setIsPeerConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Session stats
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    messagesExchanged: 0,
    audioLevel: 0,
    connectionQuality: 'excellent',
    latency: 0,
    packetLoss: 0,
  });

  // Refs
  const agentRef = useRef(null);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const audioLevelRef = useRef(null);
  const statsIntervalRef = useRef(null);

  // Initialize the WebRTC voice agent
  const initializeAgent = useCallback(async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);

      // Check browser compatibility
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported in this browser');
      }

      if (!window.RTCPeerConnection) {
        throw new Error('WebRTC not supported in this browser');
      }

      // Get provider configuration
      const provider = getDefaultProvider();
      if (!provider?.apiKey) {
        throw new Error('Missing API key. Please configure in Admin → AI Provider Settings');
      }

      // Create WebRTC voice agent
      const voiceAgent = new WebRTCVoiceAgent({
        model: provider.model || 'gpt-4o-realtime-preview-2024-12-17',
        voice: provider.settings?.voice || 'nova',
        temperature: provider.settings?.temperature || 0.7,
        language: user?.preferences?.language || 'en',
        culturalContext: user?.preferences?.culturalContext || 'mena',
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ],
      });

      // Setup event listeners
      voiceAgent.on('status', (status) => {
        console.log('Agent status:', status);
        if (status === 'ready') {
          setIsInitialized(true);
        }
      });

      voiceAgent.on('connected', () => {
        setIsConnected(true);
        startTimeRef.current = Date.now();
        startSessionTimer();
        startStatsMonitoring();
        toast.success('WebRTC connection established');
      });

      voiceAgent.on('disconnected', () => {
        setIsConnected(false);
        stopSessionTimer();
        stopStatsMonitoring();
        toast.error('WebRTC connection lost');
      });

      voiceAgent.on('peer-connected', () => {
        setIsPeerConnected(true);
        toast.success('Peer connection established');
      });

      voiceAgent.on('peer-disconnected', () => {
        setIsPeerConnected(false);
        toast.error('Peer connection lost');
      });

      voiceAgent.on('voice-started', () => {
        setIsListening(true);
        toast.success('Voice communication started');
      });

      voiceAgent.on('voice-stopped', () => {
        setIsListening(false);
        setIsSpeaking(false);
        toast.info('Voice communication stopped');
      });

      voiceAgent.on('speaking-started', () => {
        setIsSpeaking(true);
      });

      voiceAgent.on('speaking-ended', () => {
        setIsSpeaking(false);
      });

      voiceAgent.on('voice-detected', (level) => {
        setAudioLevel(level);
        if (audioLevelRef.current) {
          audioLevelRef.current.style.transform = `scaleY(${level})`;
        }
      });

      voiceAgent.on('response-text', (text) => {
        setResponse(text);
        onResponse?.({ text, timestamp: Date.now() });
        
        setSessionStats(prev => ({
          ...prev,
          messagesExchanged: prev.messagesExchanged + 1,
        }));

        // Deduct minutes based on interaction
        const minutesUsed = Math.ceil((text?.length || 0) / 200);
        deductMinutes(minutesUsed);
      });

      voiceAgent.on('audio-input', (buffer) => {
        // Handle incoming audio data
        console.log('Received audio input:', buffer.byteLength, 'bytes');
      });

      voiceAgent.on('error', (error) => {
        console.error('Voice agent error:', error);
        setConnectionError(error.message);
        toast.error('Voice agent error: ' + error.message);
      });

      // Set audio level callback
      voiceAgent.setAudioLevelCallback((level) => {
        setAudioLevel(level);
        setSessionStats(prev => ({
          ...prev,
          audioLevel: level,
        }));
      });

      // Initialize the agent
      const userContext = {
        name: user?.name,
        culturalContext: user?.preferences?.culturalContext || 'mena',
        language: user?.preferences?.language || 'en',
        preferences: user?.preferences,
      };

      const initialized = await voiceAgent.initialize(provider.apiKey, userContext);
      
      if (!initialized) {
        throw new Error('Failed to initialize voice agent');
      }

      agentRef.current = voiceAgent;
      setAgent(voiceAgent);
      
    } catch (error) {
      console.error('Failed to initialize voice agent:', error);
      setConnectionError(error.message);
      toast.error('Failed to initialize voice agent: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, getDefaultProvider, deductMinutes, onResponse]);

  // Initialize on mount
  useEffect(() => {
    initializeAgent();
    
    return () => {
      cleanup();
    };
  }, [initializeAgent]);

  // Session timer
  const startSessionTimer = () => {
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setSessionStats(prev => ({
          ...prev,
          duration,
        }));
      }
    }, 1000);
  };

  const stopSessionTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Stats monitoring
  const startStatsMonitoring = () => {
    statsIntervalRef.current = setInterval(async () => {
      if (agentRef.current && agentRef.current.peerConnection) {
        try {
          const stats = await agentRef.current.peerConnection.getStats();
          let latency = 0;
          let packetLoss = 0;

          stats.forEach((report) => {
            if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
              latency = report.jitter || 0;
              packetLoss = report.packetsLost || 0;
            }
          });

          setSessionStats(prev => ({
            ...prev,
            latency: Math.round(latency * 1000), // Convert to ms
            packetLoss: Math.round(packetLoss),
            connectionQuality: getConnectionQuality(latency, packetLoss),
          }));
        } catch (error) {
          console.error('Error getting connection stats:', error);
        }
      }
    }, 2000);
  };

  const stopStatsMonitoring = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  };

  const getConnectionQuality = (latency, packetLoss) => {
    if (latency < 50 && packetLoss < 1) return 'excellent';
    if (latency < 100 && packetLoss < 5) return 'good';
    if (latency < 200 && packetLoss < 10) return 'fair';
    return 'poor';
  };

  // Cleanup
  const cleanup = async () => {
    stopSessionTimer();
    stopStatsMonitoring();
    
    if (agentRef.current) {
      await agentRef.current.cleanup();
      agentRef.current = null;
    }
    
    setAgent(null);
    setIsInitialized(false);
    setIsConnected(false);
    setIsPeerConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
  };

  // Voice communication controls
  const handleStartVoice = async () => {
    if (!agent || !isInitialized) return;
    
    try {
      setIsProcessing(true);
      await agent.startVoiceCommunication();
    } catch (error) {
      console.error('Failed to start voice communication:', error);
      toast.error('Failed to start voice communication');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopVoice = async () => {
    if (!agent) return;
    
    try {
      setIsProcessing(true);
      await agent.stopVoiceCommunication();
    } catch (error) {
      console.error('Failed to stop voice communication:', error);
      toast.error('Failed to stop voice communication');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndCall = async () => {
    await cleanup();
    onClose?.();
    toast.success(`Session ended. Duration: ${formatDuration(sessionStats.duration)}`);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-white mb-2">Initializing Voice Agent</h3>
          <p className="text-gray-300">Setting up WebRTC connection...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (connectionError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center max-w-md">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">Connection Error</h3>
          <p className="text-gray-300 mb-6">{connectionError}</p>
          <div className="flex gap-3">
            <button
              onClick={initializeAgent}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <SafeIcon className="w-8 h-8 text-purple-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">WebRTC Voice Agent</h2>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {isPeerConnected && (
              <>
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm text-gray-300">Peer Connected</span>
              </>
            )}
          </div>

          {/* Session Stats */}
          <div className="flex justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <FiClock className="w-4 h-4" />
              <span>{formatDuration(sessionStats.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiMessageCircle className="w-4 h-4" />
              <span>{sessionStats.messagesExchanged}</span>
            </div>
            <div className="flex items-center gap-1">
              <HiOutlineSignal className="w-4 h-4" />
              <span className="capitalize">{sessionStats.connectionQuality}</span>
            </div>
          </div>
        </div>

        {/* Audio Level Indicator */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-gray-600"></div>
            <div
              ref={audioLevelRef}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transform origin-bottom transition-transform duration-100"
              style={{ transform: `scaleY(${audioLevel})` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {isListening ? (
                <FiMic className="w-8 h-8 text-white" />
              ) : isSpeaking ? (
                <FiVolume2 className="w-8 h-8 text-white" />
              ) : (
                <FiMicOff className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          {!isListening ? (
            <button
              onClick={handleStartVoice}
              disabled={!isInitialized || isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <MdRecordVoiceOver className="w-5 h-5" />
              Start Voice
            </button>
          ) : (
            <button
              onClick={handleStopVoice}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <MdStop className="w-5 h-5" />
              Stop Voice
            </button>
          )}

          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
          >
            <MdCallEnd className="w-5 h-5" />
            End Call
          </button>
        </div>

        {/* Additional Controls */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
            title="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
            title="Statistics"
          >
            <HiOutlineChartBar className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-800/50 rounded-xl"
            >
              <h4 className="text-white font-semibold mb-3">Voice Settings</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Model:</span>
                  <span className="text-white">{agent?.config?.model || 'gpt-4o-realtime'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Voice:</span>
                  <span className="text-white">{agent?.config?.voice || 'nova'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Language:</span>
                  <span className="text-white">{agent?.config?.language || 'en'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Cultural Context:</span>
                  <span className="text-white capitalize">{agent?.config?.culturalContext || 'mena'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-800/50 rounded-xl"
            >
              <h4 className="text-white font-semibold mb-3">Connection Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Latency:</span>
                  <span className="text-white">{sessionStats.latency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Packet Loss:</span>
                  <span className="text-white">{sessionStats.packetLoss}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Audio Level:</span>
                  <span className="text-white">{Math.round(sessionStats.audioLevel * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Connection Quality:</span>
                  <span className={`capitalize ${
                    sessionStats.connectionQuality === 'excellent' ? 'text-green-400' :
                    sessionStats.connectionQuality === 'good' ? 'text-yellow-400' :
                    sessionStats.connectionQuality === 'fair' ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {sessionStats.connectionQuality}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcript Display */}
        {(transcript || response) && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
            <h4 className="text-white font-semibold mb-2">Conversation</h4>
            <div className="space-y-2 text-sm">
              {transcript && (
                <div>
                  <span className="text-purple-400 font-medium">You:</span>
                  <p className="text-gray-300 mt-1">{transcript}</p>
                </div>
              )}
              {response && (
                <div>
                  <span className="text-green-400 font-medium">AI:</span>
                  <p className="text-gray-300 mt-1">{response}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WebRTCVoiceAgentComponent;