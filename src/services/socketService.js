import { io } from 'socket.io-client';

const URL = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:4000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(URL);

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('joinConversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('leaveConversation', conversationId);
    }
  }

  emitTyping(conversationId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on('typing', callback);
    }
  }

  off(eventName) {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }
}

export default new SocketService();