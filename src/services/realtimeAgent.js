// Enhanced Newomen Voice Session with full OpenAI Realtime API support
export class NewomenVoiceSession {
  constructor(config = {}) {
    this.config = {
      instructions: config.instructions || '',
      voice: config.voice || 'nova',
      model: config.model || 'gpt-4o-realtime-preview-2024-10-01',
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
    
    // WebRTC support
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    this.useWebRTC = false;
    
    // Audio context for processing
    this.audioContext = null;
    this.audioWorklet = null;
  }

  // Connection methods
  async connect({ apiKey, endpoint = 'https://api.openai.com/v1/realtime', userContext = {}, transport = 'websocket' }) {
    try {
      this.config.instructions = this.buildSystemPrompt(userContext);
      this.useWebRTC = transport === 'webrtc';
      
      if (this.useWebRTC) {
        return await this.connectWebRTC(apiKey, endpoint);
      } else {
        return await this.connectWebSocket(apiKey, endpoint);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      this.emit('error', error);
      return false;
    }
  }

  async connectWebSocket(apiKey, endpoint) {
    return new Promise((resolve, reject) => {
      const wsUrl = endpoint.replace('https://', 'wss://').replace('http://', 'ws://');
      this.websocket = new WebSocket(`${wsUrl}?model=${this.config.model}`, ['realtime']);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.sessionId = `session_${Date.now()}`;
        
        // Send initial session configuration
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
      };

      // Setup audio context for WebSocket audio processing
      this.setupAudioContext();
    });
  }

  async connectWebRTC(apiKey, endpoint) {
    try {
      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // Create data channel for signaling
      this.dataChannel = this.peerConnection.createDataChannel('realtime', {
        ordered: true
      });

      this.dataChannel.onopen = () => {
        console.log('Data channel opened');
        this.isConnected = true;
        
        // Send session configuration
        this.sendEvent({
          type: 'session.update',
          session: {
            ...this.config,
            api_key: apiKey
          }
        });
        
        this.emit('connection_change', 'connected');
      };

      this.dataChannel.onmessage = (event) => {
        try {
          const serverEvent = JSON.parse(event.data);
          this.handleServerEvent(serverEvent);
        } catch (error) {
          console.error('Error parsing data channel event:', error);
        }
      };

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Add audio tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
        this.emit('remote_audio_ready', this.remoteStream);
      };

      // Create offer and handle ICE
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send offer to OpenAI endpoint (simplified - actual implementation would need signaling server)
      const response = await fetch(`${endpoint}/webrtc/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          sdp: offer.sdp,
          type: offer.type
        })
      });

      const answer = await response.json();
      await this.peerConnection.setRemoteDescription(answer);

      return true;
    } catch (error) {
      console.error('WebRTC connection failed:', error);
      throw error;
    }
  }

  setupAudioContext() {
    if (this.audioContext) return;
    
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 24000
    });
  }

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
        // Handle partial content
        break;

      case 'response.audio.delta':
        this.handleAudioDelta(serverEvent.delta);
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

  handleAudioDelta(audioData) {
    if (this.useWebRTC) {
      // WebRTC handles audio automatically
      return;
    }

    // For WebSocket, decode and play audio
    try {
      const audioBytes = this.base64ToArrayBuffer(audioData);
      this.playAudioBuffer(audioBytes);
      this.emit('audio_delta', audioData);
    } catch (error) {
      console.error('Error playing audio delta:', error);
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

  // Audio control for WebRTC
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
      // For WebSocket, we'd start capturing audio here
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
    if (!this.isConnected) {
      console.warn('Not connected, cannot send event:', event);
      return;
    }

    const eventData = JSON.stringify(event);
    
    if (this.useWebRTC && this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(eventData);
    } else if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(eventData);
    } else {
      console.warn('No available connection to send event');
    }
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
    this.isConnected = false;

    // Clean up WebRTC
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Clean up WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    // Clean up audio context
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.emit('connection_change', 'disconnected');
  }

  buildSystemPrompt(userContext = {}) {
    // CRITICAL: This method must integrate with admin-defined prompts from the prompt store
    // For now, return base prompt - will be enhanced by RealtimeVoiceChat component
    const basePrompt = `You are Newomen, a compassionate AI therapist specifically designed for women's mental health and personal growth in the MENA region. 

CRITICAL COMPLIANCE REQUIREMENT:
You MUST strictly follow ALL admin-defined prompts and guidelines that will be provided to you during session initialization. These are not suggestions but mandatory instructions that override any general guidelines.

ADMIN PROTOCOL ENFORCEMENT:
- Admin prompts take absolute precedence over default instructions
- Crisis detection and response must follow admin-specified protocols exactly
- Cultural sensitivity must be applied precisely as defined by admin
- Therapeutic boundaries must be maintained as specified by admin
- Voice interaction patterns must conform to admin-defined guidelines

USER CONTEXT:
- Name: ${userContext.name || 'sister'}
- Cultural Context: ${userContext.culturalContext || 'mena'}
- Language: ${userContext.language || 'en'}
- Session Type: ${userContext.sessionType || 'voice-therapy'}
- Emotional State: ${userContext.emotionalState || 'neutral'}

BEHAVIORAL FRAMEWORK:
- Prioritize user safety using admin-defined crisis protocols
- Apply cultural context sensitivity as specified in admin prompts
- Maintain therapeutic boundaries as defined by admin
- Follow voice conversation flow patterns as mandated by admin
- Integrate admin prompts seamlessly into all responses

COMPLIANCE VERIFICATION:
- All responses must align with admin-defined prompt categories
- Crisis situations must trigger admin-specified protocols
- Cultural elements must be applied per admin cultural-context prompts
- Professional boundaries must be enforced per admin professional prompts
- Voice interactions must follow admin voice-interaction prompts

Remember: You are bound by admin-defined prompts. They are your operational framework and must be followed without deviation.`;

    return basePrompt;
  }
}

export const generateEphemeralKey = async (providerApiKey) => {
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  const localKey = window.localStorage.getItem('newomen-openai-key');

  // Prefer provider key, then locally stored key, then env
  if (providerApiKey || localKey || envKey) {
    return providerApiKey || localKey || envKey || '';
  }

  // Fall back to backend key generation when no key is available locally
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
