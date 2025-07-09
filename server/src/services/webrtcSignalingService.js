import { EventEmitter } from 'events';
import { WebSocket } from 'ws';

/**
 * WebRTC Signaling Service for Peer-to-Peer Voice Communication
 * Handles connection establishment, ICE candidate exchange, and session management
 */
export class WebRTCSignalingService extends EventEmitter {
  constructor() {
    super();
    
    this.rooms = new Map(); // Room ID -> Room object
    this.connections = new Map(); // Connection ID -> WebSocket
    this.sessions = new Map(); // Session ID -> Session object
    
    // Room management
    this.roomTimeout = 300000; // 5 minutes
    this.cleanupInterval = 60000; // 1 minute
    
    // Start cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, request) {
    const connectionId = this.generateConnectionId();
    this.connections.set(connectionId, ws);
    
    console.log(`New WebRTC signaling connection: ${connectionId}`);
    
    // Setup message handler
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(connectionId, message);
      } catch (error) {
        console.error('Error parsing WebRTC message:', error);
        this.sendError(connectionId, 'Invalid message format');
      }
    });
    
    // Setup close handler
    ws.on('close', () => {
      this.handleDisconnection(connectionId);
    });
    
    // Setup error handler
    ws.on('error', (error) => {
      console.error('WebRTC signaling error:', error);
      this.handleDisconnection(connectionId);
    });
    
    // Send welcome message
    this.sendMessage(connectionId, {
      type: 'welcome',
      connectionId,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle incoming message
   */
  handleMessage(connectionId, message) {
    const { type, roomId, sessionId, data } = message;
    
    switch (type) {
      case 'join-room':
        this.handleJoinRoom(connectionId, roomId, data);
        break;
      case 'leave-room':
        this.handleLeaveRoom(connectionId, roomId);
        break;
      case 'offer':
        this.handleOffer(connectionId, roomId, data);
        break;
      case 'answer':
        this.handleAnswer(connectionId, roomId, data);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(connectionId, roomId, data);
        break;
      case 'audio-data':
        this.handleAudioData(connectionId, roomId, data);
        break;
      case 'ping':
        this.handlePing(connectionId);
        break;
      case 'create-session':
        this.handleCreateSession(connectionId, data);
        break;
      case 'join-session':
        this.handleJoinSession(connectionId, sessionId, data);
        break;
      default:
        console.log('Unknown message type:', type);
        this.sendError(connectionId, 'Unknown message type');
    }
  }

  /**
   * Handle room joining
   */
  handleJoinRoom(connectionId, roomId, userData) {
    try {
      let room = this.rooms.get(roomId);
      
      if (!room) {
        room = {
          id: roomId,
          participants: new Map(),
          createdAt: Date.now(),
          lastActivity: Date.now(),
        };
        this.rooms.set(roomId, room);
      }
      
      // Add participant to room
      room.participants.set(connectionId, {
        connectionId,
        userData,
        joinedAt: Date.now(),
        lastActivity: Date.now(),
      });
      
      room.lastActivity = Date.now();
      
      // Notify other participants
      this.broadcastToRoom(roomId, {
        type: 'participant-joined',
        connectionId,
        userData,
        timestamp: Date.now(),
      }, connectionId);
      
      // Send room info to new participant
      this.sendMessage(connectionId, {
        type: 'room-joined',
        roomId,
        participants: Array.from(room.participants.values()).map(p => ({
          connectionId: p.connectionId,
          userData: p.userData,
        })),
        timestamp: Date.now(),
      });
      
      console.log(`User joined room: ${roomId}, connection: ${connectionId}`);
      
    } catch (error) {
      console.error('Error joining room:', error);
      this.sendError(connectionId, 'Failed to join room');
    }
  }

  /**
   * Handle room leaving
   */
  handleLeaveRoom(connectionId, roomId) {
    try {
      const room = this.rooms.get(roomId);
      if (!room) return;
      
      // Remove participant from room
      room.participants.delete(connectionId);
      room.lastActivity = Date.now();
      
      // Notify other participants
      this.broadcastToRoom(roomId, {
        type: 'participant-left',
        connectionId,
        timestamp: Date.now(),
      }, connectionId);
      
      // Clean up empty rooms
      if (room.participants.size === 0) {
        this.rooms.delete(roomId);
        console.log(`Room deleted: ${roomId}`);
      }
      
      console.log(`User left room: ${roomId}, connection: ${connectionId}`);
      
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  /**
   * Handle WebRTC offer
   */
  handleOffer(connectionId, roomId, offer) {
    try {
      const room = this.rooms.get(roomId);
      if (!room) {
        this.sendError(connectionId, 'Room not found');
        return;
      }
      
      // Broadcast offer to other participants
      this.broadcastToRoom(roomId, {
        type: 'offer',
        from: connectionId,
        offer,
        timestamp: Date.now(),
      }, connectionId);
      
    } catch (error) {
      console.error('Error handling offer:', error);
      this.sendError(connectionId, 'Failed to process offer');
    }
  }

  /**
   * Handle WebRTC answer
   */
  handleAnswer(connectionId, roomId, answer) {
    try {
      const room = this.rooms.get(roomId);
      if (!room) {
        this.sendError(connectionId, 'Room not found');
        return;
      }
      
      // Broadcast answer to other participants
      this.broadcastToRoom(roomId, {
        type: 'answer',
        from: connectionId,
        answer,
        timestamp: Date.now(),
      }, connectionId);
      
    } catch (error) {
      console.error('Error handling answer:', error);
      this.sendError(connectionId, 'Failed to process answer');
    }
  }

  /**
   * Handle ICE candidate
   */
  handleIceCandidate(connectionId, roomId, candidate) {
    try {
      const room = this.rooms.get(roomId);
      if (!room) {
        this.sendError(connectionId, 'Room not found');
        return;
      }
      
      // Broadcast ICE candidate to other participants
      this.broadcastToRoom(roomId, {
        type: 'ice-candidate',
        from: connectionId,
        candidate,
        timestamp: Date.now(),
      }, connectionId);
      
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      this.sendError(connectionId, 'Failed to process ICE candidate');
    }
  }

  /**
   * Handle audio data
   */
  handleAudioData(connectionId, roomId, audioData) {
    try {
      const room = this.rooms.get(roomId);
      if (!room) return;
      
      // Broadcast audio data to other participants
      this.broadcastToRoom(roomId, {
        type: 'audio-data',
        from: connectionId,
        data: audioData,
        timestamp: Date.now(),
      }, connectionId);
      
    } catch (error) {
      console.error('Error handling audio data:', error);
    }
  }

  /**
   * Handle ping
   */
  handlePing(connectionId) {
    this.sendMessage(connectionId, {
      type: 'pong',
      timestamp: Date.now(),
    });
  }

  /**
   * Handle session creation
   */
  handleCreateSession(connectionId, sessionData) {
    try {
      const sessionId = this.generateSessionId();
      const session = {
        id: sessionId,
        creator: connectionId,
        participants: new Map(),
        createdAt: Date.now(),
        lastActivity: Date.now(),
        data: sessionData,
      };
      
      session.participants.set(connectionId, {
        connectionId,
        joinedAt: Date.now(),
        lastActivity: Date.now(),
      });
      
      this.sessions.set(sessionId, session);
      
      this.sendMessage(connectionId, {
        type: 'session-created',
        sessionId,
        session,
        timestamp: Date.now(),
      });
      
      console.log(`Session created: ${sessionId}`);
      
    } catch (error) {
      console.error('Error creating session:', error);
      this.sendError(connectionId, 'Failed to create session');
    }
  }

  /**
   * Handle session joining
   */
  handleJoinSession(connectionId, sessionId, userData) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        this.sendError(connectionId, 'Session not found');
        return;
      }
      
      // Add participant to session
      session.participants.set(connectionId, {
        connectionId,
        userData,
        joinedAt: Date.now(),
        lastActivity: Date.now(),
      });
      
      session.lastActivity = Date.now();
      
      // Notify other participants
      this.broadcastToSession(sessionId, {
        type: 'session-participant-joined',
        connectionId,
        userData,
        timestamp: Date.now(),
      }, connectionId);
      
      // Send session info to new participant
      this.sendMessage(connectionId, {
        type: 'session-joined',
        sessionId,
        session,
        timestamp: Date.now(),
      });
      
      console.log(`User joined session: ${sessionId}, connection: ${connectionId}`);
      
    } catch (error) {
      console.error('Error joining session:', error);
      this.sendError(connectionId, 'Failed to join session');
    }
  }

  /**
   * Handle disconnection
   */
  handleDisconnection(connectionId) {
    console.log(`WebRTC signaling disconnection: ${connectionId}`);
    
    // Remove from all rooms
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.participants.has(connectionId)) {
        this.handleLeaveRoom(connectionId, roomId);
      }
    }
    
    // Remove from all sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.participants.has(connectionId)) {
        session.participants.delete(connectionId);
        session.lastActivity = Date.now();
        
        // Notify other participants
        this.broadcastToSession(sessionId, {
          type: 'session-participant-left',
          connectionId,
          timestamp: Date.now(),
        }, connectionId);
        
        // Clean up empty sessions
        if (session.participants.size === 0) {
          this.sessions.delete(sessionId);
          console.log(`Session deleted: ${sessionId}`);
        }
      }
    }
    
    // Remove connection
    this.connections.delete(connectionId);
  }

  /**
   * Broadcast message to room participants
   */
  broadcastToRoom(roomId, message, excludeConnectionId = null) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    for (const [connectionId, participant] of room.participants.entries()) {
      if (connectionId !== excludeConnectionId) {
        this.sendMessage(connectionId, message);
        participant.lastActivity = Date.now();
      }
    }
    
    room.lastActivity = Date.now();
  }

  /**
   * Broadcast message to session participants
   */
  broadcastToSession(sessionId, message, excludeConnectionId = null) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    
    for (const [connectionId, participant] of session.participants.entries()) {
      if (connectionId !== excludeConnectionId) {
        this.sendMessage(connectionId, message);
        participant.lastActivity = Date.now();
      }
    }
    
    session.lastActivity = Date.now();
  }

  /**
   * Send message to specific connection
   */
  sendMessage(connectionId, message) {
    const ws = this.connections.get(connectionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message:', error);
        this.handleDisconnection(connectionId);
      }
    }
  }

  /**
   * Send error message
   */
  sendError(connectionId, error) {
    this.sendMessage(connectionId, {
      type: 'error',
      error,
      timestamp: Date.now(),
    });
  }

  /**
   * Generate unique connection ID
   */
  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start cleanup timer
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupInactiveRooms();
      this.cleanupInactiveSessions();
    }, this.cleanupInterval);
  }

  /**
   * Cleanup inactive rooms
   */
  cleanupInactiveRooms() {
    const now = Date.now();
    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.lastActivity > this.roomTimeout) {
        this.rooms.delete(roomId);
        console.log(`Cleaned up inactive room: ${roomId}`);
      }
    }
  }

  /**
   * Cleanup inactive sessions
   */
  cleanupInactiveSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.roomTimeout) {
        this.sessions.delete(sessionId);
        console.log(`Cleaned up inactive session: ${sessionId}`);
      }
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      connections: this.connections.size,
      rooms: this.rooms.size,
      sessions: this.sessions.size,
      totalParticipants: Array.from(this.rooms.values()).reduce((sum, room) => sum + room.participants.size, 0),
      totalSessionParticipants: Array.from(this.sessions.values()).reduce((sum, session) => sum + session.participants.size, 0),
    };
  }

  /**
   * Get room information
   */
  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    return {
      id: room.id,
      participants: room.participants.size,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
    };
  }

  /**
   * Get session information
   */
  getSessionInfo(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    return {
      id: session.id,
      participants: session.participants.size,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
    };
  }
}

export const webrtcSignalingService = new WebRTCSignalingService();
export default webrtcSignalingService;