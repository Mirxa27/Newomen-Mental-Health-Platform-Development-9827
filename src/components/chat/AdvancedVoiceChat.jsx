import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMic, 
  FiMicOff, 
  FiVolume2, 
  FiVolumeX,
  FiPlay,
  FiPause,
  FiX,
  FiSettings,
  FiUser,
  FiWifi,
  FiWifiOff,
  FiActivity,
  FiClock,
  FiRefreshCw
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const AdvancedVoiceChat = ({ conversationId, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [currentSession, setCurrentSession] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [voiceProfiles, setVoiceProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [settings, setSettings] = useState({
    autoStart: true,
    noiseReduction: true,
    echoCancellation: true,
    volume: 0.8,
    micSensitivity: 0.7,
  });

  const sessionTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    fetchProviders();
    fetchVoiceProfiles();
    setupAudioContext();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (currentSession && isConnected) {
      startSessionTimer();
    } else {
      stopSessionTimer();
    }
  }, [currentSession, isConnected]);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/voice/providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data);
        const defaultProvider = data.find(p => p.isDefault);
        setSelectedProvider(defaultProvider || data[0]);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchVoiceProfiles = async () => {
    try {
      const response = await fetch('/api/voice/profiles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVoiceProfiles(data);
        const defaultProfile = data.find(p => p.isDefault);
        setSelectedProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching voice profiles:', error);
    }
  };

  const setupAudioContext = async () => {
    try {
      // Audio context setup is now handled by the voice session
      console.log('Audio context setup delegated to voice session');
    } catch (error) {
      console.error('Error setting up audio context:', error);
      toast.error('Could not access microphone');
    }
  };

  const startAudioLevelMonitoring = () => {
    // Audio level monitoring is now handled by the voice session
    console.log('Audio level monitoring delegated to voice session');
  };

  const startVoiceSession = async () => {
    if (!selectedProvider) {
      toast.error('Please select a voice provider');
      return;
    }

    try {
      setConnectionStatus('connecting');
      
      const response = await fetch('/api/voice/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          conversationId,
          profileId: selectedProfile?.id,
          providerName: selectedProvider.name,
          userContext: {
            name: user.name,
            language: 'en',
            culturalContext: 'MENA',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Initialize the voice session with real audio handling
        if (data.sessionData && data.sessionData.websocket) {
          // Setup audio level monitoring callback
          if (data.sessionData.websocket.setAudioLevelCallback) {
            data.sessionData.websocket.setAudioLevelCallback((level) => {
              setAudioLevel(level);
            });
          }
        }
        
        if (settings.autoStart) {
          setIsListening(true);
          startAudioLevelMonitoring();
        }
        
        toast.success('Voice session started');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to start voice session');
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Error starting voice session:', error);
      toast.error('Error starting voice session');
      setConnectionStatus('error');
    }
  };

  const endVoiceSession = async () => {
    if (!currentSession) return;

    try {
      const response = await fetch(`/api/voice/sessions/${currentSession.sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          transcript,
          duration: sessionDuration,
        }),
      });

      if (response.ok) {
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
        setCurrentSession(null);
        setConnectionStatus('disconnected');
        setSessionDuration(0);
        setTranscript('');
        setResponse('');
        
        toast.success('Voice session ended');
      } else {
        toast.error('Failed to end voice session');
      }
    } catch (error) {
      console.error('Error ending voice session:', error);
      toast.error('Error ending voice session');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      setIsListening(true);
      startAudioLevelMonitoring();
    }
  };

  const startSessionTimer = () => {
    sessionTimerRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
  };

  const stopSessionTimer = () => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanup = () => {
    stopSessionTimer();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return FiWifi;
      case 'connecting': return FiRefreshCw;
      case 'error': return FiWifiOff;
      default: return FiWifiOff;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FiMic className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Voice Assistant</h2>
                <p className="text-white/80">Powered by {selectedProvider?.name || 'AI'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-full ${getConnectionStatusColor()}`}>
                {React.createElement(getConnectionStatusIcon(), { 
                  className: `w-4 h-4 ${connectionStatus === 'connecting' ? 'animate-spin' : ''}` 
                })}
              </div>
              <span className={`text-sm font-medium ${getConnectionStatusColor()}`}>
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </span>
            </div>
            
            {currentSession && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  {formatDuration(sessionDuration)}
                </div>
                <div className="flex items-center gap-1">
                  <FiUser className="w-4 h-4" />
                  {user.name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Audio Visualizer */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: isListening ? 1.1 + (audioLevel * 0.3) : 1,
                  opacity: isListening ? 0.8 + (audioLevel * 0.2) : 0.6,
                }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center shadow-lg"
              >
                <FiMic className="w-12 h-12 text-white" />
              </motion.div>
              
              {/* Audio Level Rings */}
              <AnimatePresence>
                {isListening && audioLevel > 0.1 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-primary-400"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">You said:</div>
              <div className="text-gray-900">{transcript}</div>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="text-sm text-primary-600 mb-2">Assistant:</div>
              <div className="text-gray-900">{response}</div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isConnected ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startVoiceSession}
                disabled={connectionStatus === 'connecting'}
                className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <FiPlay className="w-5 h-5" />
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Start Voice Chat'}
              </motion.button>
            ) : (
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleListening}
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isListening ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endVoiceSession}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <FiX className="w-5 h-5" />
                  End Session
                </motion.button>
              </div>
            )}
          </div>

          {/* Provider Selection */}
          {!isConnected && providers.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Voice Provider:</div>
              <div className="grid grid-cols-2 gap-2">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    className={`p-3 rounded-lg border text-left ${
                      selectedProvider?.id === provider.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{provider.name}</div>
                    <div className="text-xs text-gray-500">
                      {provider.model} • {provider.voice}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice Profile Selection */}
          {!isConnected && voiceProfiles.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Voice Profile:</div>
              <div className="grid grid-cols-2 gap-2">
                {voiceProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile)}
                    className={`p-3 rounded-lg border text-left ${
                      selectedProfile?.id === profile.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{profile.name}</div>
                    <div className="text-xs text-gray-500">
                      {profile.provider.name} • {profile.voiceId}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedVoiceChat;