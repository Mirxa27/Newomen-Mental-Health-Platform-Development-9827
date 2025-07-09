import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NewomenVoiceSession, generateEphemeralKey } from '../../src/services/realtimeAgent';
import { usePromptStore } from '../../src/store/promptStore';

// Mock the store
vi.mock('../../src/store/promptStore', () => ({
  usePromptStore: {
    getState: vi.fn(),
  },
}));

// Mock WebSocket
global.WebSocket = vi.fn(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  send: vi.fn(),
  readyState: 1,
}));

// Mock AudioContext
global.AudioContext = vi.fn(() => ({
  createBufferSource: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    onended: null,
    buffer: null,
  })),
  destination: {},
  decodeAudioData: vi.fn(() => Promise.resolve({
    duration: 1.0,
  })),
  close: vi.fn(() => Promise.resolve()),
  resume: vi.fn(() => Promise.resolve()),
  currentTime: 0,
  state: 'running',
}));

global.webkitAudioContext = global.AudioContext;

// Mock fetch for ephemeral key generation
global.fetch = vi.fn();

describe('NewomenVoiceSession', () => {
  let session;
  let mockPromptStore;

  beforeEach(() => {
    mockPromptStore = {
      getSystemPrompt: vi.fn(() => 'Test system prompt'),
      getPromptsByCategory: vi.fn(() => [
        { id: '1', content: 'Voice prompt 1' },
        { id: '2', content: 'Voice prompt 2' },
      ]),
      getCrisisPrompts: vi.fn(() => [
        { id: 'crisis-1', content: 'Crisis response protocol' },
      ]),
      prompts: [
        { id: 'realtime-compliance-framework', content: 'Compliance framework' },
      ],
    };

    usePromptStore.getState.mockReturnValue(mockPromptStore);

    session = new NewomenVoiceSession({
      temperature: 0.8,
      voice: 'nova',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (session) {
      session.disconnect();
    }
  });

  describe('Constructor', () => {
    it('initializes with default configuration', () => {
      const newSession = new NewomenVoiceSession();
      
      expect(newSession.config.voice).toBe('nova');
      expect(newSession.config.model).toBe('gpt-4o');
      expect(newSession.config.temperature).toBe(0.8);
      expect(newSession.isConnected).toBe(false);
    });

    it('accepts custom configuration', () => {
      const customConfig = {
        temperature: 0.5,
        voice: 'alloy',
        model: 'gpt-4o-mini',
      };
      
      const newSession = new NewomenVoiceSession(customConfig);
      
      expect(newSession.config.temperature).toBe(0.5);
      expect(newSession.config.voice).toBe('alloy');
      expect(newSession.config.model).toBe('gpt-4o-mini');
    });
  });

  describe('buildSystemPrompt', () => {
    it('builds comprehensive system prompt with user context', () => {
      const userContext = {
        name: 'Sarah',
        culturalContext: 'mena',
        language: 'en',
        sessionType: 'voice-therapy',
        emotionalState: 'anxious',
      };

      const prompt = session.buildSystemPrompt(userContext);

      expect(prompt).toContain('## MANDATORY SYSTEM INSTRUCTIONS ##');
      expect(prompt).toContain('Test system prompt');
      expect(prompt).toContain('## VOICE INTERACTION PROTOCOLS ##');
      expect(prompt).toContain('Voice prompt 1');
      expect(prompt).toContain('## CRISIS DETECTION AND RESPONSE ##');
      expect(prompt).toContain('Crisis response protocol');
      expect(prompt).toContain('## COMPLIANCE FRAMEWORK ##');
      expect(prompt).toContain('Compliance framework');
      expect(prompt).toContain('Name: Sarah');
      expect(prompt).toContain('Cultural Context: mena');
      expect(prompt).toContain('Language: en');
      expect(prompt).toContain('Session Type: voice-therapy');
      expect(prompt).toContain('Emotional State: anxious');
    });

    it('uses default values when user context is incomplete', () => {
      const prompt = session.buildSystemPrompt({});

      expect(prompt).toContain('Name: sister');
      expect(prompt).toContain('Cultural Context: mena');
      expect(prompt).toContain('Language: en');
      expect(prompt).toContain('Session Type: voice-therapy');
      expect(prompt).toContain('Emotional State: neutral');
    });

    it('handles missing prompts gracefully', () => {
      usePromptStore.getState.mockReturnValue({
        getSystemPrompt: vi.fn(() => ''),
        getPromptsByCategory: vi.fn(() => []),
        getCrisisPrompts: vi.fn(() => []),
        prompts: [],
      });

      const prompt = session.buildSystemPrompt({});

      expect(prompt).toContain('Follow all admin-defined prompts without deviation.');
    });
  });

  describe('Audio Handling', () => {
    it('sets up audio context with correct sample rate', () => {
      session.setupAudioContext();
      
      expect(global.AudioContext).toHaveBeenCalledWith({
        sampleRate: 24000,
      });
    });

    it('converts base64 to array buffer correctly', () => {
      const base64 = 'SGVsbG8gV29ybGQ='; // "Hello World" in base64
      const buffer = session.base64ToArrayBuffer(base64);
      
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBeGreaterThan(0);
    });

    it('schedules audio chunks for playback', async () => {
      session.setupAudioContext();
      const mockAudioBuffer = { duration: 1.0 };
      
      session.audioContext.decodeAudioData.mockResolvedValue(mockAudioBuffer);
      
      const testArrayBuffer = new ArrayBuffer(8);
      await session.playAudioChunk(testArrayBuffer);
      
      expect(session.audioQueue).toContain(mockAudioBuffer);
    });

    it('resets audio playback state', () => {
      session.audioQueue = [{ duration: 1.0 }];
      session.isPlaying = true;
      session.nextPlayTime = 5.0;
      
      session.resetAudioPlayback();
      
      expect(session.audioQueue).toHaveLength(0);
      expect(session.isPlaying).toBe(false);
      expect(session.nextPlayTime).toBe(0);
    });
  });

  describe('Event System', () => {
    it('registers event handlers', () => {
      const handler = vi.fn();
      session.on('test-event', handler);
      
      expect(session.eventHandlers['test-event']).toContain(handler);
    });

    it('emits events to registered handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const payload = { data: 'test' };
      
      session.on('test-event', handler1);
      session.on('test-event', handler2);
      session.emit('test-event', payload);
      
      expect(handler1).toHaveBeenCalledWith(payload);
      expect(handler2).toHaveBeenCalledWith(payload);
    });

    it('handles errors in event handlers gracefully', () => {
      const faultyHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = vi.fn();
      
      session.on('test-event', faultyHandler);
      session.on('test-event', normalHandler);
      
      // Should not throw
      expect(() => session.emit('test-event', {})).not.toThrow();
      expect(normalHandler).toHaveBeenCalled();
    });
  });

  describe('WebSocket Connection', () => {
    it('throws error for WebRTC connection attempt', async () => {
      await expect(session.connectWebRTC('fake-key', 'fake-endpoint'))
        .rejects.toThrow('WebRTC connection is not available.');
    });

    it('builds correct WebSocket URL', async () => {
      const mockWebSocket = {
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null,
      };
      global.WebSocket.mockReturnValue(mockWebSocket);

      const promise = session.connectWebSocket('test-key', 'https://api.openai.com/v1/realtime');
      
      // Simulate successful connection
      mockWebSocket.onopen();
      
      await promise;
      
      expect(global.WebSocket).toHaveBeenCalledWith(
        'wss://api.openai.com/v1/realtime?model=gpt-4o',
        ['realtime']
      );
    });
  });

  describe('Server Event Handling', () => {
    it('handles session.created event', () => {
      const event = {
        type: 'session.created',
        session: { id: 'session-123' },
      };
      
      session.handleServerEvent(event);
      
      expect(session.sessionId).toBe('session-123');
    });

    it('handles response.audio.delta event', () => {
      session.setupAudioContext();
      const mockEmit = vi.spyOn(session, 'emit');
      const mockPlayAudioChunk = vi.spyOn(session, 'playAudioChunk');
      
      const event = {
        type: 'response.audio.delta',
        delta: 'SGVsbG8=', // base64 "Hello"
      };
      
      session.handleServerEvent(event);
      
      expect(mockPlayAudioChunk).toHaveBeenCalled();
      expect(mockEmit).toHaveBeenCalledWith('audio_delta', 'SGVsbG8=');
    });

    it('handles error events', () => {
      const mockEmit = vi.spyOn(session, 'emit');
      const event = {
        type: 'error',
        error: { message: 'Test error' },
      };
      
      session.handleServerEvent(event);
      
      expect(mockEmit).toHaveBeenCalledWith('error', expect.any(Error));
    });
  });
});

describe('generateEphemeralKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    import.meta.env = { VITE_OPENAI_API_KEY: undefined };
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
      },
      writable: true,
    });
  });

  it('returns provider API key when provided', async () => {
    const key = await generateEphemeralKey('provided-key');
    expect(key).toBe('provided-key');
  });

  it('returns localStorage key when no provider key', async () => {
    window.localStorage.getItem.mockReturnValue('local-key');
    
    const key = await generateEphemeralKey();
    expect(key).toBe('local-key');
  });

  it('returns environment key when no provider or local key', async () => {
    import.meta.env.VITE_OPENAI_API_KEY = 'env-key';
    window.localStorage.getItem.mockReturnValue(null);
    
    const key = await generateEphemeralKey();
    expect(key).toBe('env-key');
  });

  it('calls API for ephemeral key when no keys available', async () => {
    window.localStorage.getItem.mockReturnValue(null);
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ apiKey: 'ephemeral-key' }),
    });
    
    const key = await generateEphemeralKey();
    
    expect(global.fetch).toHaveBeenCalledWith('/api/openai/ephemeral-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(key).toBe('ephemeral-key');
  });

  it('handles API errors gracefully', async () => {
    window.localStorage.getItem.mockReturnValue(null);
    global.fetch.mockRejectedValue(new Error('API Error'));
    
    const key = await generateEphemeralKey();
    expect(key).toBe('');
  });
});
