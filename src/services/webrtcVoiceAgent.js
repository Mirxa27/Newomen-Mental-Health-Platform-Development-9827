import { EventEmitter } from 'events';

/**
 * Enhanced WebRTC Voice Agent with Peer-to-Peer Communication
 * Integrates OpenAI Realtime API with WebRTC for low-latency voice communication
 */
export class WebRTCVoiceAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // OpenAI Realtime API settings
      model: config.model || 'gpt-4o-realtime-preview-2024-12-17',
      voice: config.voice || 'nova',
      temperature: config.temperature || 0.7,
      
      // WebRTC settings
      iceServers: config.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
      
      // Audio settings
      sampleRate: config.sampleRate || 24000,
      channels: config.channels || 1,
      bitDepth: config.bitDepth || 16,
      
      // Connection settings
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      connectionTimeout: config.connectionTimeout || 10000,
      
      // Voice detection
      vadThreshold: config.vadThreshold || 0.5,
      silenceDuration: config.silenceDuration || 800,
      
      // Cultural and language settings
      language: config.language || 'en',
      culturalContext: config.culturalContext || 'mena',
      
      ...config
    };

    // State management
    this.isConnected = false;
    this.isPeerConnected = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.isProcessing = false;
    
    // WebRTC components
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    
    // Audio processing
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.analyserNode = null;
    this.gainNode = null;
    this.audioLevelCallback = null;
    
    // OpenAI Realtime API
    this.openaiWebSocket = null;
    this.openaiSessionId = null;
    this.conversationHistory = [];
    
    // Connection management
    this.retryCount = 0;
    this.connectionTimer = null;
    this.keepAliveInterval = null;
    
    // Audio buffers
    this.inputBuffer = [];
    this.outputBuffer = [];
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextPlayTime = 0;
  }

  /**
   * Initialize the WebRTC voice agent
   */
  async initialize(apiKey, userContext = {}) {
    try {
      this.emit('status', 'initializing');
      
      // Setup audio context
      await this.setupAudioContext();
      
      // Setup WebRTC peer connection
      await this.setupPeerConnection();
      
      // Connect to OpenAI Realtime API
      await this.connectOpenAI(apiKey, userContext);
      
      // Setup data channel for signaling
      this.setupDataChannel();
      
      this.emit('status', 'ready');
      return true;
    } catch (error) {
      console.error('Failed to initialize WebRTC voice agent:', error);
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Setup WebRTC peer connection with advanced configuration
   */
  async setupPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers,
        iceCandidatePoolSize: 10,
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceTransportPolicy: 'all',
      });

      // Setup event handlers
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.emit('ice-candidate', event.candidate);
        }
      };

      this.peerConnection.oniceconnectionstatechange = () => {
        const state = this.peerConnection.iceConnectionState;
        console.log('ICE connection state:', state);
        
        if (state === 'connected' || state === 'completed') {
          this.isPeerConnected = true;
          this.emit('peer-connected');
        } else if (state === 'disconnected' || state === 'failed') {
          this.isPeerConnected = false;
          this.emit('peer-disconnected');
        }
      };

      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection.connectionState;
        console.log('Connection state:', state);
        
        if (state === 'connected') {
          this.isConnected = true;
          this.emit('connected');
          this.startKeepAlive();
        } else if (state === 'disconnected' || state === 'failed') {
          this.isConnected = false;
          this.emit('disconnected');
          this.stopKeepAlive();
        }
      };

      // Setup data channel for signaling
      this.dataChannel = this.peerConnection.createDataChannel('signaling', {
        ordered: true,
        maxRetransmits: 3,
      });

      this.dataChannel.onopen = () => {
        console.log('Data channel opened');
        this.emit('data-channel-open');
      };

      this.dataChannel.onmessage = (event) => {
        this.handleDataChannelMessage(event.data);
      };

      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
        },
        video: false,
      });

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Setup audio analysis
      this.setupAudioAnalysis();

    } catch (error) {
      console.error('Failed to setup peer connection:', error);
      throw error;
    }
  }

  /**
   * Setup audio context and processing pipeline
   */
  async setupAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.config.sampleRate,
        latencyHint: 'interactive',
      });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);

      // Create analyser for audio level monitoring
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

    } catch (error) {
      console.error('Failed to setup audio context:', error);
      throw error;
    }
  }

  /**
   * Setup audio analysis for voice activity detection
   */
  setupAudioAnalysis() {
    if (!this.localStream || !this.analyserNode) return;

    const source = this.audioContext.createMediaStreamSource(this.localStream);
    source.connect(this.analyserNode);

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    
    const analyzeAudio = () => {
      if (!this.isListening) return;
      
      this.analyserNode.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedLevel = average / 255;
      
      if (this.audioLevelCallback) {
        this.audioLevelCallback(normalizedLevel);
      }
      
      // Voice activity detection
      if (normalizedLevel > this.config.vadThreshold) {
        this.emit('voice-detected', normalizedLevel);
      }
      
      requestAnimationFrame(analyzeAudio);
    };
    
    analyzeAudio();
  }

  /**
   * Connect to OpenAI Realtime API
   */
  async connectOpenAI(apiKey, userContext) {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `wss://api.openai.com/v1/realtime?model=${this.config.model}`;
        console.log('Connecting to OpenAI Realtime API:', wsUrl);

        this.openaiWebSocket = new WebSocket(wsUrl);

        const timeout = setTimeout(() => {
          this.openaiWebSocket.close();
          reject(new Error('OpenAI connection timeout'));
        }, this.config.connectionTimeout);

        this.openaiWebSocket.onopen = () => {
          clearTimeout(timeout);
          console.log('Connected to OpenAI Realtime API');
          
          this.openaiSessionId = `session_${Date.now()}`;
          
          // Send session configuration
          this.sendOpenAIEvent({
            type: 'session.update',
            session: {
              instructions: this.buildSystemPrompt(userContext),
              voice: this.config.voice,
              temperature: this.config.temperature,
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: { model: 'whisper-1' },
              turn_detection: {
                type: 'server_vad',
                threshold: this.config.vadThreshold,
                silence_duration_ms: this.config.silenceDuration,
              },
            },
          });

          resolve(true);
        };

        this.openaiWebSocket.onmessage = (event) => {
          try {
            const serverEvent = JSON.parse(event.data);
            this.handleOpenAIEvent(serverEvent);
          } catch (error) {
            console.error('Error parsing OpenAI event:', error);
          }
        };

        this.openaiWebSocket.onerror = (error) => {
          clearTimeout(timeout);
          console.error('OpenAI WebSocket error:', error);
          reject(error);
        };

        this.openaiWebSocket.onclose = () => {
          clearTimeout(timeout);
          console.log('OpenAI WebSocket closed');
          this.emit('openai-disconnected');
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Setup data channel for signaling
   */
  setupDataChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('Signaling data channel opened');
      this.emit('signaling-ready');
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleSignalingMessage(message);
      } catch (error) {
        console.error('Error parsing signaling message:', error);
      }
    };
  }

  /**
   * Handle signaling messages
   */
  handleSignalingMessage(message) {
    switch (message.type) {
      case 'offer':
        this.handleOffer(message.offer);
        break;
      case 'answer':
        this.handleAnswer(message.answer);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(message.candidate);
        break;
      case 'audio-data':
        this.handleRemoteAudioData(message.data);
        break;
      default:
        console.log('Unknown signaling message:', message);
    }
  }

  /**
   * Handle WebRTC offer
   */
  async handleOffer(offer) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.sendSignalingMessage({
        type: 'answer',
        answer: answer,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  /**
   * Handle WebRTC answer
   */
  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  /**
   * Start voice communication
   */
  async startVoiceCommunication() {
    try {
      this.emit('status', 'starting-voice');
      
      // Create and send offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      
      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignalingMessage({
        type: 'offer',
        offer: offer,
      });
      
      this.isListening = true;
      this.emit('voice-started');
      
    } catch (error) {
      console.error('Failed to start voice communication:', error);
      this.emit('error', error);
    }
  }

  /**
   * Stop voice communication
   */
  async stopVoiceCommunication() {
    try {
      this.isListening = false;
      this.isSpeaking = false;
      
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
      }
      
      if (this.peerConnection) {
        this.peerConnection.close();
      }
      
      if (this.openaiWebSocket) {
        this.openaiWebSocket.close();
      }
      
      this.emit('voice-stopped');
      
    } catch (error) {
      console.error('Error stopping voice communication:', error);
    }
  }

  /**
   * Send audio data to OpenAI
   */
  sendAudioData(audioData) {
    if (!this.openaiWebSocket || this.openaiWebSocket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.sendOpenAIEvent({
      type: 'input_audio',
      data: this.arrayBufferToBase64(audioData),
    });
  }

  /**
   * Handle remote audio data
   */
  handleRemoteAudioData(audioData) {
    const buffer = this.base64ToArrayBuffer(audioData);
    this.playAudioBuffer(buffer);
  }

  /**
   * Play audio buffer
   */
  async playAudioBuffer(buffer) {
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(buffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);
      
      if (this.nextPlayTime < this.audioContext.currentTime) {
        this.nextPlayTime = this.audioContext.currentTime;
      }
      
      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
      
      this.isSpeaking = true;
      this.emit('speaking-started');
      
      source.onended = () => {
        this.isSpeaking = false;
        this.emit('speaking-ended');
      };
      
    } catch (error) {
      console.error('Error playing audio buffer:', error);
    }
  }

  /**
   * Send OpenAI event
   */
  sendOpenAIEvent(event) {
    if (this.openaiWebSocket && this.openaiWebSocket.readyState === WebSocket.OPEN) {
      this.openaiWebSocket.send(JSON.stringify(event));
    }
  }

  /**
   * Send signaling message
   */
  sendSignalingMessage(message) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    }
  }

  /**
   * Handle OpenAI events
   */
  handleOpenAIEvent(event) {
    switch (event.type) {
      case 'input_audio':
        // Handle incoming audio from OpenAI
        this.handleOpenAIAudio(event.data);
        break;
      case 'response_audio':
        // Handle response audio from OpenAI
        this.handleOpenAIResponseAudio(event.data);
        break;
      case 'response_text':
        // Handle text response from OpenAI
        this.handleOpenAIResponseText(event.text);
        break;
      case 'error':
        this.emit('openai-error', event.error);
        break;
      default:
        console.log('Unknown OpenAI event:', event);
    }
  }

  /**
   * Handle OpenAI audio input
   */
  handleOpenAIAudio(audioData) {
    // Process audio data from OpenAI
    const buffer = this.base64ToArrayBuffer(audioData);
    this.emit('audio-input', buffer);
  }

  /**
   * Handle OpenAI response audio
   */
  handleOpenAIResponseAudio(audioData) {
    // Play response audio
    const buffer = this.base64ToArrayBuffer(audioData);
    this.playAudioBuffer(buffer);
  }

  /**
   * Handle OpenAI response text
   */
  handleOpenAIResponseText(text) {
    this.emit('response-text', text);
    this.conversationHistory.push({
      role: 'assistant',
      content: text,
      timestamp: Date.now(),
    });
  }

  /**
   * Start keep-alive mechanism
   */
  startKeepAlive() {
    this.keepAliveInterval = setInterval(() => {
      if (this.openaiWebSocket && this.openaiWebSocket.readyState === WebSocket.OPEN) {
        this.sendOpenAIEvent({ type: 'ping' });
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop keep-alive mechanism
   */
  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Build system prompt with cultural context
   */
  buildSystemPrompt(userContext = {}) {
    const { name, culturalContext, language } = userContext;
    
    return `You are Newomen, an AI mental health companion designed specifically for women. You provide empathetic, culturally-sensitive support while maintaining professional boundaries.

Key guidelines:
- Be warm, understanding, and non-judgmental
- Provide evidence-based mental health information
- Encourage self-reflection and personal growth
- Respect cultural and religious values
- Never give medical advice or diagnose conditions
- Encourage professional help when appropriate
- Use inclusive, empowering language
- Focus on strengths and resilience
- Provide practical coping strategies
- Maintain appropriate boundaries

Cultural considerations for ${culturalContext || 'MENA'} region:
- Respect family values and traditions
- Be mindful of religious and cultural beliefs
- Understand the importance of community and family
- Consider gender roles and expectations
- Be sensitive to stigma around mental health

User context: ${name ? `Name: ${name}` : ''}
Language: ${language || 'en'}
Cultural context: ${culturalContext || 'mena'}

Always respond in a supportive, educational, and empowering manner.`;
  }

  /**
   * Utility methods
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Set audio level callback
   */
  setAudioLevelCallback(callback) {
    this.audioLevelCallback = callback;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      isConnected: this.isConnected,
      isPeerConnected: this.isPeerConnected,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      retryCount: this.retryCount,
      conversationHistory: this.conversationHistory,
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      await this.stopVoiceCommunication();
      this.stopKeepAlive();
      
      if (this.audioContext) {
        await this.audioContext.close();
      }
      
      this.removeAllListeners();
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export default WebRTCVoiceAgent;