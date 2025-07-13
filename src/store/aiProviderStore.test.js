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

  it('adds a new provider and sets as default', () => {
    useAIProviderStore.getState().addProvider({
      id: 'gemini',
      name: 'Gemini',
      type: 'chat',
      apiKey: 'abc',
      isDefault: false,
    });
    useAIProviderStore.getState().setDefaultProvider('gemini');
    const gemini = useAIProviderStore.getState().providers.find(p => p.id === 'gemini');
    const openai = useAIProviderStore.getState().providers.find(p => p.id === 'openai');
    expect(gemini.isDefault).toBe(true);
    expect(openai.isDefault).toBe(false);
  });

  it('prevents deactivating default provider', () => {
    expect(() => {
      useAIProviderStore.getState().toggleActive('openai');
    }).toThrow();
  });
});
it('deletes provider when not default', () => {
  useAIProviderStore.getState().addProvider({ id: 'gemini', name: 'Gemini', type: 'chat' });
  useAIProviderStore.getState().deleteProvider('gemini');
  const provider = useAIProviderStore.getState().providers.find(p => p.id === 'gemini');
  expect(provider).toBeUndefined();
});

it('throws when deleting default provider', () => {
  expect(() => {
    useAIProviderStore.getState().deleteProvider('openai');
  }).toThrow();
});

it('getDefaultProvider returns provider', () => {
  const provider = useAIProviderStore.getState().getDefaultProvider();
  expect(provider.id).toBe('openai');
});

it('clearError resets error state', () => {
  expect(() => {
    useAIProviderStore.getState().updateProvider('invalid', { model: 'x' });
  }).toThrow();
  expect(useAIProviderStore.getState().error).not.toBeNull();
  useAIProviderStore.getState().clearError();
  expect(useAIProviderStore.getState().error).toBeNull();
});

it('toggles active status for non-default provider', () => {
  useAIProviderStore.getState().addProvider({ id: 'gemini', name: 'Gemini', type: 'chat', isDefault: false, isActive: true });
  useAIProviderStore.getState().toggleActive('gemini');
  const gemini = useAIProviderStore.getState().providers.find(p => p.id === 'gemini');
  expect(gemini.isActive).toBe(false);
});

it('updateSettings merges settings', () => {
  useAIProviderStore.getState().updateSettings({ brandingSettings: { brandName: 'Test' } });
  expect(useAIProviderStore.getState().settings.brandingSettings.brandName).toBe('Test');
});

it('setProviders validates array input', () => {
  expect(() => {
    useAIProviderStore.getState().setProviders(null);
  }).toThrow();
});
