import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket.id
    this.userSockets = new Map(); // socket.id -> userId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use(this.authenticateSocket);
    this.io.on('connection', this.handleConnection.bind(this));
    
    console.log('Socket.IO server initialized');
  }

  authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  }

  async handleConnection(socket) {
    const userId = socket.userId;
    
    try {
      // Store connection
      this.connectedUsers.set(userId, socket.id);
      this.userSockets.set(socket.id, userId);
      
      // Update user's active session
      await prisma.activeSession.upsert({
        where: { userId },
        update: {
          socketId: socket.id,
          isActive: true,
          lastActivity: new Date(),
          userAgent: socket.handshake.headers['user-agent'] || null,
          ipAddress: socket.handshake.address || null
        },
        create: {
          userId,
          socketId: socket.id,
          isActive: true,
          lastActivity: new Date(),
          userAgent: socket.handshake.headers['user-agent'] || null,
          ipAddress: socket.handshake.address || null
        }
      });

      console.log(`User ${userId} connected with socket ${socket.id}`);
      
      // Send welcome message
      socket.emit('connected', {
        message: 'Connected successfully',
        userId: userId,
        timestamp: new Date()
      });

      // Join user to their personal room
      socket.join(`user_${userId}`);

      // Handle different event types
      socket.on('typing', this.handleTyping.bind(this, socket));
      socket.on('stop_typing', this.handleStopTyping.bind(this, socket));
      socket.on('message_read', this.handleMessageRead.bind(this, socket));
      socket.on('join_conversation', this.handleJoinConversation.bind(this, socket));
      socket.on('leave_conversation', this.handleLeaveConversation.bind(this, socket));
      socket.on('user_activity', this.handleUserActivity.bind(this, socket));
      socket.on('voice_session_start', this.handleVoiceSessionStart.bind(this, socket));
      socket.on('voice_session_end', this.handleVoiceSessionEnd.bind(this, socket));
      socket.on('crisis_alert', this.handleCrisisAlert.bind(this, socket));
      
      // Handle disconnection
      socket.on('disconnect', this.handleDisconnection.bind(this, socket));

    } catch (error) {
      console.error('Error handling connection:', error);
      socket.emit('error', { message: 'Connection error' });
    }
  }

  handleTyping(socket, data) {
    const { conversationId } = data;
    const userId = this.userSockets.get(socket.id);
    
    if (conversationId) {
      // Broadcast typing indicator to conversation participants
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId,
        conversationId,
        timestamp: new Date()
      });
    }
  }

  handleStopTyping(socket, data) {
    const { conversationId } = data;
    const userId = this.userSockets.get(socket.id);
    
    if (conversationId) {
      socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
        userId,
        conversationId,
        timestamp: new Date()
      });
    }
  }

  handleMessageRead(socket, data) {
    const { messageId, conversationId } = data;
    const userId = this.userSockets.get(socket.id);
    
    // Update message read status (if you want to track this)
    socket.to(`conversation_${conversationId}`).emit('message_read', {
      messageId,
      userId,
      conversationId,
      timestamp: new Date()
    });
  }

  handleJoinConversation(socket, data) {
    const { conversationId } = data;
    const userId = this.userSockets.get(socket.id);
    
    // Join conversation room
    socket.join(`conversation_${conversationId}`);
    
    // Notify others in the conversation
    socket.to(`conversation_${conversationId}`).emit('user_joined_conversation', {
      userId,
      conversationId,
      timestamp: new Date()
    });
  }

  handleLeaveConversation(socket, data) {
    const { conversationId } = data;
    const userId = this.userSockets.get(socket.id);
    
    // Leave conversation room
    socket.leave(`conversation_${conversationId}`);
    
    // Notify others in the conversation
    socket.to(`conversation_${conversationId}`).emit('user_left_conversation', {
      userId,
      conversationId,
      timestamp: new Date()
    });
  }

  async handleUserActivity(socket, data) {
    const userId = this.userSockets.get(socket.id);
    
    try {
      // Update last activity
      await prisma.activeSession.update({
        where: { userId },
        data: { lastActivity: new Date() }
      });
      
      // Update user analytics
      await prisma.userAnalytics.upsert({
        where: { userId },
        update: { lastActiveAt: new Date() },
        create: {
          userId,
          lastActiveAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }

  async handleVoiceSessionStart(socket, data) {
    const userId = this.userSockets.get(socket.id);
    const { sessionId, conversationId } = data;
    
    try {
      // Update voice session status
      await prisma.voiceSession.update({
        where: { id: sessionId },
        data: { status: 'active' }
      });
      
      // Notify conversation participants
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit('voice_session_started', {
          userId,
          sessionId,
          conversationId,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error handling voice session start:', error);
    }
  }

  async handleVoiceSessionEnd(socket, data) {
    const userId = this.userSockets.get(socket.id);
    const { sessionId, conversationId, duration } = data;
    
    try {
      // Update voice session
      await prisma.voiceSession.update({
        where: { id: sessionId },
        data: {
          status: 'ended',
          duration: duration || 0,
          endedAt: new Date()
        }
      });
      
      // Update user analytics
      await prisma.userAnalytics.upsert({
        where: { userId },
        update: {
          totalVoiceMinutes: {
            increment: Math.floor((duration || 0) / 60)
          }
        },
        create: {
          userId,
          totalVoiceMinutes: Math.floor((duration || 0) / 60)
        }
      });
      
      // Notify conversation participants
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit('voice_session_ended', {
          userId,
          sessionId,
          conversationId,
          duration,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error handling voice session end:', error);
    }
  }

  async handleCrisisAlert(socket, data) {
    const userId = this.userSockets.get(socket.id);
    const { alertId, severity } = data;
    
    try {
      // Notify admin users about crisis alert
      const adminUsers = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { id: true }
      });
      
      adminUsers.forEach(admin => {
        const adminSocketId = this.connectedUsers.get(admin.id);
        if (adminSocketId) {
          this.io.to(adminSocketId).emit('crisis_alert', {
            alertId,
            userId,
            severity,
            timestamp: new Date()
          });
        }
      });
      
      // Also notify counselors if available
      const counselors = await prisma.user.findMany({
        where: { role: 'counsellor' },
        select: { id: true }
      });
      
      counselors.forEach(counselor => {
        const counselorSocketId = this.connectedUsers.get(counselor.id);
        if (counselorSocketId) {
          this.io.to(counselorSocketId).emit('crisis_alert', {
            alertId,
            userId,
            severity,
            timestamp: new Date()
          });
        }
      });
    } catch (error) {
      console.error('Error handling crisis alert:', error);
    }
  }

  async handleDisconnection(socket) {
    const userId = this.userSockets.get(socket.id);
    
    if (userId) {
      try {
        // Remove from maps
        this.connectedUsers.delete(userId);
        this.userSockets.delete(socket.id);
        
        // Update active session
        await prisma.activeSession.update({
          where: { userId },
          data: {
            isActive: false,
            lastActivity: new Date()
          }
        });
        
        console.log(`User ${userId} disconnected`);
      } catch (error) {
        console.error('Error handling disconnection:', error);
      }
    }
  }

  // Public methods for sending messages
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  sendToConversation(conversationId, event, data) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  sendNotification(userId, notification) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
      return true;
    }
    return false;
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  getConnectionCount() {
    return this.connectedUsers.size;
  }

  // Clean up inactive sessions periodically
  async cleanupInactiveSessions() {
    const inactiveThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes
    
    try {
      await prisma.activeSession.updateMany({
        where: {
          lastActivity: { lt: inactiveThreshold },
          isActive: true
        },
        data: { isActive: false }
      });
    } catch (error) {
      console.error('Error cleaning up inactive sessions:', error);
    }
  }
}

export default new SocketService();