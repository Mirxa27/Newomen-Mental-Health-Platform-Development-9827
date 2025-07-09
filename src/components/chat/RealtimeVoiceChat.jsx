import { usePromptStore } from '../store/promptStore';

// Enhanced Newomen Voice Session with full OpenAI Realtime API support
export class NewomenVoiceSession {
  constructor(config = {}) {
    this.config = {
      instructions: config.instructions || '',
      voice: config.voice || 'nova',
      model: config.model || 'gpt-4o', // Using a standard gpt-4o model, adjust if a specific realtime preview is needed
      modalities: config.modalities || ['text', 'audio'],
      temperature: config.temperature || 0.8,
      turn_detection: config.turn_detection || {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 800,
        create_response: true
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
    this.inputAudioBuffer = [];
    this.responseInProgress = false;
    
    // WebRTC support (placeholders)
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    this.useWebRTC = false;
    
    // --- Audio Playback Enhancements ---
    this.audioContext = null;
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextPlayTime = 0;
    // --- End Enhancements ---
  }

  // Connection methods
  async connect({ apiKey, endpoint = 'https://api.openai.com/v1/realtime', userContext = {} }) {
    try {
      this.config.instructions = this.buildSystemPrompt(userContext);
      // Ensure audio context is ready before connecting
      this.setupAudioContext();
      return await this.connectWebSocket(apiKey, endpoint);
    } catch (error) {
      console.error('Connection failed:', error);
      this.emit('error', error);
      return false;
    }
  }

  async connectWebSocket(apiKey, endpoint) {
    return new Promise((resolve, reject) => {
      // The 'realtime' protocol might be specific to your backend; it's kept as is.
      const wsUrl = endpoint.replace('https://', 'wss://').replace('http://', 'ws://');
      this.websocket = new WebSocket(`${wsUrl}?model=${this.config.model}`, ['realtime']);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.sessionId = `session_${Date.now()}`;
        
        this.sendEvent({
          type: 'session.update',
          session: {
            ...this.config,
            api_key: apiKey
          }
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
        console.error('WebSocket error:', error);
        this.emit('error', new Error('WebSocket connection error'));
        reject(error);
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.emit('connection_change', 'disconnected');
        // Reset audio state on disconnect
        this.resetAudioPlayback();
      };
    });
  }

  async connectWebRTC(apiKey, endpoint) {
    throw new Error('WebRTC support is not implemented in this version');
  }

  setupAudioContext() {
    if (this.audioContext && this.audioContext.state !== 'closed') return;
    
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 24000 // OpenAI typically uses a 24kHz sample rate for audio output
    });

    // Resume context if it was suspended
    if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
    }
  }

  // --- FIX: Implemented Audio Handling ---
  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

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

  scheduleNextChunk() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
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

    // Schedule the next chunk to play right after this one finishes
    this.nextPlayTime = startTime + bufferToPlay.duration;
    
    source.onended = () => {
      this.scheduleNextChunk();
    };
  }
  
  resetAudioPlayback() {
      this.audioQueue = [];
      this.isPlaying = false;
      this.nextPlayTime = 0;
  }
  // --- End FIX ---

  // Event handling
  handleServerEvent(serverEvent) {
    console.log('Server event:', serverEvent.type, serverEvent);

    switch (serverEvent.type) {
      case 'session.created':
        this.sessionId = serverEvent.session.id;
        break;

      case 'session.updated':
        this.config = { ...this.config, ...serverEvent.session };
        break;

      case 'conversation.item.created':
        this.conversationItems.push(serverEvent.item);
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
        // Reset audio queue for a new response
        this.resetAudioPlayback();
        this.emit('response_started', serverEvent.response);
        break;

      case 'response.done':
        this.responseInProgress = false;
        this.emit('response', {
          text: this.extractTextFromResponse(serverEvent.response),
          type: 'final',
          item_id: serverEvent.response.id
        });
        break;

      case 'response.output_item.added':
        if (serverEvent.item.type === 'message') {
          this.conversationItems.push(serverEvent.item);
        }
        break;

      case 'response.content_part.added':
        // Can be used for more granular updates if needed
        break;

      case 'response.audio.delta':
        // --- FIX: Use the new audio playback system ---
        const audioBytes = this.base64ToArrayBuffer(serverEvent.delta);
        this.playAudioChunk(audioBytes);
        this.emit('audio_delta', serverEvent.delta);
        break;

      case 'response.audio_transcript.delta':
        this.emit('transcript', {
          text: serverEvent.delta,
          type: 'partial',
          role: 'assistant'
        });
        break;

      case 'response.audio_transcript.done':
        this.emit('transcript', {
          text: serverEvent.transcript,
          type: 'final',
          role: 'assistant'
        });
        break;

      case 'response.text.delta':
        this.emit('response', {
          text: serverEvent.delta,
          type: 'partial',
          item_id: serverEvent.item_id
        });
        break;

      case 'response.text.done':
        this.emit('response', {
          text: serverEvent.text,
          type: 'final',
          item_id: serverEvent.item_id
        });
        break;

      case 'response.function_call_arguments.delta':
        this.emit('function_call_partial', {
          name: serverEvent.name,
          arguments: serverEvent.delta,
          call_id: serverEvent.call_id
        });
        break;

      case 'response.function_call_arguments.done':
        this.emit('function_call', {
          name: serverEvent.name,
          arguments: serverEvent.arguments,
          call_id: serverEvent.call_id
        });
        break;

      case 'error':
        this.emit('error', new Error(serverEvent.error.message || 'Server error'));
        break;

      case 'rate_limits.updated':
        this.emit('rate_limits', serverEvent.rate_limits);
        break;

      default:
        console.log('Unhandled server event:', serverEvent.type);
    }
  }

  // Session control methods
  updateSession(updates) {
    this.config = { ...this.config, ...updates };
    this.sendEvent({
      type: 'session.update',
      session: updates
    });
  }

  // Conversation methods
  createConversationItem(item) {
    this.sendEvent({
      type: 'conversation.item.create',
      item
    });
  }

  sendTextMessage(text) {
    this.createConversationItem({
      type: 'message',
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: text
        }
      ]
    });
  }

  // Audio input methods
  appendAudioBuffer(audioData) {
    this.sendEvent({
      type: 'input_audio_buffer.append',
      audio: audioData
    });
  }

  commitAudioBuffer() {
    this.sendEvent({
      type: 'input_audio_buffer.commit'
    });
  }

  clearAudioBuffer() {
    this.sendEvent({
      type: 'input_audio_buffer.clear'
    });
  }

  // Response control
  createResponse(config = {}) {
    this.sendEvent({
      type: 'response.create',
      response: config
    });
  }

  sendOutOfBandResponse(config) {
    this.createResponse({
      conversation: 'none',
      metadata: config.metadata || {},
      modalities: config.modalities || ['text', 'audio'],
      instructions: config.content,
      ...config
    });
  }

  cancelResponse() {
    // Before sending cancel, stop any ongoing playback
    this.resetAudioPlayback();
    this.sendEvent({
      type: 'response.cancel'
    });
  }

  // Function calling
  sendFunctionResult(callId, result) {
    this.createConversationItem({
      type: 'function_call_output',
      call_id: callId,
      output: JSON.stringify(result)
    });
  }

  // Audio control (placeholders for UI integration)
  mute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }
  }

  unmute() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
    }
  }

  startListening() {
    if (this.useWebRTC) {
      this.unmute();
    } else {
      this.isAudioEnabled = true;
    }
  }

  stopListening() {
    if (this.useWebRTC) {
      this.mute();
    } else {
      this.isAudioEnabled = false;
    }
  }

  // Event system
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  emit(event, payload) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  sendEvent(event) {
    if (!this.isConnected || !this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn('Not connected, cannot send event:', event.type);
      return;
    }
    
    const eventData = JSON.stringify(event);
    this.websocket.send(eventData);
  }

  extractTextFromResponse(response) {
    if (!response.output || response.output.length === 0) return '';
    
    const textParts = [];
    response.output.forEach(item => {
      if (item.content) {
        item.content.forEach(part => {
          if (part.type === 'text' && part.text) {
            textParts.push(part.text);
          }
        });
      }
    });
    
    return textParts.join(' ');
  }

  // Cleanup
  async disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
      this.audioContext = null;
    }
    
    this.resetAudioPlayback();
    this.isConnected = false;
    this.emit('connection_change', 'disconnected');
  }

  buildSystemPrompt(userContext = {}) {
    const { getSystemPrompt } = usePromptStore.getState();
    const adminSystemPrompt = getSystemPrompt();

    const userContextPrompt = `
USER CONTEXT:
- Name: ${userContext.name || 'sister'}
- Cultural Context: ${userContext.culturalContext || 'mena'}
- Language: ${userContext.language || 'en'}
- Session Type: ${userContext.sessionType || 'voice-therapy'}
- Emotional State: ${userContext.emotionalState || 'neutral'}
`;

    return `${adminSystemPrompt}\n\n${userContextPrompt}`;
  }
}

export const generateEphemeralKey = async (providerApiKey) => {
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  const localKey = window.localStorage.getItem('newomen-openai-key');

  if (providerApiKey || localKey || envKey) {
    return providerApiKey || localKey || envKey || '';
  }

  try {
    const response = await fetch('/api/openai/ephemeral-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to generate ephemeral key');
    const data = await response.json();
    return data.apiKey;
  } catch (err) {
    console.error('Error generating ephemeral key:', err);
    return '';
  }
};