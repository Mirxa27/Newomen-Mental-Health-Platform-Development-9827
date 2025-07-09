import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import openaiService from '../services/openaiService.js';

const router = express.Router();
const prisma = new PrismaClient();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Simplified endpoint to handle sending a message and getting a response
router.post('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const { id: userId } = req.user;
    const { io } = req; // Get io instance from request

    // 1. Verify user has access to the conversation
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // 2. Save the user's message
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: 'user',
        conversationId,
      },
    });

    // Emit user message to the conversation room
    io.to(conversationId).emit('newMessage', userMessage);
    io.to(conversationId).emit('typing', { isTyping: true });

    // 3. Generate AI response using the new service
    const aiResponseContent = await openaiService.generateResponse(conversationId, content);

    io.to(conversationId).emit('typing', { isTyping: false });

    // 4. Save the AI's message
    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponseContent,
        role: 'assistant',
        conversationId,
      },
    });

    // Emit AI message to the conversation room
    io.to(conversationId).emit('newMessage', aiMessage);

    // 5. Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // 6. Return the AI's response
    res.status(201).json(aiMessage);

  } catch (error) {
    console.error('Error in chat message endpoint:', error);
    res.status(500).json({ error: 'An internal error occurred.' });
  }
});

// Create a new conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { title, firstMessage } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'New Conversation',
        userId: req.user.id,
      },
    });

    if (firstMessage) {
      // Save user's first message
      await prisma.message.create({
        data: {
          content: firstMessage,
          role: 'user',
          conversationId: conversation.id,
        },
      });

      // Generate and save AI's first response
      const aiResponseContent = await openaiService.generateResponse(conversation.id, firstMessage);
      await prisma.message.create({
        data: {
          content: aiResponseContent,
          role: 'assistant',
          conversationId: conversation.id,
        },
      });

      // Refetch conversation with messages
      const fullConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
        include: { messages: true },
      });

      return res.status(201).json(fullConversation);
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all conversations for a user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { messages: true },
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
      where: { id: req.params.id, userId: req.user.id },
      include: { messages: { orderBy: { timestamp: 'asc' } } },
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

// Delete a conversation
router.delete('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await prisma.conversation.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
