// Mock implementation for @openai/agents/realtime
class MockRealtimeAgent {
  constructor(config) {
    this.name = config.name;
    this.instructions = config.instructions;
  }
}

class MockRealtimeSession {
  constructor(agent, config) {
    this.agent = agent;
    this.config = config;
    this.connected = false;
    this.muted = false;
    this.eventHandlers = {};
  }

  async connect({ apiKey }) {
    console.log('Mock RealtimeSession connecting with API key:', apiKey ? 'provided' : 'not provided');
    this.connected = true;
    setTimeout(() => {
      this.emit('connection_change', 'connected');
    }, 500);
  }

  on(event, handler) {
    this.eventHandlers[event] = handler;
  }

  emit(event, payload) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event](payload);
    }
  }

  mute(muted) {
    this.muted = muted;
  }

  sendMessage(message) {
    console.log('Mock sending message:', message);
    // Mock response after a delay
    setTimeout(() => {
      this.emit('history_added', {
        type: 'message',
        role: 'assistant',
        content: [{ text: 'This is a mock response. The real-time voice feature is not yet implemented.' }]
      });
    }, 1000);
  }

  close() {
    this.connected = false;
    this.emit('connection_change', 'disconnected');
  }
}

// New voice session built with OpenAI Agents SDK (Mock)
export class NewomenVoiceSession {
  constructor(agentConfig = {}) {
    this.agent = new MockRealtimeAgent({
      name: 'Newomen Voice',
      instructions: this.buildSystemPrompt(agentConfig.userContext),
      ...agentConfig,
    });
    this.session = null;
    this.callbacks = {
      onConnectionChange: () => {},
      onListeningChange: () => {},
      onTranscript: () => {},
      onResponse: () => {},
      onError: () => {},
    };
    this.eventHandlers = {};
  }

  async connect({ apiKey, model = 'gpt-4o-realtime-preview-2025-06-03', endpoint = 'https://api.openai.com/v1/realtime', voice = 'nova', userContext = {} }) {
    try {
      this.agent.instructions = this.buildSystemPrompt(userContext);
      this.session = new MockRealtimeSession(this.agent, {
        model,
        voice,
        transport: 'webrtc',
        baseUrl: endpoint,
      });
      this.registerEvents();
      await this.session.connect({ apiKey });
      this.callbacks.onConnectionChange(true);
      return true;
    } catch (err) {
      console.error('Failed to connect:', err);
      this.callbacks.onError(err);
      return false;
    }
  }

  registerEvents() {
    if (!this.session) return;
    this.session.on('connection_change', (state) => {
      this.callbacks.onConnectionChange(state === 'connected');
      this.emit('connection_change', state);
    });
    this.session.on('history_added', (item) => {
      if (item.type !== 'message') return;
      let text = '';
      for (const part of item.content) {
        if (part.text) text += part.text;
        if (part.transcript) text += part.transcript;
      }
      if (item.role === 'user') {
        this.callbacks.onTranscript({ text });
        this.emit('transcript', { text });
      } else if (item.role === 'assistant') {
        this.callbacks.onResponse({ text });
        this.emit('response', { text });
      }
    });
    this.session.on('audio_interrupted', () => {
      this.callbacks.onListeningChange(false);
      this.emit('audio_interrupted');
    });
    this.session.on('error', (e) => this.callbacks.onError(e));
  }

  on(event, handler) {
    this.eventHandlers[event] = handler;
  }

  emit(event, payload) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event](payload);
    }
  }

  startListening() {
    if (this.session) {
      this.session.mute(false);
      this.callbacks.onListeningChange(true);
    }
  }

  stopListening() {
    if (this.session) {
      this.session.mute(true);
      this.callbacks.onListeningChange(false);
    }
  }

  async sendMessage(message) {
    if (this.session) {
      this.session.sendMessage(message);
    }
  }

  async disconnect() {
    if (this.session) {
      this.session.close();
      this.session = null;
      this.callbacks.onConnectionChange(false);
    }
  }

  buildSystemPrompt(userContext = {}) {
    return `You are Newomen, a compassionate AI companion for women's mental health. Speak naturally and sensitively. Name: ${userContext.name || 'sister'}. Cultural context: ${userContext.culturalContext || 'MENA'}. Language: ${userContext.language || 'en'}.`;
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
