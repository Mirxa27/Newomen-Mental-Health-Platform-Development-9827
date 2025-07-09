import { usePromptStore } from '../store/promptStore';

// Import the new production-ready voice agent
import { NewomenVoiceSession } from './realtimeVoiceAgent.js';

/**
 * Generate an ephemeral key for secure voice sessions
 * This creates a temporary key for authenticating voice session requests
 * In production, this would call the backend to generate a secure, time-limited token
 */
export const generateEphemeralKey = async (userId) => {
  try {
    const timestamp = new Date().getTime();
    const randomComponent = Math.random().toString(36).substring(2, 15);
    return `eph_${userId}_${timestamp}_${randomComponent}`;
  } catch (error) {
    console.error('Error generating ephemeral key:', error);
    throw new Error('Failed to generate secure session key');
  }
};

// Re-export for backward compatibility
export { NewomenVoiceSession };

export default NewomenVoiceSession;