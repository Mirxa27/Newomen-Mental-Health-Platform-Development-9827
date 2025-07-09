// Browser-compatible EventEmitter
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }

  removeAllListeners() {
    this.events = {};
  }
}

/**
 * WebRTC Voice Agent Service
 * Integrates OpenAI Realtime API with WebRTC peer-to-peer communication
 * Provides the best voice agent experience with real-time speech-to-speech
 */
export class WebRTCVoiceAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      model: 'gpt-4o-realtime-preview-2024-12-17',
      voice: 'nova',
      temperature: 0.7,
      language: 'en',
      culturalContext: 'mena',
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
      ...config,
    };

    // WebRTC components
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    
    // OpenAI Realtime components
    this.openAIStream = null;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioProcessor = null;
    
    // Signaling
    this.signalingSocket = null;
    this.roomId = null;
    this.connectionId = null;
    
    // State
    this.isInitialized = false;
    this.isConnected = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.isProcessing = false;
    
    // Audio processing
    this.audioLevelCallback = null;
    this.voiceActivityDetector = null;
    this.audioBuffer = [];
    this.sampleRate = 16000;
    
    // Session management
    this.sessionStartTime = null;
    this.messagesExchanged = 0;
    this.totalAudioProcessed = 0;
    
    // Error handling
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 1000;
  }

  /**
   * Initialize the voice agent
   */
  async initialize(apiKey, userContext = {}) {
    try {
      this.emit('status', 'initializing');
      
      // Check browser support
      if (!this.checkBrowserSupport()) {
        throw new Error('Browser does not support required features');
      }

      // Initialize audio context
      await this.initializeAudioContext();
      
      // Setup WebRTC peer connection
      await this.setupPeerConnection();
      
      // Initialize OpenAI Realtime
      await this.initializeOpenAIRealtime(apiKey, userContext);
      
      // Setup signaling
      await this.setupSignaling();
      
      // Setup voice activity detection
      this.setupVoiceActivityDetection();
      
      this.isInitialized = true;
      this.emit('status', 'ready');
      
      console.log('WebRTC Voice Agent initialized successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to initialize WebRTC Voice Agent:', error);
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Check browser support for required features
   */
  checkBrowserSupport() {
    const requiredFeatures = [
      'getUserMedia',
      'RTCPeerConnection',
      'AudioContext',
      'MediaRecorder',
    ];

    for (const feature of requiredFeatures) {
      if (!navigator.mediaDevices?.[feature] && !window[feature]) {
        console.error(`Browser does not support: ${feature}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Initialize audio context and processing
   */
  async initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.sampleRate,
      });

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      console.log('Audio context initialized');
      
    } catch (error) {
      throw new Error(`Failed to initialize audio context: ${error.message}`);
    }
  }

  /**
   * Setup WebRTC peer connection
   */
  async setupPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers,
        iceCandidatePoolSize: 10,
      });

      // Setup event handlers
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendSignalingMessage({
            type: 'ice-candidate',
            candidate: event.candidate,
          });
        }
      };

      this.peerConnection.onconnectionstatechange = () => {
        console.log('Peer connection state:', this.peerConnection.connectionState);
        
        if (this.peerConnection.connectionState === 'connected') {
          this.isConnected = true;
          this.emit('connected');
        } else if (this.peerConnection.connectionState === 'disconnected') {
          this.isConnected = false;
          this.emit('disconnected');
        }
      };

      this.peerConnection.onsignalingstatechange = () => {
        console.log('Signaling state:', this.peerConnection.signalingState);
      };

      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', this.peerConnection.iceConnectionState);
      };

      // Setup data channel for signaling
      this.dataChannel = this.peerConnection.createDataChannel('voice-agent', {
        ordered: true,
      });

      this.dataChannel.onopen = () => {
        console.log('Data channel opened');
        this.emit('peer-connected');
      };

      this.dataChannel.onclose = () => {
        console.log('Data channel closed');
        this.emit('peer-disconnected');
      };

      this.dataChannel.onmessage = (event) => {
        this.handleDataChannelMessage(event.data);
      };

      console.log('WebRTC peer connection setup complete');
      
    } catch (error) {
      throw new Error(`Failed to setup peer connection: ${error.message}`);
    }
  }

  /**
   * Initialize OpenAI Realtime API
   */
  async initializeOpenAIRealtime(apiKey, userContext) {
    try {
      // Create system prompt based on user context
      const systemPrompt = this.createSystemPrompt(userContext);
      
      // Initialize OpenAI Realtime stream
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          voice: this.config.voice,
          input: systemPrompt,
          response_format: 'opus',
          speed: 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      // Setup audio stream processing
      const audioBlob = await response.blob();
      const audioBuffer = await this.audioContext.decodeAudioData(await audioBlob.arrayBuffer());
      
      // Create audio source for playback
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      console.log('OpenAI Realtime initialized');
      
    } catch (error) {
      throw new Error(`Failed to initialize OpenAI Realtime: ${error.message}`);
    }
  }

  /**
   * Create system prompt based on user context
   */
  createSystemPrompt(userContext) {
    const { name, culturalContext, language, preferences } = userContext;
    
    let prompt = `You are Newomen, a compassionate AI companion for women's mental health and personal growth. `;
    
    if (culturalContext === 'mena') {
      prompt += `You understand Middle Eastern and North African cultural contexts. Use Arabic phrases like حبيبتي (habibti) when appropriate. `;
    }
    
    if (language === 'ar') {
      prompt += `You can communicate in Arabic and English. `;
    }
    
    if (name) {
      prompt += `The user's name is ${name}. `;
    }
    
    prompt += `Be warm, empathetic, and supportive. Keep responses concise and natural for voice conversation.`;
    
    return prompt;
  }

  /**
   * Setup WebSocket signaling
   */
  async setupSignaling() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/webrtc-signaling`;
      
      this.signalingSocket = new WebSocket(wsUrl);
      
      this.signalingSocket.onopen = () => {
        console.log('Signaling connection established');
        this.emit('signaling-connected');
      };
      
      this.signalingSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleSignalingMessage(message);
      };
      
      this.signalingSocket.onclose = () => {
        console.log('Signaling connection closed');
        this.emit('signaling-disconnected');
        this.handleReconnect();
      };
      
      this.signalingSocket.onerror = (error) => {
        console.error('Signaling error:', error);
        this.emit('error', new Error('Signaling connection error'));
      };
      
    } catch (error) {
      throw new Error(`Failed to setup signaling: ${error.message}`);
    }
  }

  /**
   * Handle signaling messages
   */
  handleSignalingMessage(message) {
    switch (message.type) {
      case 'welcome':
        this.connectionId = message.connectionId;
        this.joinRoom();
        break;
        
      case 'room-joined':
        this.roomId = message.roomId;
        this.emit('room-joined', message);
        break;
        
      case 'offer':
        this.handleOffer(message.offer, message.from);
        break;
        
      case 'answer':
        this.handleAnswer(message.answer, message.from);
        break;
        
      case 'ice-candidate':
        this.handleIceCandidate(message.candidate, message.from);
        break;
        
      case 'participant-joined':
        this.emit('participant-joined', message);
        break;
        
      case 'participant-left':
        this.emit('participant-left', message);
        break;
        
      case 'error':
        this.emit('error', new Error(message.error));
        break;
        
      default:
        console.log('Unknown signaling message:', message.type);
    }
  }

  /**
   * Send signaling message
   */
  sendSignalingMessage(message) {
    if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
      this.signalingSocket.send(JSON.stringify({
        ...message,
        roomId: this.roomId,
        timestamp: Date.now(),
      }));
    }
  }

  /**
   * Join a voice room
   */
  joinRoom() {
    const roomId = `voice-room-${Date.now()}`;
    this.sendSignalingMessage({
      type: 'join-room',
      roomId,
      data: {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle WebRTC offer
   */
  async handleOffer(offer, from) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.sendSignalingMessage({
        type: 'answer',
        answer,
      });
      
    } catch (error) {
      console.error('Error handling offer:', error);
      this.emit('error', error);
    }
  }

  /**
   * Handle WebRTC answer
   */
  async handleAnswer(answer, from) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
      this.emit('error', error);
    }
  }

  /**
   * Handle ICE candidate
   */
  async handleIceCandidate(candidate, from) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      this.emit('error', error);
    }
  }

  /**
   * Handle data channel messages
   */
  handleDataChannelMessage(data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'audio-data':
          this.processIncomingAudio(message.data);
          break;
          
        case 'transcript':
          this.emit('transcript', message.text);
          break;
          
        case 'response':
          this.emit('response-text', message.text);
          this.messagesExchanged++;
          break;
          
        default:
          console.log('Unknown data channel message:', message.type);
      }
      
    } catch (error) {
      console.error('Error handling data channel message:', error);
    }
  }

  /**
   * Setup voice activity detection
   */
  setupVoiceActivityDetection() {
    // Create audio analyzer for voice activity detection
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const detectVoiceActivity = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate audio level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const level = average / 255;
      
      // Emit audio level
      if (this.audioLevelCallback) {
        this.audioLevelCallback(level);
      }
      
      // Detect voice activity
      const isVoiceActive = level > 0.1;
      
      if (isVoiceActive && !this.isListening) {
        this.isListening = true;
        this.emit('voice-started');
      } else if (!isVoiceActive && this.isListening) {
        this.isListening = false;
        this.emit('voice-stopped');
      }
      
      requestAnimationFrame(detectVoiceActivity);
    };
    
    detectVoiceActivity();
  }

  /**
   * Start voice communication
   */
  async startVoiceCommunication() {
    try {
      this.isProcessing = true;
      this.emit('status', 'starting-voice');
      
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: this.sampleRate,
        },
        video: false,
      });
      
      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
      
      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignalingMessage({
        type: 'offer',
        offer,
      });
      
      // Start audio processing
      this.startAudioProcessing();
      
      this.sessionStartTime = Date.now();
      this.emit('voice-started');
      
      console.log('Voice communication started');
      
    } catch (error) {
      console.error('Failed to start voice communication:', error);
      this.emit('error', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Stop voice communication
   */
  async stopVoiceCommunication() {
    try {
      this.isProcessing = true;
      
      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      // Stop audio processing
      this.stopAudioProcessing();
      
      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      this.isListening = false;
      this.isSpeaking = false;
      this.emit('voice-stopped');
      
      console.log('Voice communication stopped');
      
    } catch (error) {
      console.error('Failed to stop voice communication:', error);
      this.emit('error', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start audio processing
   */
  startAudioProcessing() {
    if (!this.localStream) return;
    
    const source = this.audioContext.createMediaStreamSource(this.localStream);
    const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      const inputData = inputBuffer.getChannelData(0);
      
      // Process audio data
      this.processAudioData(inputData);
      
      // Send audio data to peer
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        this.dataChannel.send(JSON.stringify({
          type: 'audio-data',
          data: Array.from(inputData),
          timestamp: Date.now(),
        }));
      }
    };
    
    source.connect(processor);
    processor.connect(this.audioContext.destination);
    
    this.audioProcessor = processor;
  }

  /**
   * Stop audio processing
   */
  stopAudioProcessing() {
    if (this.audioProcessor) {
      this.audioProcessor.disconnect();
      this.audioProcessor = null;
    }
  }

  /**
   * Process incoming audio data
   */
  processIncomingAudio(audioData) {
    // Convert audio data to Float32Array
    const floatArray = new Float32Array(audioData);
    
    // Create audio buffer
    const audioBuffer = this.audioContext.createBuffer(1, floatArray.length, this.sampleRate);
    audioBuffer.getChannelData(0).set(floatArray);
    
    // Play audio
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start();
    
    this.isSpeaking = true;
    this.emit('speaking-started');
    
    source.onended = () => {
      this.isSpeaking = false;
      this.emit('speaking-ended');
    };
  }

  /**
   * Process audio data for voice activity detection
   */
  processAudioData(audioData) {
    // Calculate RMS (Root Mean Square) for audio level
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);
    const level = Math.min(rms * 5, 1); // Scale and clamp
    
    // Emit voice detected event
    this.emit('voice-detected', level);
    
    // Update audio level callback
    if (this.audioLevelCallback) {
      this.audioLevelCallback(level);
    }
  }

  /**
   * Handle reconnection
   */
  async handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(async () => {
        try {
          await this.setupSignaling();
          this.reconnectAttempts = 0;
        } catch (error) {
          console.error('Reconnection failed:', error);
          this.handleReconnect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      this.emit('error', new Error('Max reconnection attempts reached'));
    }
  }

  /**
   * Set audio level callback
   */
  setAudioLevelCallback(callback) {
    this.audioLevelCallback = callback;
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const duration = this.sessionStartTime ? 
      Math.floor((Date.now() - this.sessionStartTime) / 1000) : 0;
    
    return {
      duration,
      messagesExchanged: this.messagesExchanged,
      totalAudioProcessed: this.totalAudioProcessed,
      isConnected: this.isConnected,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      // Stop voice communication
      await this.stopVoiceCommunication();
      
      // Close signaling connection
      if (this.signalingSocket) {
        this.signalingSocket.close();
        this.signalingSocket = null;
      }
      
      // Close audio context
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      // Reset state
      this.isInitialized = false;
      this.isConnected = false;
      this.isListening = false;
      this.isSpeaking = false;
      this.isProcessing = false;
      
      console.log('WebRTC Voice Agent cleaned up');
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export default WebRTCVoiceAgent;