import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAIProviderStore } from '../../src/store/aiProviderStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock import.meta.env
global.import = {
  meta: {
    env: {
      VITE_OPENAI_API_KEY: 'test-env-key',
    },
  },
};

describe('useAIProviderStore', () => {
  beforeEach(() => {
    // Reset store state
    useAIProviderStore.setState({
      providers: [
        {
          id: 'openai',
          name: 'OpenAI',
          type: 'openai',
          apiKey: 'test-env-key',
          endpoint: 'https://api.openai.com/v1',
          model: 'gpt-4o',
          isActive: true,
          isDefault: true,
          settings: {
            temperature: 0.7,
            maxTokens: 1000,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
          },
        },
      ],
    });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('initializes with default OpenAI provider', () => {
      const { result } = renderHook(() => useAIProviderStore());
      
      expect(result.current.providers).toHaveLength(1);
      expect(result.current.providers[0].id).toBe('openai');
      expect(result.current.providers[0].isDefault).toBe(true);
      expect(result.current.providers[0].isActive).toBe(true);
    });

    it('uses environment API key when available', () => {
      const { result } = renderHook(() => useAIProviderStore());
      
      expect(result.current.providers[0].apiKey).toBe('test-env-key');
    });
  });

  describe('Provider Management', () => {
    it('adds a new provider', () => {
      const { result } = renderHook(() => useAIProviderStore());
      
      const newProvider = {
        id: 'anthropic',
        name: 'Anthropic',
        type: 'anthropic',
        apiKey: 'sk-ant-test',
        endpoint: 'https://api.anthropic.com',
        model: 'claude-3-haiku',
        isActive: false,
        isDefault: false,
        settings: {
          temperature: 0.7,
          maxTokens: 1000,
        },
      };
      
      act(() => {
        result.current.addProvider(newProvider);
      });
      
      expect(result.current.providers).toHaveLength(2);
      expect(result.current.providers[1]).toEqual(newProvider);
    });

    it('updates an existing provider', () => {
      const { result } = renderHook(() => useAIProviderStore());
      
      act(() => {
        result.current.updateProvider('openai', {
          name: 'Updated OpenAI',
          temperature: 0.9,
        });
      });
      
      expect(result.current.providers[0].name).toBe('Updated OpenAI');
      expect(result.current.providers[0].settings.temperature).toBe(0.9);
    });

    it('prevents deletion of default provider', () => {
      const { result } = renderHook(() => useAIProviderStore());
      
      act(() => {
        result.current.deleteProvider('openai');
      });
      
      // Should still have the provider since it's default
      expect(result.current.providers).toHaveLength(1);
      expect(result.current.providers[0].id).toBe('openai');
    });

    it('allows deletion of non-default providers', () => {
      const { result } = renderHook(() => useAIProviderStore());
      
      // Add a non-default provider first
      act(() => {
        result.current.addProvider({
          id: 'anthropic',
          name: 'Anthropic',
          isDefault: false,
        });
      });
      
      expect(result.current.providers).toHaveLength(2);
      
      // Delete the non-default provider
      act(() => {
        result.current.deleteProvider('anthropic');
      });
      
      expect(result.current.providers).toHaveLength(1);
      expect(result.current.providers[0].id).toBe('openai');
    });
  });

  describe('Default Provider Management', () => {
    it('sets a new default provider', () => {
      const { result } = renderHook(() => useAIProviderStore());
      
      // Add another provider
      act(() => {
        result.current.addProvider({
          id: 'anthropic',
          name: 'Anthropic',
          isDefault: false,
          isActive: false,
        });
      });
      
      // Set it as default
      act(() => {
        result.current.setDefaultProvider('anthropic');
      });
      
      const openaiProvider = result.current.providers.find(p => p.id === 'openai');
      const anthropicProvider = result.current.providers.find(p => p.id === 'anthropic');
      
      expect(openaiProvider.isDefault).toBe(false);
      expect(anthropicProvider.isDefault).toBe(true);
      expect(anthropicProvider.isActive).toBe(true); // Should auto-activate
    });
  });

  describe('Active State Management', () => {
    it('toggles provider active state', () => {
      const { result } = renderHook(() => useAIProviderStore());
      
      // Add another provider
      act(() => {
        result.current.addProvider({
          id: 'anthropic',
          name: 'Anthropic',
          isDefault: false,
          isActive: false,
        });
      });
      
      // Toggle it active
      act(() => {
        result.current.toggleActive('anthropic');
      });
      
      const anthropicProvider = result.current.providers.find(p => p.id === 'anthropic');
      expect(anthropicProvider.isActive).toBe(true);
    });

    it('prevents deactivating default provider', () => {
      const { result } = renderHook(() => useAIProviderStore());
      
      // Try to deactivate the default provider
      act(() => {
        result.current.toggleActive('openai');
      });
      
      // Should remain active
      expect(result.current.providers[0].isActive).toBe(true);
    });
  });

  describe('Provider Retrieval', () => {
    it('finds default provider using selector', () => {
      const { result } = renderHook(() => 
        useAIProviderStore(state => state.providers.find(p => p.isDefault))
      );
      
      expect(result.current.id).toBe('openai');
      expect(result.current.isDefault).toBe(true);
    });

    it('finds active provider using selector', () => {
      const { result } = renderHook(() => 
        useAIProviderStore(state => state.providers.find(p => p.isActive))
      );
      
      expect(result.current.id).toBe('openai');
      expect(result.current.isActive).toBe(true);
    });

    it('returns undefined when no provider matches selector', () => {
      const { result } = renderHook(() => 
        useAIProviderStore(state => state.providers.find(p => p.id === 'nonexistent'))
      );
      
      expect(result.current).toBeUndefined();
    });
  });

  describe('Bulk Operations', () => {
    it('replaces entire provider list', () => {
      const { result } = renderHook(() => useAIProviderStore());
      
      const newProviders = [
        {
          id: 'anthropic',
          name: 'Anthropic',
          type: 'anthropic',
          isDefault: true,
          isActive: true,
        },
        {
          id: 'google',
          name: 'Google AI',
          type: 'google',
          isDefault: false,
          isActive: false,
        },
      ];
      
      act(() => {
        result.current.setProviders(newProviders);
      });
      
      expect(result.current.providers).toHaveLength(2);
      expect(result.current.providers[0].id).toBe('anthropic');
      expect(result.current.providers[1].id).toBe('google');
    });
  });

  describe('Error Handling', () => {
    it('handles missing localStorage gracefully', () => {
      // Temporarily remove localStorage
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;
      
      expect(() => {
        renderHook(() => useAIProviderStore());
      }).not.toThrow();
      
      // Restore localStorage
      global.localStorage = originalLocalStorage;
    });

    it('handles invalid provider data', () => {
      const { result } = renderHook(() => useAIProviderStore());
      
      // Try to add invalid provider data
      act(() => {
        result.current.addProvider(null);
      });
      
      // Should not crash the store
      expect(result.current.providers).toHaveLength(2); // Original + null
    });
  });
});
