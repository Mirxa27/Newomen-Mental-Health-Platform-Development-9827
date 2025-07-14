import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api'; // Ensure you have this api utility for authenticated requests

export const useChatStore = create(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      isLoading: false,
      isTyping: false,

      // Fetches all conversations for the user
      fetchConversations: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/chat/conversations');
          set({ conversations: response.data, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch conversations:', error);
          set({ isLoading: false });
        }
      },

      // Selects a conversation and fetches its full message history
      selectConversation: async (conversationId) => {
        if (!conversationId) {
          set({ currentConversation: null });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await api.get(`/chat/conversations/${conversationId}`);
          set({ currentConversation: response.data, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch conversation details:', error);
          set({ isLoading: false });
        }
      },

      // Creates a new conversation
      createConversation: async (title, firstMessage) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/chat/conversations', { title, firstMessage });
          const newConversation = response.data;

          set((state) => ({
            conversations: [newConversation, ...state.conversations],
            currentConversation: newConversation,
            isLoading: false,
          }));
          return newConversation;
        } catch (error) {
          console.error('Failed to create conversation:', error);
          set({ isLoading: false });
        }
      },

      // Sends a message and gets the AI response
      sendMessage: async (conversationId, content) => {
        if (!conversationId) {
          console.error('No conversation selected');
          return;
        }

        set({ isTyping: true });

        // Optimistic update for user's message
        const userMessage = {
          id: `temp-${Date.now()}`,
          role: 'user',
          content,
          timestamp: new Date().toISOString()
        };

        set(state => ({
          currentConversation: {
            ...state.currentConversation,
            messages: [...state.currentConversation.messages, userMessage]
          }
        }));

       try {
          const response = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
          const aiMessage = response.data;

          // Analyze emotion for user and AI messages
          const [userEmotion, aiEmotion] = await Promise.all([
            api.emotion.analyze(content).catch(() => null),
            api.emotion.analyze(aiMessage.content).catch(() => null)
          ]);

          const userMsgWithEmotion = { ...userMessage, id: `confirmed-${userMessage.id}`, emotion: userEmotion?.emotion };
          const aiMsgWithEmotion = { ...aiMessage, emotion: aiEmotion?.emotion };

          // Replace temp user message and add AI response
          set(state => ({
            isTyping: false,
            currentConversation: {
              ...state.currentConversation,
              messages: [
                ...state.currentConversation.messages.filter(m => m.id !== userMessage.id),
                userMsgWithEmotion,
                aiMsgWithEmotion
              ]
            }
          }));

        } catch (error) {
          console.error('Failed to send message:', error);
          set({ isTyping: false });
          // Optionally revert optimistic update on error
        }
      },

      // Deletes a conversation
      deleteConversation: async (conversationId) => {
        try {
          await api.delete(`/chat/conversations/${conversationId}`);
          set(state => ({
            conversations: state.conversations.filter(c => c.id !== conversationId),
            currentConversation: state.currentConversation?.id === conversationId ? null : state.currentConversation
          }));
        } catch (error) {
          console.error('Failed to delete conversation', error);
        }
      }
    }),
    {
      name: 'newomen-chat-storage',
      // partialize: (state) => ({ conversations: state.conversations })
    }
  )
);
