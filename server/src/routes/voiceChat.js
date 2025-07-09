import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { VoiceAgentService, EncryptionService } from '../services/voiceAgentService.js';

const router = express.Router();
const prisma = new PrismaClient();
const voiceService = new VoiceAgentService();
const encryption = new EncryptionService();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get user's voice profiles
router.get('/profiles', authenticateToken, async (req, res) => {
  try {
    const profiles = await prisma.voiceProfile.findMany({
      where: { userId: req.user.id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    res.json(profiles);
  } catch (error) {
    console.error('Error fetching voice profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new voice profile
router.post('/profiles', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      providerId,
      voiceId,
      settings,
      isDefault = false,
    } = req.body;

    if (!name || !providerId || !voiceId) {
      return res.status(400).json({ error: 'Name, provider ID, and voice ID are required' });
    }

    // Verify provider exists and is active
    const provider = await prisma.aIProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (provider.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Provider is not active' });
    }

    // If this is set as default, unset other defaults for this user
    if (isDefault) {
      await prisma.voiceProfile.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const profile = await prisma.voiceProfile.create({
      data: {
        name,
        userId: req.user.id,
        providerId,
        voiceId,
        settings,
        isDefault,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating voice profile:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Voice profile name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start a voice session
router.post('/sessions/start', authenticateToken, async (req, res) => {
  try {
    const {
      conversationId,
      profileId,
      providerName,
      userContext,
    } = req.body;

    let provider;
    let voiceProfile;

    // Get provider either by profile or by name
    if (profileId) {
      voiceProfile = await prisma.voiceProfile.findFirst({
        where: { 
          id: profileId,
          userId: req.user.id 
        },
        include: { provider: true },
      });

      if (!voiceProfile) {
        return res.status(404).json({ error: 'Voice profile not found' });
      }

      provider = voiceProfile.provider;
    } else {
      // Get default provider for REALTIME_VOICE
      provider = await prisma.aIProvider.findFirst({
        where: { 
          type: 'REALTIME_VOICE',
          status: 'ACTIVE',
          isDefault: true,
        },
      });

      if (!provider) {
        return res.status(404).json({ error: 'No active voice provider found' });
      }
    }

    if (provider.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Provider is not active' });
    }

    // Decrypt API key
    const encryptedApiKey = JSON.parse(provider.apiKey);
    const apiKey = encryption.decrypt(encryptedApiKey);

    // Create provider instance
    const config = {
      type: provider.type,
      apiKey,
      apiUrl: provider.apiUrl,
      model: provider.model,
      voice: voiceProfile?.voiceId || provider.voice,
      settings: {
        ...provider.settings,
        ...voiceProfile?.settings,
      },
    };

    let providerInstance;
    switch (provider.type) {
      case 'REALTIME_VOICE':
        providerInstance = VoiceAgentService.createOpenAIProvider(config);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported provider type for voice sessions' });
    }

    // Register provider if not already registered
    if (!voiceService.getProvider(provider.name)) {
      voiceService.registerProvider(provider.name, providerInstance.constructor, config);
    }

    // Start voice session
    const sessionData = await voiceService.startVoiceSession(provider.name, {
      userContext: {
        name: req.user.name,
        language: userContext?.language || 'en',
        culturalContext: userContext?.culturalContext || 'MENA',
        ...userContext,
      },
    });

    // Create session record in database
    const session = await prisma.voiceSession.create({
      data: {
        userId: req.user.id,
        conversationId,
        providerId: provider.id,
        sessionId: sessionData.sessionId,
        status: 'active',
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // Update provider usage
    await prisma.aIProvider.update({
      where: { id: provider.id },
      data: {
        usageCount: { increment: 1 },
        lastUsed: new Date(),
      },
    });

    res.status(201).json({
      session,
      sessionData,
      config: sessionData.config,
    });
  } catch (error) {
    console.error('Error starting voice session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End a voice session
router.post('/sessions/:sessionId/end', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { transcript, duration } = req.body;

    // Find session in database
    const session = await prisma.voiceSession.findFirst({
      where: {
        sessionId,
        userId: req.user.id,
        status: 'active',
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    // End session in voice service
    try {
      await voiceService.endVoiceSession(sessionId);
    } catch (error) {
      console.error('Error ending voice session:', error);
      // Continue with database update even if service call fails
    }

    // Update session record
    const updatedSession = await prisma.voiceSession.update({
      where: { id: session.id },
      data: {
        status: 'ended',
        duration,
        transcript,
        endedAt: new Date(),
      },
    });

    res.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    console.error('Error ending voice session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's voice sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const sessions = await prisma.voiceSession.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        conversation: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: parseInt(limit),
    });

    const totalSessions = await prisma.voiceSession.count({ where });

    res.json({
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalSessions,
        totalPages: Math.ceil(totalSessions / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching voice sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific voice session
router.get('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const session = await prisma.voiceSession.findFirst({
      where: {
        sessionId: req.params.sessionId,
        userId: req.user.id,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        conversation: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching voice session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available providers for voice chat
router.get('/providers', authenticateToken, async (req, res) => {
  try {
    const providers = await prisma.aIProvider.findMany({
      where: {
        type: 'REALTIME_VOICE',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        type: true,
        model: true,
        voice: true,
        isDefault: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });

    res.json(providers);
  } catch (error) {
    console.error('Error fetching voice providers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update voice profile
router.put('/profiles/:id', authenticateToken, async (req, res) => {
  try {
    const { name, voiceId, settings, isDefault } = req.body;

    const existingProfile = await prisma.voiceProfile.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingProfile) {
      return res.status(404).json({ error: 'Voice profile not found' });
    }

    // If this is set as default, unset other defaults for this user
    if (isDefault && isDefault !== existingProfile.isDefault) {
      await prisma.voiceProfile.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const profile = await prisma.voiceProfile.update({
      where: { id: req.params.id },
      data: {
        name,
        voiceId,
        settings,
        isDefault,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
    });

    res.json(profile);
  } catch (error) {
    console.error('Error updating voice profile:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Voice profile name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete voice profile
router.delete('/profiles/:id', authenticateToken, async (req, res) => {
  try {
    const profile = await prisma.voiceProfile.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Voice profile not found' });
    }

    await prisma.voiceProfile.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting voice profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;