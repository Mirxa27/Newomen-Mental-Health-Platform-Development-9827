import { useEffect, useContext } from 'react';
import SocketService from '../services/socketService';
import { useChatStore } from '../store/chatStore';

const useSocket = () => {
  const { addMessage, setTyping } = useChatStore();

  useEffect(() => {
    SocketService.connect();

    SocketService.onNewMessage((message) => {
      addMessage(message);
    });

    SocketService.onTyping(({ isTyping }) => {
      setTyping(isTyping);
    });

    return () => {
      SocketService.disconnect();
    };
  }, [addMessage, setTyping]);

  const joinConversation = (conversationId) => {
    SocketService.joinConversation(conversationId);
  };

  const leaveConversation = (conversationId) => {
    SocketService.leaveConversation(conversationId);
  };

  const emitTyping = (conversationId, isTyping) => {
    SocketService.emitTyping(conversationId, isTyping);
  };

  return { joinConversation, leaveConversation, emitTyping };
};

export default useSocket;