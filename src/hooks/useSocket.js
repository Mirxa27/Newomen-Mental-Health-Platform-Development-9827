import { useEffect } from 'react';
import SocketService from '../services/socketService';
import { useChatStore } from '../store/chatStore';

const useSocket = () => {
  const { addMessage, setTyping } = useChatStore();

  useEffect(() => {
    SocketService.connect();

    const handleNewMessage = (message) => {
      const { currentConversation } = useChatStore.getState();
      if (currentConversation && currentConversation.id === message.conversationId) {
        useChatStore.setState(state => ({
          currentConversation: {
            ...state.currentConversation,
            messages: [...state.currentConversation.messages, message],
          },
        }));
      }
    };

    const handleTyping = ({ isTyping }) => {
      setTyping(isTyping);
    };

    SocketService.onNewMessage(handleNewMessage);
    SocketService.onTyping(handleTyping);

    return () => {
      SocketService.off('newMessage');
      SocketService.off('typing');
      SocketService.disconnect();
    };
  }, [setTyping]);

  // Functions returned by the hook are stable
  const joinConversation = (conversationId) => SocketService.joinConversation(conversationId);
  const leaveConversation = (conversationId) => SocketService.leaveConversation(conversationId);
  const emitTyping = (conversationId, isTyping) => SocketService.emitTyping(conversationId, isTyping);

  return { joinConversation, leaveConversation, emitTyping };
};

export default useSocket;