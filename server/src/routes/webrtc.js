import express from 'express';
import { WebSocketServer } from 'ws';
import { webrtcSignalingService } from '../services/webrtcSignalingService.js';

const router = express.Router();

/**
 * WebRTC Signaling Routes
 * Handles WebSocket connections for peer-to-peer voice communication
 */

// WebSocket server for WebRTC signaling
let wss = null;

/**
 * Initialize WebSocket server
 */
export const initializeWebRTCSignaling = (server) => {
  wss = new WebSocketServer({ 
    server,
    path: '/webrtc-signaling',
    clientTracking: true,
  });

  wss.on('connection', (ws, request) => {
    console.log('New WebRTC signaling connection');
    webrtcSignalingService.handleConnection(ws, request);
  });

  wss.on('error', (error) => {
    console.error('WebRTC signaling server error:', error);
  });

  console.log('WebRTC signaling server initialized');
};

/**
 * Get WebRTC signaling statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = webrtcSignalingService.getStats();
    res.json({
      success: true,
      data: stats,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error getting WebRTC stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get WebRTC statistics',
    });
  }
});

/**
 * Get room information
 */
router.get('/rooms/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const roomInfo = webrtcSignalingService.getRoomInfo(roomId);
    
    if (!roomInfo) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
      });
    }
    
    res.json({
      success: true,
      data: roomInfo,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error getting room info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get room information',
    });
  }
});

/**
 * Get session information
 */
router.get('/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionInfo = webrtcSignalingService.getSessionInfo(sessionId);
    
    if (!sessionInfo) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    res.json({
      success: true,
      data: sessionInfo,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error getting session info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session information',
    });
  }
});

/**
 * Create a new WebRTC room
 */
router.post('/rooms', (req, res) => {
  try {
    const { roomId, userData } = req.body;
    
    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: 'Room ID is required',
      });
    }
    
    // Room will be created when first participant joins
    res.json({
      success: true,
      data: {
        roomId,
        message: 'Room ready for participants',
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create room',
    });
  }
});

/**
 * Create a new WebRTC session
 */
router.post('/sessions', (req, res) => {
  try {
    const { sessionData } = req.body;
    
    // Session will be created via WebSocket
    res.json({
      success: true,
      data: {
        message: 'Session creation initiated via WebSocket',
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create session',
    });
  }
});

/**
 * Get all active rooms
 */
router.get('/rooms', (req, res) => {
  try {
    const rooms = Array.from(webrtcSignalingService.rooms.entries()).map(([roomId, room]) => ({
      id: roomId,
      participants: room.participants.size,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
    }));
    
    res.json({
      success: true,
      data: rooms,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error getting rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rooms',
    });
  }
});

/**
 * Get all active sessions
 */
router.get('/sessions', (req, res) => {
  try {
    const sessions = Array.from(webrtcSignalingService.sessions.entries()).map(([sessionId, session]) => ({
      id: sessionId,
      participants: session.participants.size,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
    }));
    
    res.json({
      success: true,
      data: sessions,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sessions',
    });
  }
});

/**
 * Cleanup inactive rooms and sessions
 */
router.post('/cleanup', (req, res) => {
  try {
    webrtcSignalingService.cleanupInactiveRooms();
    webrtcSignalingService.cleanupInactiveSessions();
    
    res.json({
      success: true,
      data: {
        message: 'Cleanup completed',
        stats: webrtcSignalingService.getStats(),
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform cleanup',
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  try {
    const stats = webrtcSignalingService.getStats();
    const isHealthy = wss && wss.clients.size >= 0;
    
    res.json({
      success: true,
      data: {
        healthy: isHealthy,
        websocketServer: !!wss,
        stats,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
    });
  }
});

export default router;