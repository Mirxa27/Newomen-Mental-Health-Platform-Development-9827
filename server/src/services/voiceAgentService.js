import crypto from 'crypto';

// Abstract base class for voice providers
class VoiceProvider {
  constructor(config) {
    this.config = config;
    this.type = config.type;
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
  }

  async testConnection() {
    throw new Error('testConnection must be implemented by subclass');
  }

  async startSession(options) {
    throw new Error('startSession must be implemented by subclass');
  }

  async endSession(sessionId) {
    throw new Error('endSession must be implemented by subclass');
  }
}

// OpenAI Realtime API Provider
class OpenAIRealtimeProvider extends VoiceProvider {
  constructor(config) {
    super(config);
    this.sessions = new Map();
  }

  async testConnection() {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  async startSession(options = {}) {
    const sessionConfig = {
      model: this.config.model || 'gpt-4o-realtime-preview-2024-12-17',
      voice: this.config.voice || 'nova',
      instructions: this.buildInstructions(options.userContext),
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      input_audio_transcription: {
        model: 'whisper-1'
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500
      },
      tools: []
    };

    // Mock session for development
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      config: sessionConfig,
      status: 'active',
      startTime: new Date(),
      events: []
    };

    this.sessions.set(sessionId, session);
    return { sessionId, config: sessionConfig };
  }

  async endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'ended';
      session.endTime = new Date();
      this.sessions.delete(sessionId);
    }
    return { success: true };
  }

  buildInstructions(userContext = {}) {
    return `You are Newomen, a compassionate AI companion for women's mental health and wellbeing. 

Cultural Context: You understand and respect ${userContext.culturalContext || 'diverse cultural backgrounds'}, particularly MENA (Middle East and North Africa) values and traditions.

Communication Style:
- Speak naturally and warmly in ${userContext.language || 'English'}
- Use a calm, soothing tone
- Be empathetic and non-judgmental
- Provide culturally-sensitive support
- Maintain appropriate boundaries while being personable

Guidelines:
- Listen actively and validate emotions
- Offer practical coping strategies when appropriate
- Encourage self-reflection and personal growth
- Recognize when to suggest professional help
- Use inclusive language that honors diverse backgrounds
- Respect religious and cultural values

Remember: You're a supportive companion on their wellness journey, not a replacement for professional therapy when needed.`;
  }
}

// ElevenLabs Text-to-Speech Provider
class ElevenLabsProvider extends VoiceProvider {
  constructor(config) {
    super(config);
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('ElevenLabs connection test failed:', error);
      return false;
    }
  }

  async synthesizeSpeech(text, voiceId = null) {
    const targetVoiceId = voiceId || this.config.voice || '21m00Tcm4TlvDq8ikWAM';
    
    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${targetVoiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: this.config.model || 'eleven_multilingual_v2',
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
}

// Google Speech-to-Text Provider
class GoogleSpeechProvider extends VoiceProvider {
  constructor(config) {
    super(config);
    this.baseUrl = 'https://speech.googleapis.com/v1';
  }

  async testConnection() {
    try {
      // Mock test for now - would require proper Google Cloud setup
      return true;
    } catch (error) {
      console.error('Google Speech connection test failed:', error);
      return false;
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
      return result.results?.[0]?.alternatives?.[0]?.transcript || '';
    } catch (error) {
      console.error('Google Speech transcription failed:', error);
      throw error;
    }
  }
}

// Azure Speech Services Provider
class AzureSpeechProvider extends VoiceProvider {
  constructor(config) {
    super(config);
    this.region = config.settings?.region || 'eastus';
    this.baseUrl = `https://${this.region}.tts.speech.microsoft.com`;
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/cognitiveservices/voices/list`, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Azure Speech connection test failed:', error);
      return false;
    }
  }

  async synthesizeSpeech(text, voiceId = null) {
    const targetVoice = voiceId || this.config.voice || 'en-US-AriaNeural';
    
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${targetVoice}">
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

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Azure Speech synthesis failed:', error);
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
}

// Voice Agent Service Manager
export class VoiceAgentService {
  constructor() {
    this.providers = new Map();
    this.activeSessions = new Map();
  }

  registerProvider(name, providerClass, config) {
    try {
      const provider = new providerClass(config);
      this.providers.set(name, provider);
      return { success: true, provider };
    } catch (error) {
      console.error(`Failed to register provider ${name}:`, error);
      return { success: false, error: error.message };
    }
  }

  getProvider(name) {
    return this.providers.get(name);
  }

  async testProvider(name) {
    const provider = this.getProvider(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }
    return await provider.testConnection();
  }

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

  getActiveSessions() {
    return Array.from(this.activeSessions.values());
  }

  // Provider factory methods
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
}

// Encryption utilities for API keys
export class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('newomen-voice', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('newomen-voice', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

export default VoiceAgentService;