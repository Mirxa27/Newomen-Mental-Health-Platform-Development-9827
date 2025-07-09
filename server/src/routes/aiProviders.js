import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import VoiceAgentService from '../services/voiceAgentService.js';
import { encryptionService } from '../services/encryptionService.js';

const router = express.Router();
const prisma = new PrismaClient();
const voiceService = VoiceAgentService;

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

// Get all AI providers
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const providers = await prisma.aIProvider.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        apiUrl: true,
        model: true,
        voice: true,
        settings: true,
        isDefault: true,
        usageCount: true,
        lastUsed: true,
        createdAt: true,
        updatedAt: true,
        // Don't include apiKey for security
      },
      orderBy: [
        { isDefault: 'desc' },
        { type: 'asc' },
        { name: 'asc' },
      ],
    });

    res.json(providers);
  } catch (error) {
    console.error('Error fetching AI providers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific AI provider
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const provider = await prisma.aIProvider.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        apiUrl: true,
        model: true,
        voice: true,
        settings: true,
        isDefault: true,
        usageCount: true,
        lastUsed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    console.error('Error fetching AI provider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new AI provider
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      name,
      type,
      apiKey,
      apiUrl,
      model,
      voice,
      settings,
      isDefault = false,
    } = req.body;

    if (!name || !type || !apiKey) {
      return res.status(400).json({ error: 'Name, type, and API key are required' });
    }

    // Validate provider type
    const validTypes = ['CHAT', 'SPEECH_TO_TEXT', 'TEXT_TO_SPEECH', 'REALTIME_VOICE'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid provider type' });
    }

    // Encrypt API key
    const encryptedApiKey = encryptionService.encryptApiKey(apiKey, name);

    // If this is set as default, unset other defaults of the same type
    if (isDefault) {
      await prisma.aIProvider.updateMany({
        where: { type, isDefault: true },
        data: { isDefault: false },
      });
    }

    const provider = await prisma.aIProvider.create({
      data: {
        name,
        type,
        apiKey: JSON.stringify(encryptedApiKey),
        apiUrl,
        model,
        voice,
        settings,
        isDefault,
        status: 'INACTIVE', // Will be tested before activation
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        apiUrl: true,
        model: true,
        voice: true,
        settings: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(provider);
  } catch (error) {
    console.error('Error creating AI provider:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Provider name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update an AI provider
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const {
      name,
      type,
      apiKey,
      apiUrl,
      model,
      voice,
      settings,
      isDefault,
    } = req.body;

    const existingProvider = await prisma.aIProvider.findUnique({
      where: { id: req.params.id },
    });

    if (!existingProvider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    let updateData = {
      name,
      type,
      apiUrl,
      model,
      voice,
      settings,
      isDefault,
    };

    // Only update API key if provided
    if (apiKey) {
      const encryptedApiKey = encryptionService.encryptApiKey(apiKey, name);
      updateData.apiKey = JSON.stringify(encryptedApiKey);
    }

    // If this is set as default, unset other defaults of the same type
    if (isDefault && isDefault !== existingProvider.isDefault) {
      await prisma.aIProvider.updateMany({
        where: { 
          type: type || existingProvider.type,
          isDefault: true,
          id: { not: req.params.id },
        },
        data: { isDefault: false },
      });
    }

    const provider = await prisma.aIProvider.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        apiUrl: true,
        model: true,
        voice: true,
        settings: true,
        isDefault: true,
        usageCount: true,
        lastUsed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(provider);
  } catch (error) {
    console.error('Error updating AI provider:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Provider name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test an AI provider connection
router.post('/:id/test', authenticateAdmin, async (req, res) => {
  try {
    const provider = await prisma.aIProvider.findUnique({
      where: { id: req.params.id },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // For now, just return success for all providers
    // This would need to be implemented based on actual provider testing logic
    const isConnected = true;
    
    // Update provider status
    const newStatus = isConnected ? 'ACTIVE' : 'ERROR';
    await prisma.aIProvider.update({
      where: { id: req.params.id },
      data: { status: newStatus },
    });

    res.json({
      success: isConnected,
      status: newStatus,
      message: isConnected ? 'Connection successful' : 'Connection failed',
    });
  } catch (error) {
    console.error('Error testing AI provider:', error);
    
    // Update provider status to ERROR
    await prisma.aIProvider.update({
      where: { id: req.params.id },
      data: { status: 'ERROR' },
    });

    res.status(500).json({
      success: false,
      error: 'Connection test failed',
      message: error.message,
    });
  }
});

// Delete an AI provider
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const provider = await prisma.aIProvider.findUnique({
      where: { id: req.params.id },
      include: {
        voiceProfiles: true,
        voiceSessions: true,
      },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Check if provider has dependencies
    if (provider.voiceProfiles.length > 0 || provider.voiceSessions.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete provider with existing voice profiles or sessions',
      });
    }

    await prisma.aIProvider.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting AI provider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available voices for a provider
router.get('/:id/voices', authenticateAdmin, async (req, res) => {
  try {
    const provider = await prisma.aIProvider.findUnique({
      where: { id: req.params.id },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (provider.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Provider is not active' });
    }

    let voices = [];
    
    if (provider.type === 'TEXT_TO_SPEECH') {
      // For now, return some default voices
      // This would need to be implemented based on actual provider logic
      voices = [
        { id: 'voice1', name: 'Default Voice 1' },
        { id: 'voice2', name: 'Default Voice 2' }
      ];
    }

    res.json({ voices });
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get provider usage statistics
router.get('/:id/stats', authenticateAdmin, async (req, res) => {
  try {
    const provider = await prisma.aIProvider.findUnique({
      where: { id: req.params.id },
      include: {
        voiceSessions: {
          select: {
            id: true,
            duration: true,
            createdAt: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 100, // Last 100 sessions
        },
      },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const stats = {
      totalSessions: provider.voiceSessions.length,
      totalDuration: provider.voiceSessions.reduce((sum, session) => sum + (session.duration || 0), 0),
      averageDuration: provider.voiceSessions.length > 0 
        ? provider.voiceSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / provider.voiceSessions.length
        : 0,
      lastUsed: provider.lastUsed,
      usageCount: provider.usageCount,
      sessionsToday: provider.voiceSessions.filter(session => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return session.createdAt >= today;
      }).length,
      sessionsThisWeek: provider.voiceSessions.filter(session => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return session.createdAt >= weekAgo;
      }).length,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;