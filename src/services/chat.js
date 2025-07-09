const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Make authenticated API request
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || 'Request failed');
  }

  return response.json();
};

// Get all conversations for the current user
export const getConversations = async () => {
  return makeAuthenticatedRequest('/chat/conversations');
};

// Get a specific conversation with all messages
export const getConversation = async (conversationId) => {
  return makeAuthenticatedRequest(`/chat/conversations/${conversationId}`);
};

// Create a new conversation
export const createConversation = async (title) => {
  return makeAuthenticatedRequest('/chat/conversations', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
};

// Send a message to AI chat
export const sendMessage = async (message, conversationId = null) => {
  return makeAuthenticatedRequest('/chat/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversationId }),
  });
};

// Add a message to a conversation
export const addMessage = async (conversationId, content, role = 'user') => {
  return makeAuthenticatedRequest(`/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, role }),
  });
};

// Delete a conversation
export const deleteConversation = async (conversationId) => {
  return makeAuthenticatedRequest(`/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  });
};

// OpenAI Chat with streaming (for future implementation)
export const sendMessageStream = async (message, conversationId = null, onChunk) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}/chat/chat-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            onChunk(parsed);
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

export const postMessage = addMessage;