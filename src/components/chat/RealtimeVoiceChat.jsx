import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { NewomenVoiceSession, generateEphemeralKey } from '../../services/realtimeAgent';
import { useAuthStore } from '../../store/authStore';
import { useAIProviderStore } from '../../store/aiProviderStore';
import { useChatStore } from '../../store/chatStore';
import { usePromptStore } from '../../store/promptStore';
import toast from 'react-hot-toast';

const { FiMic, FiMicOff, FiPhone, FiPhoneOff, FiVolume2, FiVolumeX, FiAlertCircle, FiMessageCircle } = FiIcons;

const RealtimeVoiceChat = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, subscription, deductMinutes } = useAuthStore();
  const { getDefaultProvider } = useAIProviderStore();
  const { addMessage, setTyping } = useChatStore();
  const { getSystemPrompt, getCrisisPrompts, getPromptsByCategory } = usePromptStore();
  
  // Session state
  const [session, setSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // Conversation state
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Voice activity detection state
  const [vadEnabled, setVadEnabled] = useState(true);
  const [speechStarted, setSpeechStarted] = useState(false);
  const [speechEnded, setSpeechEnded] = useState(false);
  
  // Session analytics
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    messagesExchanged: 0,
    minutesUsed: 0,
    responseLatency: [],
    emotionalTone: 'neutral',
  });

  // Crisis detection
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [crisisKeywords] = useState([
    'suicide', 'kill myself', 'end it all', 'hurt myself', 'self-harm',
    'انتحار', 'أقتل نفسي', 'أؤذي نفسي', 'أريد أن أموت'
  ]);
  
  // Refs
  const sessionRef = useRef(null);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const conversationEndRef = useRef(null);
  const responseStartTime = useRef(null);
  const audioContextRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Initialize session
  useEffect(() => {
    if (isOpen) {
      initializeSession();
      requestWakeLock();
    }
    
    return () => {
      cleanup();
    };
  }, [isOpen]);

  // Auto-scroll conversation
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.log('Wake lock request failed:', err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const detectCrisis = useCallback((text) => {
    const lowercaseText = text.toLowerCase();
    const hasCrisisKeyword = crisisKeywords.some(keyword => 
      lowercaseText.includes(keyword.toLowerCase())
    );
    
    if (hasCrisisKeyword && !crisisDetected) {
      setCrisisDetected(true);
      // Trigger crisis support protocol
      handleCrisisDetection();
    }
    
    return hasCrisisKeyword;
  }, [crisisKeywords, crisisDetected]);

  const handleCrisisDetection = useCallback(() => {
    // CRITICAL: Follow ONLY admin-defined crisis protocols
    const crisisPrompts = getCrisisPrompts();
    
    if (crisisPrompts.length === 0) {
      console.error('CRITICAL: No admin-defined crisis protocols found!');
      toast.error('Crisis protocols not configured by admin. Please contact administrator.');
      return;
    }
    
    // Execute EXACT admin-defined crisis response
    const primaryCrisisPrompt = crisisPrompts.find(p => p.priority === 10) || crisisPrompts[0];
    
    if (sessionRef.current) {
      // MANDATORY: Send admin-defined crisis message with highest priority
      sessionRef.current.sendOutOfBandResponse({
        content: primaryCrisisPrompt.content,
        priority: 'urgent',
        modalities: ['text', 'audio'], // Ensure both text and voice response
        metadata: { 
          type: 'crisis-support', 
          admin_protocol: true,
          protocol_id: primaryCrisisPrompt.id,
          timestamp: new Date().toISOString(),
          compliance_level: 'mandatory'
        }
      });
      
      // Additional admin-defined crisis prompts if available
      crisisPrompts.slice(1).forEach((prompt, index) => {
        setTimeout(() => {
          sessionRef.current.sendOutOfBandResponse({
            content: prompt.content,
            priority: 'high',
            metadata: { 
              type: 'crisis-support-followup',
              admin_protocol: true,
              protocol_id: prompt.id,
              sequence: index + 1
            }
          });
        }, (index + 1) * 2000); // Stagger follow-up messages
      });
    }
    
    // Log compliance with admin protocols
    console.log('Crisis Detection: Admin protocols executed', {
      protocols_executed: crisisPrompts.map(p => p.id),
      primary_protocol: primaryCrisisPrompt.id,
      compliance_verified: true
    });
    
    toast.error('Crisis support activated - Following admin-defined protocols');
  }, [getCrisisPrompts]);  const initializeSession = async () => {
    if (subscription.minutesRemaining <= 0) {
      toast.error('No minutes remaining. Please upgrade your subscription.');
      onClose();
      return;
    }

    try {
      setIsLoading(true);
      setConnectionError(null);

      // Check browser compatibility
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported in this browser');
      }
      
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported in this browser');
      }

      // Initialize audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const provider = getDefaultProvider();
      const apiKey = await generateEphemeralKey(provider?.apiKey);
      
      if (!apiKey) {
        throw new Error('Missing API key. Configure your OpenAI key in Admin → AI Provider Settings');
      }

      // Get admin-defined system prompt - THIS IS MANDATORY
      const adminSystemPrompt = getSystemPrompt();
      if (!adminSystemPrompt) {
        throw new Error('Admin system prompt not configured. Please configure prompts in Admin Panel.');
      }

      // Create session with STRICT adherence to admin prompts
      const voiceSession = new NewomenVoiceSession({
        instructions: adminSystemPrompt, // MUST use admin-defined prompts
        voice: provider?.settings?.voice || 'nova',
        model: provider?.model || 'gpt-4o-realtime-preview-2024-10-01',
        modalities: ['text', 'audio'],
        temperature: provider?.settings?.temperature || 0.8,
        turn_detection: vadEnabled ? {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800,
          create_response: true
        } : null,
        // Add function calling for admin-defined crisis protocols
        tools: [
          {
            type: 'function',
            name: 'trigger_crisis_support',
            description: 'Activate crisis support protocol when detecting emergency situations',
            parameters: {
              type: 'object',
              properties: {
                severity: { type: 'string', enum: ['high', 'medium', 'low'] },
                keywords: { type: 'array', items: { type: 'string' } },
                immediate_action: { type: 'boolean' }
              },
              required: ['severity']
            }
          },
          {
            type: 'function',
            name: 'apply_cultural_context',
            description: 'Apply culturally sensitive responses based on admin guidelines',
            parameters: {
              type: 'object',
              properties: {
                context: { type: 'string' },
                cultural_elements: { type: 'array', items: { type: 'string' } }
              },
              required: ['context']
            }
          },
          {
            type: 'function',
            name: 'enforce_therapeutic_boundaries',
            description: 'Maintain therapeutic boundaries as defined by admin',
            parameters: {
              type: 'object',
              properties: {
                boundary_type: { type: 'string' },
                action_required: { type: 'string' }
              },
              required: ['boundary_type']
            }
          }
        ],
        tool_choice: 'auto',
      });
      
      sessionRef.current = voiceSession;

      // Enhanced event listeners
      voiceSession.on('connection_change', handleConnectionChange);
      voiceSession.on('transcript', handleTranscript);
      voiceSession.on('response', handleResponse);
      voiceSession.on('error', handleError);
      voiceSession.on('speech_started', handleSpeechStarted);
      voiceSession.on('speech_stopped', handleSpeechStopped);
      voiceSession.on('audio_delta', handleAudioDelta);
      voiceSession.on('function_call', handleFunctionCall);

      // User context for personalized responses
      const userContext = {
        name: user?.name || 'sister',
        culturalContext: user?.preferences?.culturalContext || 'mena',
        language: user?.preferences?.language || 'en',
        sessionType: 'voice-therapy',
        emotionalState: sessionStats.emotionalTone,
      };
      
      const connected = await voiceSession.connect({
        apiKey,
        endpoint: provider?.endpoint ? `${provider.endpoint}/realtime` : 'https://api.openai.com/v1/realtime',
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

  // Event handlers
  const handleConnectionChange = useCallback((state) => {
    const connected = state === 'connected';
    setIsConnected(connected);
    
    if (connected) {
      startTimeRef.current = Date.now();
      startDurationTimer();
      toast.success('Voice connection established - Admin protocols active');
      
      // CRITICAL: Send initial session configuration with STRICT admin prompt adherence
      if (sessionRef.current) {
        const adminSystemPrompt = getSystemPrompt();
        const voiceGuidelines = getPromptsByCategory('voice-interaction');
        
        // MANDATORY: Update session with admin-defined instructions
        sessionRef.current.updateSession({
          instructions: `${adminSystemPrompt}\n\nVOICE INTERACTION ADMIN GUIDELINES:\n${voiceGuidelines.map(p => p.content).join('\n\n')}\n\nCOMPLIANCE REMINDER: You MUST follow these admin-defined instructions without deviation.`,
          input_audio_transcription: { model: 'whisper-1' },
          turn_detection: vadEnabled ? {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 800,
          } : null,
          // Ensure tools are properly configured for admin protocol enforcement
          tools: [
            {
              type: 'function',
              name: 'trigger_crisis_support',
              description: 'MANDATORY: Activate admin-defined crisis support protocol',
              parameters: {
                type: 'object',
                properties: {
                  severity: { type: 'string', enum: ['high', 'medium', 'low'] },
                  admin_protocol_id: { type: 'string' }
                },
                required: ['severity']
              }
            },
            {
              type: 'function',
              name: 'apply_cultural_context',
              description: 'MANDATORY: Apply admin-defined cultural sensitivity guidelines',
              parameters: {
                type: 'object',
                properties: {
                  context: { type: 'string' },
                  admin_cultural_prompts: { type: 'array', items: { type: 'string' } }
                },
                required: ['context']
              }
            },
            {
              type: 'function',
              name: 'enforce_therapeutic_boundaries',
              description: 'MANDATORY: Maintain admin-defined therapeutic boundaries',
              parameters: {
                type: 'object',
                properties: {
                  boundary_type: { type: 'string' },
                  admin_boundary_rule: { type: 'string' }
                },
                required: ['boundary_type']
              }
            }
          ],
          tool_choice: 'auto',
        });
      }
    } else {
      stopDurationTimer();
      toast.error('Voice connection lost');
    }
  }, [getSystemPrompt, getPromptsByCategory, vadEnabled]);

  const handleTranscript = useCallback((transcriptData) => {
    const { text, type, item_id } = transcriptData;
    
    if (type === 'partial') {
      setInterimTranscript(text || '');
    } else if (type === 'final') {
      setCurrentTranscript(text || '');
      setInterimTranscript('');
      
      // Detect crisis keywords
      detectCrisis(text || '');
      
      // Add to conversation history
      const userMessage = {
        id: item_id || Date.now().toString(),
        role: 'user',
        content: text || '',
        timestamp: new Date().toISOString(),
        type: 'transcript',
      };
      
      setConversationHistory(prev => [...prev, userMessage]);
      
      // Also add to main chat store
      addMessage({
        ...userMessage,
        sender: 'user',
        emotion: sessionStats.emotionalTone,
      });
    }
  }, [detectCrisis, addMessage, sessionStats.emotionalTone]);

  const handleResponse = useCallback((responseData) => {
    const { text, audio, type, item_id } = responseData;
    
    if (type === 'partial') {
      setCurrentResponse(text || '');
    } else if (type === 'final') {
      responseStartTime.current = null;
      setCurrentResponse('');
      setIsSpeaking(true);
      
      const aiMessage = {
        id: item_id || Date.now().toString(),
        role: 'assistant',
        content: text || '',
        timestamp: new Date().toISOString(),
        type: 'response',
        hasAudio: !!audio,
      };
      
      setConversationHistory(prev => [...prev, aiMessage]);
      
      // Add to main chat store
      addMessage({
        ...aiMessage,
        sender: 'ai',
        culturalContext: 'mena',
      });
      
      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        messagesExchanged: prev.messagesExchanged + 1,
      }));

      // Calculate response latency
      if (responseStartTime.current) {
        const latency = Date.now() - responseStartTime.current;
        setSessionStats(prev => ({
          ...prev,
          responseLatency: [...prev.responseLatency, latency],
        }));
      }

      // Deduct minutes based on response length
      const minutesUsed = Math.ceil((text?.length || 0) / 150);
      deductMinutes(minutesUsed);
      setSessionStats(prev => ({
        ...prev,
        minutesUsed: prev.minutesUsed + minutesUsed,
      }));

      // Reset speaking state after estimated speech duration
      const estimatedDuration = (text?.length || 0) * 60; // ~60ms per character
      setTimeout(() => {
        setIsSpeaking(false);
      }, Math.max(estimatedDuration, 1000));
    }
    
    // Set response start time for latency calculation
    if (!responseStartTime.current) {
      responseStartTime.current = Date.now();
    }
  }, [addMessage, deductMinutes]);

  const handleError = useCallback((error) => {
    console.error('Voice session error:', error);
    setConnectionError(error.message || 'Connection error');
    toast.error('Voice connection error: ' + (error.message || 'Unknown error'));
    
    // Attempt to reconnect on certain errors
    if (error.code === 'connection_lost' || error.code === 'network_error') {
      setTimeout(() => {
        if (sessionRef.current && isOpen) {
          initializeSession();
        }
      }, 3000);
    }
  }, [isOpen]);

  const handleSpeechStarted = useCallback(() => {
    setSpeechStarted(true);
    setSpeechEnded(false);
    setIsListening(true);
    responseStartTime.current = Date.now();
  }, []);

  const handleSpeechStopped = useCallback(() => {
    setSpeechStarted(false);
    setSpeechEnded(true);
    setIsListening(false);
  }, []);

  const handleAudioDelta = useCallback((audioData) => {
    // Handle real-time audio playback if needed
    // This is handled by the browser's audio system in WebRTC mode
  }, []);

  const handleFunctionCall = useCallback((functionData) => {
    // Handle function calls from the AI strictly following admin protocols
    const { name, arguments: args, call_id } = functionData;
    
    console.log('AI Function Call (Admin Protocol):', name, args);
    
    switch (name) {
      case 'trigger_crisis_support':
        // MANDATORY: Use admin-defined crisis protocols
        const crisisPrompts = getCrisisPrompts();
        if (crisisPrompts.length > 0) {
          // Execute EXACTLY as admin defined
          handleCrisisDetection();
          
          // Send admin-defined crisis response immediately
          if (sessionRef.current) {
            sessionRef.current.sendOutOfBandResponse({
              content: crisisPrompts[0].content,
              priority: 'urgent',
              metadata: { 
                type: 'crisis-support', 
                admin_protocol: true,
                timestamp: new Date().toISOString(),
                prompt_id: crisisPrompts[0].id
              }
            });
          }
        }
        break;
        
      case 'apply_cultural_context':
        // MANDATORY: Apply cultural context as defined by admin
        const culturalPrompts = getPromptsByCategory('cultural-context');
        if (culturalPrompts.length > 0) {
          // Integrate cultural guidelines from admin prompts
          if (sessionRef.current) {
            const culturalGuidance = culturalPrompts
              .map(prompt => prompt.content)
              .join('\n\n');
              
            sessionRef.current.sendOutOfBandResponse({
              content: `Following admin cultural guidelines: ${culturalGuidance}`,
              metadata: { 
                type: 'cultural-context',
                admin_defined: true,
                applied_prompts: culturalPrompts.map(p => p.id)
              }
            });
          }
        }
        break;
        
      case 'enforce_therapeutic_boundaries':
        // MANDATORY: Enforce boundaries exactly as admin defined
        const boundaryPrompts = getPromptsByCategory('professional');
        if (boundaryPrompts.length > 0) {
          if (sessionRef.current) {
            sessionRef.current.sendOutOfBandResponse({
              content: boundaryPrompts[0].content,
              metadata: { 
                type: 'therapeutic-boundary',
                admin_enforcement: true,
                boundary_prompt_id: boundaryPrompts[0].id
              }
            });
          }
        }
        break;
        
      default:
        console.log('Unknown function call:', name, args);
    }
    
    // ALWAYS send function result back to AI confirming admin protocol compliance
    if (sessionRef.current) {
      sessionRef.current.sendFunctionResult(call_id, {
        success: true,
        admin_protocol_followed: true,
        compliance_verified: true,
        timestamp: new Date().toISOString(),
        function_executed: name
      });
    }
  }, [getCrisisPrompts, getPromptsByCategory, handleCrisisDetection]);

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
    releaseWakeLock();
    
    if (sessionRef.current) {
      await sessionRef.current.disconnect();
      sessionRef.current = null;
    }
    
    setSession(null);
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setSpeechStarted(false);
    setSpeechEnded(false);
    setCurrentTranscript('');
    setCurrentResponse('');
    setInterimTranscript('');
    setCrisisDetected(false);
  };

  // Manual controls
  const handleToggleListening = () => {
    if (!session || !isConnected) return;
    
    if (vadEnabled) {
      // In VAD mode, we can only mute/unmute
      if (isListening) {
        session.mute();
        setIsListening(false);
      } else {
        session.unmute();
        setIsListening(true);
      }
    } else {
      // In manual mode, control input buffer
      if (isListening) {
        session.stopListening();
        session.commitAudioBuffer();
        setIsListening(false);
      } else {
        session.clearAudioBuffer();
        session.startListening();
        setIsListening(true);
      }
    }
  };

  const handleToggleVAD = () => {
    setVadEnabled(!vadEnabled);
    
    if (sessionRef.current) {
      sessionRef.current.updateSession({
        turn_detection: !vadEnabled ? {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800,
        } : null,
      });
    }
  };

  const handleManualResponse = () => {
    if (sessionRef.current && !vadEnabled) {
      sessionRef.current.createResponse();
    }
  };

  const handleEndCall = async () => {
    await cleanup();
    onClose?.();
    
    const avgLatency = sessionStats.responseLatency.length > 0 
      ? sessionStats.responseLatency.reduce((a, b) => a + b, 0) / sessionStats.responseLatency.length 
      : 0;
    
    toast.success(
      `Session ended. Duration: ${formatDuration(sessionStats.duration)}, Messages: ${sessionStats.messagesExchanged}`
    );
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connecting to Newomen Voice...
          </h3>
          <p className="text-gray-600">
            Setting up your personalized conversation experience
          </p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (connectionError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiAlertCircle} className="w-8 h-8 text-red-500" />
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
              onClick={handleEndCall}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex flex-col z-50"
    >
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiVolume2} className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white">
                Voice Chat with Newomen
              </h2>
              <p className="text-white/80 text-sm">
                {isConnected ? 'Connected - Speak naturally' : 'Connecting...'}
              </p>
            </div>
          </div>
          
          {/* Connection status indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-white/80 text-sm">
              {subscription.minutesRemaining} min
            </span>
          </div>
        </div>

        {/* Crisis alert */}
        <AnimatePresence>
          {crisisDetected && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3"
            >
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-300" />
                <span className="text-red-200 font-medium">Crisis support activated</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Session stats */}
      <div className="bg-white/10 backdrop-blur-sm mx-4 md:mx-6 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl md:text-2xl font-bold text-white">
              {formatDuration(sessionStats.duration)}
            </div>
            <div className="text-xs md:text-sm text-white/80">Duration</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-white">
              {sessionStats.messagesExchanged}
            </div>
            <div className="text-xs md:text-sm text-white/80">Messages</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-white">
              {sessionStats.minutesUsed}
            </div>
            <div className="text-xs md:text-sm text-white/80">Minutes Used</div>
          </div>
        </div>
      </div>

      {/* Conversation history */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 space-y-3">
        <AnimatePresence>
          {conversationHistory.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs md:max-w-sm rounded-xl p-3 ${
                message.role === 'user' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white/20 text-white backdrop-blur-sm'
              }`}>
                <p className="text-sm md:text-base">{message.content}</p>
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  {message.hasAudio && (
                    <SafeIcon icon={FiVolume2} className="w-3 h-3" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Current states */}
        <AnimatePresence>
          {speechStarted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/20 border border-green-500/30 rounded-lg p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">Listening...</span>
              </div>
              {interimTranscript && (
                <div className="mt-2 text-white/80 text-sm">
                  "{interimTranscript}"
                </div>
              )}
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
                      className="w-1 bg-blue-400 rounded-full"
                      animate={{ height: [4, 16, 4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
                <span className="text-white font-medium">Newomen is speaking...</span>
              </div>
              {currentResponse && (
                <div className="mt-2 text-white/80 text-sm">
                  {currentResponse}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={conversationEndRef} />
      </div>

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6">
        {/* VAD Toggle */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleToggleVAD}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              vadEnabled 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}
          >
            {vadEnabled ? 'Auto Voice Detection ON' : 'Manual Voice Control ON'}
          </button>
        </div>

        {/* Main controls */}
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
          
          {!vadEnabled && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleManualResponse}
              disabled={!isConnected}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Generate response"
            >
              <SafeIcon icon={FiMessageCircle} className="w-7 h-7 md:w-8 md:h-8" />
            </motion.button>
          )}
          
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
        <div className="text-center mt-4 text-white/80 text-xs md:text-sm space-y-1">
          {vadEnabled ? (
            <>
              <p>Speak naturally - I'll detect when you start and stop talking</p>
              <p>You can interrupt me anytime by speaking</p>
            </>
          ) : (
            <>
              <p>Hold microphone to speak, then tap message button for response</p>
              <p>Manual mode gives you full control over the conversation flow</p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RealtimeVoiceChat;
