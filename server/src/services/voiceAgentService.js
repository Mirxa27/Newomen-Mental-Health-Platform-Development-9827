import WebSocket from 'ws';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { encryptionService } from './encryptionService.js';
import { EventEmitter } from 'events';

/**
 * Abstract base class for voice providers
 */
export class VoiceProvider extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.apiKey = encryptionService.decryptApiKey(config.apiKey, config.name);
    this.type = config.type;
    this.status = 'INACTIVE';
    this.usageCount = 0;
    this.lastError = null;
  }

  async testConnection() {
    throw new Error('testConnection method must be implemented by subclass');
  }

  async startSession(options) {
    throw new Error('startSession method must be implemented by subclass');
  }

  async endSession(sessionId) {
    throw new Error('endSession method must be implemented by subclass');
  }

  updateStatus(status, error = null) {
    this.status = status;
    this.lastError = error;
    this.emit('statusChange', { status, error });
  }

  incrementUsage() {
    this.usageCount++;
  }
}

/**
 * OpenAI Realtime API Provider - Production Implementation
 */
export class OpenAIRealtimeProvider extends VoiceProvider {
  constructor(config) {
    super(config);
    this.baseUrl = config.apiUrl || 'wss://api.openai.com/v1/realtime';
    this.model = config.model || 'gpt-4o-realtime-preview-2024-12-17';
    this.voice = config.voice || 'nova';
    this.activeSessions = new Map();
  }

  async testConnection() {
    try {
      // Test with a simple HTTP request to OpenAI API
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.updateStatus('ACTIVE');
        return { success: true, message: 'OpenAI API connection successful' };
      } else {
        const error = await response.text();
        this.updateStatus('ERROR', error);
        return { success: false, message: `OpenAI API error: ${response.status}` };
      }
    } catch (error) {
      this.updateStatus('ERROR', error.message);
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  async startSession(options = {}) {
    const sessionId = `openai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const sessionConfig = {
        sessionId,
        model: this.model,
        voice: this.voice,
        temperature: this.config.settings?.temperature || 0.7,
        max_tokens: this.config.settings?.max_tokens || 500,
        modalities: ['text', 'audio'],
        instructions: options.instructions || this.buildInstructions(options.userContext),
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800,
          create_response: true,
        },
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1',
        },
      };

      // Create WebSocket connection
      const ws = new WebSocket(`${this.baseUrl}?model=${this.model}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'realtime=v1',
        },
      });

      const session = {
        sessionId,
        websocket: ws,
        config: sessionConfig,
        status: 'connecting',
        startTime: new Date(),
        events: [],
        isActive: true,
      };

      // Store session
      this.activeSessions.set(sessionId, session);

      // Setup WebSocket event handlers
      ws.on('open', () => {
        console.log(`OpenAI Realtime session ${sessionId} connected`);
        session.status = 'connected';
        
        // Send session configuration
        this.sendEvent(ws, {
          type: 'session.update',
          session: {
            modalities: sessionConfig.modalities,
            instructions: sessionConfig.instructions,
            voice: sessionConfig.voice,
            input_audio_format: sessionConfig.input_audio_format,
            output_audio_format: sessionConfig.output_audio_format,
            input_audio_transcription: sessionConfig.input_audio_transcription,
            turn_detection: sessionConfig.turn_detection,
            temperature: sessionConfig.temperature,
            max_tokens: sessionConfig.max_tokens,
          },
        });

        this.emit('sessionStarted', { sessionId, session });
      });

      ws.on('message', (data) => {
        try {
          const event = JSON.parse(data.toString());
          session.events.push({ ...event, timestamp: new Date() });
          this.handleServerEvent(sessionId, event);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for session ${sessionId}:`, error);
        session.status = 'error';
        session.error = error.message;
        this.emit('sessionError', { sessionId, error });
      });

      ws.on('close', () => {
        console.log(`OpenAI Realtime session ${sessionId} closed`);
        session.status = 'closed';
        session.isActive = false;
        this.emit('sessionEnded', { sessionId });
      });

      this.incrementUsage();
      return session;

    } catch (error) {
      console.error('Failed to start OpenAI Realtime session:', error);
      throw error;
    }
  }

  async endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      if (session.websocket && session.websocket.readyState === WebSocket.OPEN) {
        session.websocket.close();
      }
      
      session.isActive = false;
      session.endTime = new Date();
      session.duration = session.endTime - session.startTime;

      this.activeSessions.delete(sessionId);
      
      return {
        sessionId,
        duration: session.duration,
        eventCount: session.events.length,
        status: 'ended',
      };
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  }

  sendEvent(ws, event) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }

  handleServerEvent(sessionId, event) {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    this.emit('serverEvent', { sessionId, event });

    switch (event.type) {
      case 'session.created':
        session.serverSessionId = event.session.id;
        break;
      case 'error':
        session.status = 'error';
        session.error = event.error.message;
        break;
      case 'response.audio.delta':
        this.emit('audioChunk', { sessionId, audioData: event.delta });
        break;
      case 'response.audio_transcript.done':
        this.emit('transcript', { 
          sessionId, 
          transcript: event.transcript,
          role: 'assistant' 
        });
        break;
      case 'input_audio_buffer.speech_started':
        this.emit('speechStarted', { sessionId });
        break;
      case 'input_audio_buffer.speech_stopped':
        this.emit('speechStopped', { sessionId });
        break;
    }
  }

  buildInstructions(userContext = {}) {
    return `You are Newomen, a compassionate AI companion for women's mental health and personal growth. 
    
    User Context:
    - Name: ${userContext.name || 'sister'}
    - Cultural Context: ${userContext.culturalContext || 'MENA'}
    - Language: ${userContext.language || 'en'}
    
    Guidelines:
    - Speak with warmth and cultural awareness
    - Use Arabic phrases like حبيبتي when appropriate
    - Provide supportive and empathetic responses
    - Maintain professional boundaries while being caring
    - Be sensitive to cultural and religious considerations`;
  }

  getSessionInfo(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  getAllSessions() {
    return Array.from(this.activeSessions.values());
  }
}

/**
 * ElevenLabs TTS Provider - Production Implementation
 */
export class ElevenLabsProvider extends VoiceProvider {
  constructor(config) {
    super(config);
    this.baseUrl = config.apiUrl || 'https://api.elevenlabs.io/v1';
    this.voiceId = config.voice || '21m00Tcm4TlvDq8ikWAM'; // Rachel voice
    this.model = config.model || 'eleven_multilingual_v2';
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (response.ok) {
        this.updateStatus('ACTIVE');
        return { success: true, message: 'ElevenLabs API connection successful' };
      } else {
        const error = await response.text();
        this.updateStatus('ERROR', error);
        return { success: false, message: `ElevenLabs API error: ${response.status}` };
      }
    } catch (error) {
      this.updateStatus('ERROR', error.message);
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  async synthesizeSpeech(text, options = {}) {
    try {
      const voiceId = options.voiceId || this.voiceId;
      
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: this.model,
          voice_settings: {
            stability: this.config.settings?.stability || 0.5,
            similarity_boost: this.config.settings?.similarity_boost || 0.5,
            style: this.config.settings?.style || 0.0,
            use_speaker_boost: this.config.settings?.use_speaker_boost || true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      this.incrementUsage();
      return await response.arrayBuffer();
    } catch (error) {
      console.error('ElevenLabs synthesis failed:', error);
      throw error;
    }
  }

  async getVoices() {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Failed to fetch ElevenLabs voices:', error);
      throw error;
    }
  }

  async startSession(options = {}) {
    const sessionId = `elevenlabs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      sessionId,
      provider: 'elevenlabs',
      type: 'text_to_speech',
      status: 'ready',
      startTime: new Date(),
      voiceId: options.voiceId || this.voiceId,
      model: this.model,
    };
  }

  async endSession(sessionId) {
    return {
      sessionId,
      status: 'ended',
      endTime: new Date(),
    };
  }
}

/**
 * Google Speech-to-Text Provider - Production Implementation
 */
export class GoogleSpeechProvider extends VoiceProvider {
  constructor(config) {
    super(config);
    this.baseUrl = 'https://speech.googleapis.com/v1';
    this.projectId = config.settings?.projectId || process.env.GOOGLE_SPEECH_PROJECT_ID;
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/speech:recognize?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
          },
          audio: {
            content: 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LHeSMFl', // minimal test audio
          },
        }),
      });

      if (response.ok) {
        this.updateStatus('ACTIVE');
        return { success: true, message: 'Google Speech API connection successful' };
      } else {
        const error = await response.text();
        this.updateStatus('ERROR', error);
        return { success: false, message: `Google Speech API error: ${response.status}` };
      }
    } catch (error) {
      this.updateStatus('ERROR', error.message);
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  async transcribeAudio(audioData, options = {}) {
    try {
      const requestBody = {
        config: {
          encoding: options.encoding || 'WEBM_OPUS',
          sampleRateHertz: options.sampleRate || 48000,
          languageCode: options.languageCode || 'en-US',
          alternativeLanguageCodes: options.alternativeLanguageCodes || ['ar'],
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: true,
          model: options.model || 'latest_long',
          useEnhanced: true,
        },
        audio: {
          content: Buffer.from(audioData).toString('base64'),
        },
      };

      const response = await fetch(`${this.baseUrl}/speech:recognize?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Google Speech API error: ${response.status}`);
      }

      const result = await response.json();
      this.incrementUsage();
      
      return {
        transcript: result.results?.[0]?.alternatives?.[0]?.transcript || '',
        confidence: result.results?.[0]?.alternatives?.[0]?.confidence || 0,
        words: result.results?.[0]?.alternatives?.[0]?.words || [],
      };
    } catch (error) {
      console.error('Google Speech transcription failed:', error);
      throw error;
    }
  }

  async startSession(options = {}) {
    const sessionId = `google_speech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      sessionId,
      provider: 'google_speech',
      type: 'speech_to_text',
      status: 'ready',
      startTime: new Date(),
      languageCode: options.languageCode || 'en-US',
      model: options.model || 'latest_long',
    };
  }

  async endSession(sessionId) {
    return {
      sessionId,
      status: 'ended',
      endTime: new Date(),
    };
  }
}

/**
 * Azure Speech Services Provider - Production Implementation
 */
export class AzureSpeechProvider extends VoiceProvider {
  constructor(config) {
    super(config);
    this.region = config.settings?.region || process.env.AZURE_SPEECH_REGION || 'eastus';
    this.baseUrl = `https://${this.region}.tts.speech.microsoft.com`;
    this.sttBaseUrl = `https://${this.region}.stt.speech.microsoft.com`;
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/cognitiveservices/voices/list`, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
        },
      });

      if (response.ok) {
        this.updateStatus('ACTIVE');
        return { success: true, message: 'Azure Speech API connection successful' };
      } else {
        const error = await response.text();
        this.updateStatus('ERROR', error);
        return { success: false, message: `Azure Speech API error: ${response.status}` };
      }
    } catch (error) {
      this.updateStatus('ERROR', error.message);
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  async synthesizeSpeech(text, options = {}) {
    const voiceId = options.voiceId || this.config.voice || 'en-US-AriaNeural';
    
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voiceId}">
          <prosody rate="${this.config.settings?.rate || 'medium'}" 
                   pitch="${this.config.settings?.pitch || 'medium'}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    try {
      const response = await fetch(`${this.baseUrl}/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        },
        body: ssml,
      });

      if (!response.ok) {
        throw new Error(`Azure Speech API error: ${response.status}`);
      }

      this.incrementUsage();
      return await response.arrayBuffer();
    } catch (error) {
      console.error('Azure Speech synthesis failed:', error);
      throw error;
    }
  }

  async transcribeAudio(audioData, options = {}) {
    try {
      const response = await fetch(`${this.sttBaseUrl}/speech/recognition/conversation/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
          'Accept': 'application/json',
        },
        body: audioData,
      });

      if (!response.ok) {
        throw new Error(`Azure Speech API error: ${response.status}`);
      }

      const result = await response.json();
      this.incrementUsage();
      
      return {
        transcript: result.DisplayText || '',
        confidence: result.Confidence || 0,
        duration: result.Duration || 0,
      };
    } catch (error) {
      console.error('Azure Speech transcription failed:', error);
      throw error;
    }
  }

  async getVoices() {
    try {
      const response = await fetch(`${this.baseUrl}/cognitiveservices/voices/list`, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Azure Speech API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch Azure voices:', error);
      throw error;
    }
  }

  async startSession(options = {}) {
    const sessionId = `azure_speech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      sessionId,
      provider: 'azure_speech',
      type: options.type || 'text_to_speech',
      status: 'ready',
      startTime: new Date(),
      voiceId: options.voiceId || this.config.voice,
      region: this.region,
    };
  }

  async endSession(sessionId) {
    return {
      sessionId,
      status: 'ended',
      endTime: new Date(),
    };
  }
}

/**
 * Voice Agent Service Manager - Production Implementation
 */
export class VoiceAgentService extends EventEmitter {
  constructor() {
    super();
    this.providers = new Map();
    this.activeSessions = new Map();
    this.sessionCleanupInterval = null;
    
    // Start session cleanup
    this.startSessionCleanup();
  }

  /**
   * Register a voice provider
   */
  registerProvider(name, providerClass, config) {
    try {
      const provider = new providerClass(config);
      
      // Listen to provider events
      provider.on('statusChange', ({ status, error }) => {
        this.emit('providerStatusChange', { providerName: name, status, error });
      });

      provider.on('sessionStarted', (session) => {
        this.activeSessions.set(session.sessionId, {
          provider: name,
          session,
          startTime: new Date(),
        });
        this.emit('sessionStarted', { providerName: name, ...session });
      });

      provider.on('sessionEnded', ({ sessionId }) => {
        this.activeSessions.delete(sessionId);
        this.emit('sessionEnded', { providerName: name, sessionId });
      });

      this.providers.set(name, provider);
      return { success: true, provider };
    } catch (error) {
      console.error(`Failed to register provider ${name}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a provider by name
   */
  getProvider(name) {
    return this.providers.get(name);
  }

  /**
   * Test a provider connection
   */
  async testProvider(name) {
    const provider = this.getProvider(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }
    return await provider.testConnection();
  }

  /**
   * Start a voice session
   */
  async startVoiceSession(providerName, options = {}) {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    const session = await provider.startSession(options);
    this.activeSessions.set(session.sessionId, {
      provider: providerName,
      session,
      startTime: new Date(),
    });

    return session;
  }

  /**
   * End a voice session
   */
  async endVoiceSession(sessionId) {
    const sessionInfo = this.activeSessions.get(sessionId);
    if (!sessionInfo) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const provider = this.getProvider(sessionInfo.provider);
    const result = await provider.endSession(sessionId);
    this.activeSessions.delete(sessionId);

    return result;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Clean up expired sessions
   */
  startSessionCleanup() {
    if (this.sessionCleanupInterval) return;

    const timeout = process.env.VOICE_SESSION_TIMEOUT || 300000; // 5 minutes
    const interval = process.env.VOICE_SESSION_CLEANUP_INTERVAL || 60000; // 1 minute

    this.sessionCleanupInterval = setInterval(() => {
      const now = Date.now();
      const expiredSessions = [];

      for (const [sessionId, sessionInfo] of this.activeSessions) {
        const age = now - sessionInfo.startTime.getTime();
        if (age > timeout) {
          expiredSessions.push(sessionId);
        }
      }

      expiredSessions.forEach(sessionId => {
        console.log(`Cleaning up expired session: ${sessionId}`);
        this.endVoiceSession(sessionId).catch(err => {
          console.error(`Failed to cleanup session ${sessionId}:`, err);
        });
      });

    }, interval);
  }

  /**
   * Stop session cleanup
   */
  stopSessionCleanup() {
    if (this.sessionCleanupInterval) {
      clearInterval(this.sessionCleanupInterval);
      this.sessionCleanupInterval = null;
    }
  }

  /**
   * Provider factory methods
   */
  static createOpenAIProvider(config) {
    return new OpenAIRealtimeProvider(config);
  }

  static createElevenLabsProvider(config) {
    return new ElevenLabsProvider(config);
  }

  static createGoogleSpeechProvider(config) {
    return new GoogleSpeechProvider(config);
  }

  static createAzureSpeechProvider(config) {
    return new AzureSpeechProvider(config);
  }

  /**
   * Shutdown all providers and sessions
   */
  async shutdown() {
    this.stopSessionCleanup();
    
    // End all active sessions
    const sessions = Array.from(this.activeSessions.keys());
    await Promise.allSettled(
      sessions.map(sessionId => this.endVoiceSession(sessionId))
    );

    this.providers.clear();
    this.activeSessions.clear();
  }
}

// Singleton instance
export const voiceAgentService = new VoiceAgentService();
export default voiceAgentService;