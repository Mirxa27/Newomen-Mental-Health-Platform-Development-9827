import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token and admin role
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  });
};

// Multer config for logo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, 'logo' + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Route to upload logo
router.post('/settings/branding/logo', authenticateAdmin, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const logoUrl = `/uploads/${req.file.filename}`;

    await prisma.systemSettings.upsert({
      where: { key: 'brandingSettings' },
      update: {
        value: {
          ...((await prisma.systemSettings.findUnique({ where: { key: 'brandingSettings' } }))?.value || {}),
          logoUrl,
        }
      },
      create: {
        key: 'brandingSettings',
        value: { logoUrl },
        description: 'Branding settings for the application',
        category: 'branding',
        isPublic: true,
      },
    });

    res.json({ logoUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalConversations = await prisma.conversation.count();
    const totalMessages = await prisma.message.count();
    const totalShadowWorkSessions = await prisma.shadowWorkSession.count();
    
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const activeUsersThisMonth = await prisma.user.count({
      where: {
        conversations: {
          some: {
            updatedAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
      },
    });

    const completedShadowWorkSessions = await prisma.shadowWorkSession.count({
      where: { completed: true },
    });

    res.json({
      totalUsers,
      totalConversations,
      totalMessages,
      totalShadowWorkSessions,
      newUsersThisMonth,
      activeUsersThisMonth,
      completedShadowWorkSessions,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users with pagination
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip: offset,
      take: limit,
      include: {
        _count: {
          select: {
            conversations: true,
            shadowWorkSessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUsers = await prisma.user.count();

    res.json({
      users,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific user
router.get('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        conversations: {
          include: {
            _count: {
              select: { messages: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        shadowWorkSessions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role
router.patch('/users/:id/role', authenticateAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    // Delete user's messages first
    await prisma.message.deleteMany({
      where: {
        conversation: {
          userId: req.params.id,
        },
      },
    });

    // Delete user's conversations
    await prisma.conversation.deleteMany({
      where: { userId: req.params.id },
    });

    // Delete user's shadow work sessions
    await prisma.shadowWorkSession.deleteMany({
      where: { userId: req.params.id },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all conversations with pagination
router.get('/conversations', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const conversations = await prisma.conversation.findMany({
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const totalConversations = await prisma.conversation.count();

    res.json({
      conversations,
      totalConversations,
      currentPage: page,
      totalPages: Math.ceil(totalConversations / limit),
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation messages
router.get('/conversations/:id/messages', authenticateAdmin, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { timestamp: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system analytics
router.get('/analytics', authenticateAdmin, async (req, res) => {
  try {
    // Get user growth over last 6 months
    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month
    `;

    // Get conversation trends
    const conversationTrends = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "Conversation"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month
    `;

    // Get shadow work completion rates
    const shadowWorkStats = await prisma.shadowWorkSession.groupBy({
      by: ['completed'],
      _count: {
        completed: true,
      },
    });

    res.json({
      userGrowth,
      conversationTrends,
      shadowWorkStats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system settings
router.get('/settings', authenticateAdmin, async (req, res) => {
  try {
    // For now, return mock settings
    // In a real app, you'd store these in a database
    const settings = {
      openaiApiKey: process.env.OPENAI_API_KEY ? '***********' : 'Not set',
      jwtSecret: process.env.JWT_SECRET ? '***********' : 'Not set',
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      port: process.env.PORT || 4000,
      nodeEnv: process.env.NODE_ENV || 'development',
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Real-time metrics endpoint
router.get('/metrics/realtime', authenticateAdmin, async (req, res) => {
  try {
    // Get current timestamp for time-based queries
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Active users (users with activity in the last 15 minutes)
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(now.getTime() - 15 * 60 * 1000)
        }
      }
    });

    // Total sessions today
    const totalSessions = await prisma.conversation.count({
      where: {
        createdAt: {
          gte: new Date(now.toDateString())
        }
      }
    });

    // Average session duration (in seconds)
    const sessions = await prisma.conversation.findMany({
      where: {
        createdAt: {
          gte: last24Hours
        },
        updatedAt: {
          not: null
        }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    const averageSessionDuration = sessions.length > 0 
      ? sessions.reduce((acc, session) => {
          const duration = (session.updatedAt - session.createdAt) / 1000;
          return acc + duration;
        }, 0) / sessions.length
      : 0;

    // Messages per second (approximate based on last hour)
    const recentMessages = await prisma.message.count({
      where: {
        timestamp: {
          gte: lastHour
        }
      }
    });
    const messagesPerSecond = recentMessages / 3600; // 3600 seconds in an hour

    // System health metrics (mock implementation)
    const systemHealth = 'excellent'; // Could be calculated based on various factors
    const responseTime = Math.floor(Math.random() * 100 + 50); // Mock response time
    const cpuUsage = Math.floor(Math.random() * 30 + 20); // Mock CPU usage
    const memoryUsage = Math.floor(Math.random() * 40 + 30); // Mock memory usage
    const storageUsage = Math.floor(Math.random() * 20 + 15); // Mock storage usage

    res.json({
      activeUsers,
      totalSessions,
      averageSessionDuration: Math.round(averageSessionDuration),
      messagesPerSecond,
      systemHealth,
      responseTime,
      cpuUsage,
      memoryUsage,
      storageUsage,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;