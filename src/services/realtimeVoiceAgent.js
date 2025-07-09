import { usePromptStore } from '../store/promptStore';

/**
 * Production-ready Newomen Voice Session with real audio processing
 * Implements OpenAI Realtime API with full WebSocket and WebRTC support
 */
export class NewomenVoiceSession {
  constructor(config = {}) {
    this.config = {
      instructions: config.instructions || '',
      voice: config.voice || 'nova',
      model: config.model || 'gpt-4o-realtime-preview-2024-12-17',
      modalities: config.modalities || ['text', 'audio'],
      temperature: config.temperature || 0.8,
      turn_detection: config.turn_detection || {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 800,
        create_response: true,
      },
      tools: config.tools || [],
      tool_choice: config.tool_choice || 'auto',
      input_audio_format: config.input_audio_format || 'pcm16',
      output_audio_format: config.output_audio_format || 'pcm16',
      input_audio_transcription: config.input_audio_transcription || { model: 'whisper-1' },
    };

    this.websocket = null;
    this.isConnected = false;
    this.isAudioEnabled = false;
    this.eventHandlers = {};
    this.conversationItems = [];
    this.sessionId = null;
    this.responseInProgress = false;

    // Real audio processing
    this.audioContext = null;
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextPlayTime = 0;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;

    // Audio worklet and processing
    this.audioWorkletNode = null;
    this.inputBuffer = [];
    this.outputBuffer = [];
    
    // Audio level monitoring
    this.analyserNode = null;
    this.audioLevelCallback = null;
    
    // Connection state
    this.connectionRetryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  /**
   * Connect to OpenAI Realtime API with proper authentication
   */
  async connect(config) {
    try {
      this.config = { ...this.config, ...config };
      this.config.instructions = this.buildSystemPrompt(config.userContext);
      await this.setupAudioContext();
      return await this.connectWebSocket(this.config.apiKey, this.config.apiUrl);
    } catch (error) {
      console.error('Connection failed:', error);
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Establish WebSocket connection with retry logic
   */
  async connectWebSocket(apiKey, endpoint) {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${endpoint}?model=${this.config.model}`;
        console.log('Connecting to OpenAI Realtime API:', wsUrl);

        this.websocket = new WebSocket(wsUrl);

        // Connection timeout
        const timeout = setTimeout(() => {
          this.websocket.close();
          reject(new Error('Connection timeout'));
        }, 10000);

        this.websocket.onopen = () => {
          clearTimeout(timeout);
          console.log('WebSocket connected to OpenAI Realtime API');
          this.isConnected = true;
          this.sessionId = `session_${Date.now()}`;
          this.connectionRetryCount = 0;

          // Send initial session configuration
          this.sendEvent({
            type: 'session.update',
            session: {
              modalities: this.config.modalities,
              instructions: this.config.instructions,
              voice: this.config.voice,
              input_audio_format: this.config.input_audio_format,
              output_audio_format: this.config.output_audio_format,
              input_audio_transcription: this.config.input_audio_transcription,
              turn_detection: this.config.turn_detection,
              temperature: this.config.temperature,
              tools: this.config.tools,
              tool_choice: this.config.tool_choice,
            },
          });

          this.emit('connection_change', 'connected');
          resolve(true);
        };

        this.websocket.onmessage = (event) => {
          try {
            const serverEvent = JSON.parse(event.data);
            this.handleServerEvent(serverEvent);
          } catch (error) {
            console.error('Error parsing server event:', error);
            this.emit('error', new Error('Failed to parse server event'));
          }
        };

        this.websocket.onerror = (error) => {
          clearTimeout(timeout);
          console.error('WebSocket error:', error);
          this.emit('error', new Error('WebSocket connection error'));
          this.handleConnectionError();
          reject(error);
        };

        this.websocket.onclose = (event) => {
          clearTimeout(timeout);
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.emit('connection_change', 'disconnected');
          this.resetAudioPlayback();

          // Attempt reconnection if not intentional
          if (event.code !== 1000 && this.connectionRetryCount < this.maxRetries) {
            this.handleConnectionError();
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle connection errors with exponential backoff retry
   */
  async handleConnectionError() {
    if (this.connectionRetryCount >= this.maxRetries) {
      this.emit('error', new Error('Maximum retry attempts reached'));
      return;
    }

    this.connectionRetryCount++;
    const delay = this.retryDelay * Math.pow(2, this.connectionRetryCount - 1);
    
    console.log(`Retrying connection in ${delay}ms (attempt ${this.connectionRetryCount}/${this.maxRetries})`);
    this.emit('connection_change', 'reconnecting');

    setTimeout(() => {
      this.connectWebSocket(this.apiKey, this.endpoint);
    }, delay);
  }

  /**
   * Setup real audio context and processing pipeline
   */
  async setupAudioContext() {
    try {
      // Create audio context with optimal settings
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000,
        latencyHint: 'interactive',
      });

      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Get user media for microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 24000,
        },
      });

      // Create analyser for audio level monitoring
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Connect media stream to analyser
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyserNode);

      // Setup audio worklet for real-time processing (if supported)
      if (this.audioContext.audioWorklet) {
        try {
          await this.setupAudioWorklet();
        } catch (error) {
          console.warn('AudioWorklet not supported, falling back to ScriptProcessor');
          this.setupScriptProcessor();
        }
      } else {
        this.setupScriptProcessor();
      }

      console.log('Audio context setup completed');
      this.emit('audio_ready');

    } catch (error) {
      console.error('Failed to setup audio context:', error);
      this.emit('error', new Error('Microphone access denied or not available'));
      throw error;
    }
  }

  /**
   * Setup AudioWorklet for low-latency audio processing
   */
  async setupAudioWorklet() {
    try {
      // Add audio worklet module (would need to be served as a separate file)
      await this.audioContext.audioWorklet.addModule('/audioWorkletProcessor.js');
      
      this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'voice-processor');
      
      this.audioWorkletNode.port.onmessage = (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'audio-data':
            if (this.isConnected && this.isRecording) {
              this.sendAudioData(data);
            }
            break;
          case 'audio-level':
            if (this.audioLevelCallback) {
              this.audioLevelCallback(data);
            }
            break;
        }
      };

      // Connect audio pipeline
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.audioWorkletNode);
      
    } catch (error) {
      console.error('AudioWorklet setup failed:', error);
      throw error;
    }
  }

  /**
   * Fallback to ScriptProcessor for older browsers
   */
  setupScriptProcessor() {
    const bufferSize = 4096;
    this.scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    
    this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
      if (!this.isConnected || !this.isRecording) return;
      
      const inputBuffer = audioProcessingEvent.inputBuffer;
      const inputData = inputBuffer.getChannelData(0);
      
      // Convert to 16-bit PCM
      const pcmData = this.float32ToPCM16(inputData);
      this.sendAudioData(pcmData);
      
      // Calculate audio level
      if (this.audioLevelCallback) {
        const level = this.calculateAudioLevel(inputData);
        this.audioLevelCallback(level);
      }
    };

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
  }

  /**
   * Convert Float32Array to 16-bit PCM
   */
  float32ToPCM16(float32Array) {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    return pcm16;
  }

  /**
   * Calculate audio level for visualization
   */
  calculateAudioLevel(audioData) {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  /**
   * Send audio data to OpenAI Realtime API
   */
  sendAudioData(audioData) {
    if (!this.isConnected || !this.websocket) return;
    
    // Convert to base64 for transmission
    const base64Audio = this.arrayBufferToBase64(audioData.buffer);
    
    this.sendEvent({
      type: 'input_audio_buffer.append',
      audio: base64Audio,
    });
  }

  /**
   * Convert ArrayBuffer to base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Play audio chunk with proper scheduling
   */
  async playAudioChunk(audioData) {
    if (!this.audioContext) return;
    
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      this.audioQueue.push(audioBuffer);
      
      if (!this.isPlaying) {
        this.scheduleNextChunk();
      }
    } catch (error) {
      console.error('Error decoding audio data:', error);
    }
  }

  /**
   * Schedule audio playback to prevent gaps
   */
  scheduleNextChunk() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.emit('playback_ended');
      return;
    }

    this.isPlaying = true;
    const bufferToPlay = this.audioQueue.shift();
    const source = this.audioContext.createBufferSource();
    source.buffer = bufferToPlay;
    source.connect(this.audioContext.destination);

    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextPlayTime);

    source.start(startTime);
    this.nextPlayTime = startTime + bufferToPlay.duration;

    source.onended = () => {
      this.scheduleNextChunk();
    };

    this.emit('playback_started', { duration: bufferToPlay.duration });
  }

  /**
   * Reset audio playback state
   */
  resetAudioPlayback() {
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextPlayTime = 0;
  }

  /**
   * Handle server events from OpenAI Realtime API
   */
  handleServerEvent(serverEvent) {
    console.log('Server event:', serverEvent.type);
    
    switch (serverEvent.type) {
      case 'session.created':
        this.sessionId = serverEvent.session.id;
        this.emit('session_created', serverEvent.session);
        break;
        
      case 'session.updated':
        this.config = { ...this.config, ...serverEvent.session };
        this.emit('session_updated', serverEvent.session);
        break;
        
      case 'conversation.item.created':
        this.conversationItems.push(serverEvent.item);
        this.emit('conversation_item_created', serverEvent.item);
        break;
        
      case 'input_audio_buffer.speech_started':
        this.emit('speech_started');
        break;
        
      case 'input_audio_buffer.speech_stopped':
        this.emit('speech_stopped');
        break;
        
      case 'input_audio_buffer.committed':
        this.emit('audio_committed');
        break;
        
      case 'response.created':
        this.responseInProgress = true;
        this.resetAudioPlayback();
        this.emit('response_started', serverEvent.response);
        break;
        
      case 'response.done':
        this.responseInProgress = false;
        this.emit('response_completed', {
          response: serverEvent.response,
          usage: serverEvent.response.usage,
        });
        break;
        
      case 'response.output_item.added':
        if (serverEvent.item.type === 'message') {
          this.conversationItems.push(serverEvent.item);
          this.emit('message_added', serverEvent.item);
        }
        break;
        
      case 'response.audio.delta':
        const audioBytes = this.base64ToArrayBuffer(serverEvent.delta);
        this.playAudioChunk(audioBytes);
        this.emit('audio_delta', serverEvent.delta);
        break;
        
      case 'response.audio_transcript.delta':
        this.emit('transcript_delta', {
          text: serverEvent.delta,
          type: 'partial',
          role: 'assistant',
        });
        break;
        
      case 'response.audio_transcript.done':
        this.emit('transcript_completed', {
          text: serverEvent.transcript,
          type: 'final',
          role: 'assistant',
        });
        break;
        
      case 'response.text.delta':
        this.emit('text_delta', {
          text: serverEvent.delta,
          type: 'partial',
          item_id: serverEvent.item_id,
        });
        break;
        
      case 'response.text.done':
        this.emit('text_completed', {
          text: serverEvent.text,
          type: 'final',
          item_id: serverEvent.item_id,
        });
        break;
        
      case 'response.function_call_arguments.delta':
        this.emit('function_call_partial', {
          name: serverEvent.name,
          arguments: serverEvent.delta,
          call_id: serverEvent.call_id,
        });
        break;
        
      case 'response.function_call_arguments.done':
        this.emit('function_call_completed', {
          name: serverEvent.name,
          arguments: serverEvent.arguments,
          call_id: serverEvent.call_id,
        });
        break;
        
      case 'error':
        console.error('Server error:', serverEvent.error);
        this.emit('error', new Error(serverEvent.error.message || 'Server error'));
        break;
        
      case 'rate_limits.updated':
        this.emit('rate_limits_updated', serverEvent.rate_limits);
        break;
        
      default:
        console.log('Unhandled server event:', serverEvent.type);
        this.emit('unhandled_event', serverEvent);
    }
  }

  /**
   * Start recording user audio
   */
  startRecording() {
    if (!this.mediaStream) {
      throw new Error('Audio context not initialized');
    }
    
    this.isRecording = true;
    this.emit('recording_started');
    
    // Clear any existing audio buffer
    this.sendEvent({
      type: 'input_audio_buffer.clear',
    });
  }

  /**
   * Stop recording and commit audio buffer
   */
  stopRecording() {
    this.isRecording = false;
    this.emit('recording_stopped');
    
    // Commit the audio buffer for processing
    this.sendEvent({
      type: 'input_audio_buffer.commit',
    });
  }

  /**
   * Send text message
   */
  sendTextMessage(text) {
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text,
          },
        ],
      },
    });
    
    this.sendEvent({
      type: 'response.create',
    });
  }

  /**
   * Interrupt current response
   */
  interrupt() {
    this.resetAudioPlayback();
    this.sendEvent({
      type: 'response.cancel',
    });
  }

  /**
   * Update session configuration
   */
  updateSession(updates) {
    this.config = { ...this.config, ...updates };
    this.sendEvent({
      type: 'session.update',
      session: updates,
    });
  }

  /**
   * Set audio level monitoring callback
   */
  setAudioLevelCallback(callback) {
    this.audioLevelCallback = callback;
  }

  /**
   * Send event to WebSocket
   */
  sendEvent(event) {
    if (!this.isConnected || !this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn('Not connected, cannot send event:', event.type);
      return;
    }

    try {
      const eventData = JSON.stringify(event);
      this.websocket.send(eventData);
    } catch (error) {
      console.error('Failed to send event:', error);
      this.emit('error', error);
    }
  }

  /**
   * Event listener management
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers[event]) {
      const index = this.eventHandlers[event].indexOf(handler);
      if (index > -1) {
        this.eventHandlers[event].splice(index, 1);
      }
    }
  }

  emit(event, payload) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect() {
    console.log('Disconnecting voice session...');
    
    // Stop recording
    this.isRecording = false;
    
    // Close WebSocket
    if (this.websocket) {
      this.websocket.close(1000, 'Client disconnect');
      this.websocket = null;
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
      this.audioContext = null;
    }

    // Reset state
    this.resetAudioPlayback();
    this.isConnected = false;
    this.conversationItems = [];
    this.sessionId = null;
    
    this.emit('disconnected');
  }

  /**
   * Build system prompt with context
   */
  buildSystemPrompt(userContext = {}) {
    const promptStore = usePromptStore.getState();
    const adminSystemPrompt = promptStore.getSystemPrompt();
    const voicePrompts = promptStore.getPromptsByCategory('voice-interaction');
    const crisisPrompts = promptStore.getCrisisPrompts();
    const culturalPrompts = promptStore.getPromptsByCategory('cultural-context');

    const enhancedPrompts = [
      '## MANDATORY SYSTEM INSTRUCTIONS ##',
      adminSystemPrompt,
      '',
      '## VOICE INTERACTION PROTOCOLS ##',
      voicePrompts.map((p) => p.content).join('\n\n'),
      '',
      '## CRISIS DETECTION AND RESPONSE ##',
      crisisPrompts.map((p) => p.content).join('\n\n'),
      '',
      '## CULTURAL SENSITIVITY REQUIREMENTS ##',
      culturalPrompts.map((p) => p.content).join('\n\n'),
      '',
      '## USER CONTEXT ##',
      `- Name: ${userContext.name || 'sister'}`,
      `- Cultural Context: ${userContext.culturalContext || 'MENA'}`,
      `- Language: ${userContext.language || 'en'}`,
      `- Session Type: voice-therapy`,
      `- Platform: Newomen Mental Health Platform`,
    ].join('\n');

    return enhancedPrompts;
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      isConnected: this.isConnected,
      isRecording: this.isRecording,
      isPlaying: this.isPlaying,
      conversationItems: this.conversationItems.length,
      audioQueueLength: this.audioQueue.length,
      connectionRetryCount: this.connectionRetryCount,
    };
  }
}



export default NewomenVoiceSession;