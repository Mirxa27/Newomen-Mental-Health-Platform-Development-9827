import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOpenAIStore = create(
    persist(
        (set) => ({
            apiKey: '',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 1024,
            setApiKey: (apiKey) => set({ apiKey }),
            setModel: (model) => set({ model }),
            setTemperature: (temperature) => set({ temperature }),
            setMaxTokens: (maxTokens) => set({ maxTokens }),
        }),
        {
            name: 'openai-settings-storage',
        }
    )
); 