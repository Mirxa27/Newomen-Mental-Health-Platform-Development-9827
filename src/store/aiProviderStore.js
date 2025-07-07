import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultProviders = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    apiKey: '',
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
      addProvider: (provider) =>
        set((state) => ({ providers: [...state.providers, provider] })),
      updateProvider: (id, data) =>
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
      deleteProvider: (id) =>
        set((state) => ({
          providers: state.providers.filter((p) => p.id !== id && !p.isDefault),
        })),
      setDefaultProvider: (id) =>
        set((state) => ({
          providers: state.providers.map((p) => ({
            ...p,
            isDefault: p.id === id,
            isActive: p.id === id ? true : p.isActive,
          })),
        })),
      toggleActive: (id) =>
        set((state) => ({
          providers: state.providers.map((p) => {
            if (p.id !== id) return p;
            if (p.isDefault && p.isActive) return p; // cannot deactivate default
            return { ...p, isActive: !p.isActive };
          }),
        })),
      setProviders: (providers) => set({ providers }),
      getDefaultProvider: () => get().providers.find((p) => p.isDefault),
    }),
    { name: 'newomen-ai-providers' }
  )
);
