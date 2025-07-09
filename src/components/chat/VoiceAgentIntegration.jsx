import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import * as MdIcons from 'react-icons/md';
import WebRTCVoiceAgentComponent from './WebRTCVoiceAgent';
import { useAuthStore } from '../../store/authStore';
import { useAIProviderStore } from '../../store/aiProviderStore';
import toast from 'react-hot-toast';

const { FiMic, FiMicOff, FiVolume2, FiVolumeX, FiSettings, FiActivity } = FiIcons;
const { MdRecordVoiceOver, MdStop, MdCallEnd, MdCall } = MdIcons;

const VoiceAgentIntegration = ({ 
  onTranscript, 
  onResponse, 
  onVoiceStart, 
  onVoiceStop,
  className = '',
  compact = false 
}) => {
  const { t } = useTranslation();
  const { user, deductMinutes } = useAuthStore();
  const { getDefaultProvider } = useAIProviderStore();
  
  // State
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [audioLevel, setAudioLevel] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    messagesExchanged: 0,
  });

  // Refs
  const audioLevelRef = useRef(null);
  const sessionTimerRef = useRef(null);

  // Check if voice is supported
  const isVoiceSupported = () => {
    return navigator.mediaDevices && 
           navigator.mediaDevices.getUserMedia && 
           window.RTCPeerConnection;
  };

  // Handle voice agent start
  const handleVoiceStart = () => {
    if (!isVoiceSupported()) {
      toast.error('Voice communication not supported in this browser');
      return;
    }

    if (!user) {
      toast.error('Please log in to use voice features');
      return;
    }

    const provider = getDefaultProvider();
    if (!provider?.apiKey) {
      toast.error('Please configure AI provider in Admin settings');
      return;
    }

    setIsConnecting(true);
    setShowVoiceAgent(true);
    onVoiceStart?.();
  };

  // Handle voice agent stop
  const handleVoiceStop = () => {
    setIsVoiceActive(false);
    setShowVoiceAgent(false);
    onVoiceStop?.();
    
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };

  // Handle transcript from voice agent
  const handleTranscript = (transcript) => {
    onTranscript?.(transcript);
  };

  // Handle response from voice agent
  const handleResponse = (response) => {
    onResponse?.(response);
    
    setSessionStats(prev => ({
      ...prev,
      messagesExchanged: prev.messagesExchanged + 1,
    }));
  };

  // Handle voice agent close
  const handleVoiceAgentClose = () => {
    setShowVoiceAgent(false);
    setIsVoiceActive(false);
    setIsConnecting(false);
    setConnectionStatus('disconnected');
    
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };

  // Start session timer
  const startSessionTimer = () => {
    const startTime = Date.now();
    sessionTimerRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      setSessionStats(prev => ({
        ...prev,
        duration,
      }));
    }, 1000);
  };

  // Handle voice agent status changes
  const handleVoiceAgentStatus = (status) => {
    setConnectionStatus(status);
    
    if (status === 'connected') {
      setIsConnecting(false);
      setIsVoiceActive(true);
      startSessionTimer();
      toast.success('Voice connection established');
    } else if (status === 'disconnected') {
      setIsConnecting(false);
      setIsVoiceActive(false);
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, []);

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400';
      case 'connecting':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Compact mode component
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Voice Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-400' :
            connectionStatus === 'connecting' ? 'bg-yellow-400' :
            'bg-gray-400'
          }`}></div>
          <span className={`text-xs ${getStatusColor()}`}>
            {connectionStatus === 'connected' ? 'Voice' :
             connectionStatus === 'connecting' ? 'Connecting' :
             'Offline'}
          </span>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center gap-1">
          {!isVoiceActive ? (
            <button
              onClick={handleVoiceStart}
              disabled={!isVoiceSupported() || isConnecting}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Start Voice Chat"
            >
              <MdRecordVoiceOver className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleVoiceStop}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              title="Stop Voice Chat"
            >
              <MdStop className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Session Duration */}
        {isVoiceActive && sessionStats.duration > 0 && (
          <span className="text-xs text-gray-400">
            {formatDuration(sessionStats.duration)}
          </span>
        )}

        {/* Voice Agent Modal */}
        <AnimatePresence>
          {showVoiceAgent && (
            <WebRTCVoiceAgentComponent
              onTranscript={handleTranscript}
              onResponse={handleResponse}
              onClose={handleVoiceAgentClose}
              onStats={setSessionStats}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full mode component
  return (
    <div className={`${className}`}>
      {/* Voice Agent Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
        <div className="flex items-center gap-4">
          {/* Voice Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400' :
              connectionStatus === 'connecting' ? 'bg-yellow-400' :
              'bg-gray-400'
            }`}></div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {connectionStatus === 'connected' ? 'Voice Connected' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Voice Disconnected'}
            </span>
          </div>

          {/* Audio Level Indicator */}
          {isVoiceActive && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <div className="absolute inset-0 rounded-full border-2 border-gray-600"></div>
                <div
                  ref={audioLevelRef}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transform origin-bottom transition-transform duration-100"
                  style={{ transform: `scaleY(${audioLevel})` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiMic className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {Math.round(audioLevel * 100)}%
              </span>
            </div>
          )}

          {/* Session Stats */}
          {isVoiceActive && (
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <FiActivity className="w-4 h-4" />
                <span>{formatDuration(sessionStats.duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiVolume2 className="w-4 h-4" />
                <span>{sessionStats.messagesExchanged} messages</span>
              </div>
            </div>
          )}
        </div>

        {/* Voice Controls */}
        <div className="flex items-center gap-2">
          {!isVoiceActive ? (
            <button
              onClick={handleVoiceStart}
              disabled={!isVoiceSupported() || isConnecting}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <MdRecordVoiceOver className="w-5 h-5" />
              <span>Start Voice</span>
            </button>
          ) : (
            <button
              onClick={handleVoiceStop}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              <MdStop className="w-5 h-5" />
              <span>Stop Voice</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setShowVoiceAgent(true)}
            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            title="Voice Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Voice Agent Modal */}
      <AnimatePresence>
        {showVoiceAgent && (
          <WebRTCVoiceAgentComponent
            onTranscript={handleTranscript}
            onResponse={handleResponse}
            onClose={handleVoiceAgentClose}
            onStats={setSessionStats}
          />
        )}
      </AnimatePresence>

      {/* Browser Support Warning */}
      {!isVoiceSupported() && (
        <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚠️ Voice communication requires a modern browser with WebRTC support.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceAgentIntegration;