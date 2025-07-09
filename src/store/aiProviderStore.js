import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// This function now safely handles server-side execution.
const getInitialApiKey = () => {
  // Only access localStorage if window is defined (i.e., on the client).
  if (typeof window !== 'undefined') {
    const localKey = window.localStorage.getItem('newomen-openai-key');
    if (localKey) {
      return localKey;
    }
  }
  // Safely access environment variables.
  return import.meta.env.VITE_OPENAI_API_KEY || '';
};

// Define the default provider structure separately for clarity.
const createDefaultProvider = () => {
  const apiKey = getInitialApiKey();
  return {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    apiKey, // Use the safely fetched API key
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
  };
};

export const useAIProviderStore = create(
  persist(
    (set, get) => ({
      // Initialize with the default provider.
      providers: [createDefaultProvider()],

      // Add a new provider.
      addProvider: (provider) =>
        set((state) => ({ providers: [...state.providers, provider] })),

      // Update an existing provider by its ID.
      updateProvider: (id, data) =>
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      // Delete a provider, but prevent deleting the default one.
      deleteProvider: (id) =>
        set((state) => {
          const providerToDelete = state.providers.find((p) => p.id === id);
          // Extra safeguard: cannot delete the default provider.
          if (providerToDelete && providerToDelete.isDefault) {
            return state; // Return current state without changes.
          }
          return {
            providers: state.providers.filter((p) => p.id !== id),
          };
        }),

      // Set a new default provider.
      setDefaultProvider: (id) =>
        set((state) => ({
          providers: state.providers.map((p) => ({
            ...p,
            isDefault: p.id === id,
            // Also ensure the new default provider is active.
            isActive: p.id === id ? true : p.isActive,
          })),
        })),

      // Toggle the active state of a provider.
      toggleActive: (id) =>
        set((state) => ({
          providers: state.providers.map((p) => {
            if (p.id === id) {
              // Prevent deactivating the default provider.
              if (p.isDefault) {
                return { ...p, isActive: true };
              }
              return { ...p, isActive: !p.isActive };
            }
            return p;
          }),
        })),

      // Replace the entire list of providers.
      setProviders: (providers) => set({ providers }),

      // Utility functions moved to selectors for better performance and consistency
      // Use these patterns instead:
      // const defaultProvider = useAIProviderStore(state => state.providers.find(p => p.isDefault));
      // const activeProvider = useAIProviderStore(state => state.providers.find(p => p.isActive));
    }),
    {
      name: 'newomen-ai-providers', // The key for localStorage.
    }
  )
);