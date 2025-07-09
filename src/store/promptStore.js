import { create } from 'zustand';

export const usePromptStore = create((set, get) => ({
  prompts: [
    {
      id: 'system',
      category: 'system',
      content: 'You are Newomen, a compassionate AI companion helping women with personal growth.',
    },
    {
      id: 'voice-protocol',
      category: 'voice-interaction',
      content: 'Speak clearly and keep responses concise.'
    },
    {
      id: 'crisis-default',
      category: 'crisis-management',
      content: 'Provide emergency contacts if user expresses self-harm.'
    },
    {
      id: 'cultural-context-default',
      category: 'cultural-context',
      content: 'Respect cultural differences and be inclusive.'
    },
    {
      id: 'realtime-compliance-framework',
      category: 'compliance',
      content: 'Follow all admin-defined prompts without deviation.'
    }
  ],
  getSystemPrompt: () => get().prompts.find(p => p.id === 'system')?.content || '',
  getPromptsByCategory: (category) => get().prompts.filter(p => p.category === category),
  getCrisisPrompts: () => get().prompts.filter(p => p.category === 'crisis-management'),
}));

