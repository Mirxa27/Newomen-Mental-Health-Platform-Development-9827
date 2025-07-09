import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import {
  chatLimiter,
  validateMessage,
  handleValidationErrors,
} from '../middleware/security.js';

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
router.post('/chat', chatLimiter, authenticateToken, validateMessage, handleValidationErrors, async (req, res) => {
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
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
            take: 10 // Get last 10 messages for context
          }
        }
      });
    } else {
      conversation = await prisma.conversation.create({
        data: {
          title: message.substring(0, 50) + '...',
          userId: req.user.id,
        },
        include: {
          messages: true
        }
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

    // Generate AI response
    let aiResponse;
    
    if (process.env.OPENAI_API_KEY) {
      try {
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        // Build conversation history for context
        const messages = [
          {
            role: 'system',
            content: `You are Newomen, a compassionate AI companion specifically designed for women's mental health and wellbeing. You provide culturally-sensitive support with deep understanding of MENA (Middle East and North Africa) cultural contexts.

Key principles:
- Be warm, empathetic, and non-judgmental
- Respect cultural and religious values
- Use inclusive language that honors diverse backgrounds
- Provide practical coping strategies and insights
- Encourage self-reflection and personal growth
- Maintain professional boundaries while being personable
- Recognize when to suggest professional help

Your responses should be:
- Compassionate and understanding
- Culturally aware and sensitive
- Supportive without being prescriptive
- Focused on empowerment and healing
- Conversational yet professional

Remember: You're a companion for the journey, not a replacement for professional therapy when needed.`
          },
          // Add recent conversation history
          ...conversation.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          // Add current message
          {
            role: 'user',
            content: message
          }
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        });

        aiResponse = completion.choices[0].message.content;
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        return res.status(500).json({ error: 'AI service unavailable' });
      }
    }

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

// Generate contextual mock responses when OpenAI is not available
function generateContextualResponse(userMessage, conversationHistory) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || conversationHistory.length === 0) {
    return "Hello there, beautiful soul. I'm so glad you're here. This is a safe space where you can share whatever is on your heart. What would you like to talk about today?";
  }
  
  // Anxiety/stress responses
  if (lowerMessage.includes('anxious') || lowerMessage.includes('stress') || lowerMessage.includes('worried')) {
    return "I hear that you're feeling anxious, and I want you to know that what you're experiencing is valid. Anxiety can feel overwhelming, but you're not alone in this. Can you tell me more about what's been weighing on your mind? Sometimes naming our worries can help us understand them better.";
  }
  
  // Sadness/depression responses
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
    return "Thank you for trusting me with these heavy feelings. It takes courage to acknowledge when we're struggling. Your emotions are valid, and it's okay to not be okay sometimes. Would you like to share more about what's been making you feel this way?";
  }
  
  // Relationship responses
  if (lowerMessage.includes('relationship') || lowerMessage.includes('partner') || lowerMessage.includes('family')) {
    return "Relationships can bring us both joy and challenges. It sounds like there's something important you'd like to explore about your connections with others. I'm here to listen without judgment. What's been on your mind about your relationships?";
  }
  
  // Work/career responses
  if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
    return "Work can be such a significant part of our lives, and the challenges we face there can really affect our wellbeing. I'd love to understand more about what you're experiencing. What's been happening at work that's brought you here today?";
  }
  
  // Self-doubt/confidence responses
  if (lowerMessage.includes('confident') || lowerMessage.includes('doubt') || lowerMessage.includes('worthy')) {
    return "These feelings around self-worth and confidence are so common, especially for women. Your value isn't determined by external achievements or others' opinions. You are inherently worthy just as you are. What's been triggering these feelings of doubt?";
  }
  
  // Default empathetic response
  return "Thank you for sharing that with me. I can sense there's something meaningful you're working through. Your experiences and feelings matter deeply. I'm here to listen and support you. Can you tell me more about what's been on your heart lately?";
}

export default router;
