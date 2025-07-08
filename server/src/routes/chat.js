import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

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

// Get all conversations for a user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user.id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          take: 1, // Get only the latest message for preview
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific conversation with all messages
router.get('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    
    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'New Conversation',
        userId: req.user.id,
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a message to a conversation
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { content, role } = req.body;
    
    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        role,
        conversationId: req.params.id,
      },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a conversation
router.delete('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete all messages first (due to foreign key constraint)
    await prisma.message.deleteMany({
      where: { conversationId: req.params.id },
    });

    // Delete the conversation
    await prisma.conversation.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// OpenAI Chat completion endpoint
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { 
          id: conversationId,
          userId: req.user.id 
        },
      });
    } else {
      conversation = await prisma.conversation.create({
        data: {
          title: message.substring(0, 50) + '...',
          userId: req.user.id,
        },
      });
    }

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Save user message
    await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        conversationId: conversation.id,
      },
    });

    // TODO: Integrate with OpenAI API
    // For now, return a mock response
    const aiResponse = `Thank you for sharing that with me. I understand you're going through something important. As your mental health companion, I'm here to listen and support you. Can you tell me more about what's on your mind?`;

    // Save AI response
    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'assistant',
        conversationId: conversation.id,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    res.json({
      response: aiResponse,
      conversationId: conversation.id,
      messageId: aiMessage.id,
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;