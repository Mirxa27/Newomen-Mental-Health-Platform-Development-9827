import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,
  isTyping: false,
  isListening: false,
  isSpeaking: false,
  emotionState: 'neutral',
  
  addMessage: (message) => {
    set((state) => {
      const conversations = [...state.conversations];
      const currentIndex = conversations.findIndex(c => c.id === state.currentConversation?.id);
      
      if (currentIndex >= 0) {
        conversations[currentIndex] = {
          ...conversations[currentIndex],
          messages: [...conversations[currentIndex].messages, message],
          updatedAt: new Date().toISOString(),
        };
      }
      
      return {
        conversations,
        currentConversation: conversations[currentIndex] || state.currentConversation,
      };
    });
  },
  
  createConversation: (title = 'New Conversation') => {
    const newConversation = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emotionContext: {},
    };
    
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      currentConversation: newConversation,
    }));
    
    return newConversation;
  },
  
  selectConversation: (conversationId) => {
    set((state) => ({
      currentConversation: state.conversations.find(c => c.id === conversationId) || null,
    }));
  },
  
  deleteConversation: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.filter(c => c.id !== conversationId),
      currentConversation: state.currentConversation?.id === conversationId ? null : state.currentConversation,
    }));
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  setTyping: (typing) => set({ isTyping: typing }),
  setListening: (listening) => set({ isListening: listening }),
  setSpeaking: (speaking) => set({ isSpeaking: speaking }),
  setEmotionState: (emotion) => set({ emotionState: emotion }),
  
  updateConversationEmotion: (emotion, intensity) => {
    set((state) => {
      if (!state.currentConversation) return state;
      
      const conversations = [...state.conversations];
      const currentIndex = conversations.findIndex(c => c.id === state.currentConversation.id);
      
      if (currentIndex >= 0) {
        conversations[currentIndex] = {
          ...conversations[currentIndex],
          emotionContext: {
            ...conversations[currentIndex].emotionContext,
            [emotion]: intensity,
            lastUpdated: new Date().toISOString(),
          },
        };
      }
      
      return {
        conversations,
        currentConversation: conversations[currentIndex] || state.currentConversation,
      };
    });
  },
}));