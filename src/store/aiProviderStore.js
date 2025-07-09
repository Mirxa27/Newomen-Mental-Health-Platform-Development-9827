import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const getInitialApiKey = () => {
  if (typeof window !== 'undefined') {
    const localKey = window.localStorage.getItem('newomen-openai-key');
    if (localKey) return localKey;
  }
  return import.meta.env.VITE_OPENAI_API_KEY || '';
};

const defaultProviders = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    apiKey: getInitialApiKey(),
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
  },
];

export const useAIProviderStore = create(
  persist(
    (set, get) => ({
      providers: defaultProviders,
      settings: {
        brandingSettings: {
          brandName: 'Newomen',
          logoUrl: '',
          accentColor: '#667eea',
          secondaryColor: '#764ba2',
          tagline: 'Your Journey to Self',
          favicon: '',
          customCSS: '',
        }
      },
      
      // Loading states
      isLoading: false,
      isUpdating: false,
      isDeleting: false,
      
      // Error states
      error: null,
      
      // Clear error state
      clearError: () => set({ error: null }),
      addProvider: (provider) => {
        try {
          if (!provider || !provider.id || !provider.name) {
            throw new Error('Provider must have id and name');
          }
          
          set((state) => {
            const existingProvider = state.providers.find(p => p.id === provider.id);
            if (existingProvider) {
              throw new Error('Provider with this ID already exists');
            }
            
            return { 
              providers: [...state.providers, provider],
              error: null
            };
          });
        } catch (error) {
          set({ error: error.message || 'Failed to add provider' });
          throw error;
        }
      },
      
      updateProvider: (id, data) => {
        try {
          set((state) => {
            const providerExists = state.providers.some(p => p.id === id);
            if (!providerExists) {
              throw new Error('Provider not found');
            }
            
            return {
              providers: state.providers.map((p) =>
                p.id === id ? { ...p, ...data } : p
              ),
              error: null
            };
          });
        } catch (error) {
          set({ error: error.message || 'Failed to update provider' });
          throw error;
        }
      },
      
      deleteProvider: (id) => {
        try {
          set((state) => {
            const provider = state.providers.find(p => p.id === id);
            if (!provider) {
              throw new Error('Provider not found');
            }
            
            if (provider.isDefault) {
              throw new Error('Cannot delete default provider');
            }
            
            return {
              providers: state.providers.filter((p) => p.id !== id),
              error: null
            };
          });
        } catch (error) {
          set({ error: error.message || 'Failed to delete provider' });
          throw error;
        }
      },
      
      setDefaultProvider: (id) => {
        try {
          set((state) => {
            const provider = state.providers.find(p => p.id === id);
            if (!provider) {
              throw new Error('Provider not found');
            }
            
            return {
              providers: state.providers.map((p) => ({
                ...p,
                isDefault: p.id === id,
                isActive: p.id === id ? true : p.isActive,
              })),
              error: null
            };
          });
        } catch (error) {
          set({ error: error.message || 'Failed to set default provider' });
          throw error;
        }
      },
      
      toggleActive: (id) => {
        try {
          set((state) => {
            const provider = state.providers.find(p => p.id === id);
            if (!provider) {
              throw new Error('Provider not found');
            }
            
            if (provider.isDefault && provider.isActive) {
              throw new Error('Cannot deactivate default provider');
            }
            
            return {
              providers: state.providers.map((p) => {
                if (p.id !== id) return p;
                return { ...p, isActive: !p.isActive };
              }),
              error: null
            };
          });
        } catch (error) {
          set({ error: error.message || 'Failed to toggle provider status' });
          throw error;
        }
      },
      
      setProviders: (providers) => {
        try {
          if (!Array.isArray(providers)) {
            throw new Error('Providers must be an array');
          }
          
          set({ providers, error: null });
        } catch (error) {
          set({ error: error.message || 'Failed to set providers' });
          throw error;
        }
      },
      
      getDefaultProvider: () => {
        try {
          const defaultProvider = get().providers.find((p) => p.isDefault);
          if (!defaultProvider) {
            throw new Error('No default provider found');
          }
          return defaultProvider;
        } catch (error) {
          set({ error: error.message || 'Failed to get default provider' });
          return null;
        }
      },
      
      updateSettings: (newSettings) => {
        try {
          if (!newSettings || typeof newSettings !== 'object') {
            throw new Error('Settings must be an object');
          }
          
          set((state) => ({
            settings: {
              ...state.settings,
              ...newSettings,
            },
            error: null
          }));
        } catch (error) {
          set({ error: error.message || 'Failed to update settings' });
          throw error;
        }
      },
    }),
    { name: 'newomen-ai-providers' }
  )
);
