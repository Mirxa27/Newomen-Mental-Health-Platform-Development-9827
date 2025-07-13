import { describe, it, expect, beforeEach } from 'vitest';
import { useAIProviderStore } from './aiProviderStore';

const baseProvider = {
  id: 'openai',
  name: 'OpenAI',
  type: 'openai',
  apiKey: 'test',
  endpoint: 'https://api.openai.com/v1',
  model: 'gpt-4',
  isActive: true,
  isDefault: true,
  settings: {
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
};

beforeEach(() => {
  useAIProviderStore.setState({ providers: [baseProvider], error: null });
});

describe('aiProviderStore', () => {
  it('updates provider when id exists', () => {
    useAIProviderStore.getState().updateProvider('openai', { model: 'gpt-3.5-turbo' });
    const provider = useAIProviderStore.getState().providers.find(p => p.id === 'openai');
    expect(provider.model).toBe('gpt-3.5-turbo');
  });

  it('throws when provider id not found', () => {
    expect(() => {
      useAIProviderStore.getState().updateProvider('invalid', { model: 'x' });
    }).toThrow();
  });
});
