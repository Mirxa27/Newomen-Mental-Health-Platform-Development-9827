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

// Shadow work questions database
const shadowWorkQuestions = [
  {
    id: '1',
    category: 'Self-Reflection',
    question: 'What aspect of yourself do you try to hide from others?',
    description: 'This question helps you identify parts of yourself that you might be suppressing or denying.',
    followUp: 'How might accepting this aspect of yourself change your relationships?'
  },
  {
    id: '2',
    category: 'Emotional Patterns',
    question: 'What emotion do you find most difficult to express?',
    description: 'Understanding suppressed emotions is key to shadow work.',
    followUp: 'When did you first learn that this emotion was "bad" or "wrong"?'
  },
  {
    id: '3',
    category: 'Projection',
    question: 'What quality in others irritates you most?',
    description: 'Often, what bothers us in others reflects our own rejected qualities.',
    followUp: 'How might this quality exist within you in some form?'
  },
  {
    id: '4',
    category: 'Inner Child',
    question: 'What did you need as a child that you didn\'t receive?',
    description: 'Childhood unmet needs often form our shadow patterns.',
    followUp: 'How are you still seeking this need to be met today?'
  },
  {
    id: '5',
    category: 'Limiting Beliefs',
    question: 'What belief about yourself do you hold that might not be true?',
    description: 'Examining core beliefs reveals hidden limitations.',
    followUp: 'Where did this belief come from, and how has it served you?'
  },
  {
    id: '6',
    category: 'Relationships',
    question: 'What patterns keep repeating in your relationships?',
    description: 'Relationship patterns often reflect our unconscious programming.',
    followUp: 'What would change if you took full responsibility for these patterns?'
  },
  {
    id: '7',
    category: 'Fear',
    question: 'What would you do if you knew you couldn\'t fail?',
    description: 'This reveals fears that may be holding you back.',
    followUp: 'What\'s the worst that could actually happen if you tried?'
  },
  {
    id: '8',
    category: 'Authenticity',
    question: 'When do you feel most like yourself?',
    description: 'Understanding your authentic self helps identify when you\'re in shadow.',
    followUp: 'What prevents you from being this authentic self more often?'
  }
];

// Get all shadow work questions
router.get('/questions', authenticateToken, async (req, res) => {
  try {
    res.json(shadowWorkQuestions);
  } catch (error) {
    console.error('Error fetching shadow work questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific shadow work question
router.get('/questions/:id', authenticateToken, async (req, res) => {
  try {
    const question = shadowWorkQuestions.find(q => q.id === req.params.id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching shadow work question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's shadow work sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await prisma.shadowWorkSession.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching shadow work sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific shadow work session
router.get('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const session = await prisma.shadowWorkSession.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching shadow work session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update a shadow work session
router.post('/sessions', authenticateToken, async (req, res) => {
  try {
    const { questionId, response, insights } = req.body;
    
    if (!questionId || !response) {
      return res.status(400).json({ error: 'Question ID and response are required' });
    }

    // Check if session already exists for this user and question
    const existingSession = await prisma.shadowWorkSession.findFirst({
      where: { 
        userId: req.user.id,
        questionId 
      },
    });

    if (existingSession) {
      // Update existing session
      const updatedSession = await prisma.shadowWorkSession.update({
        where: { id: existingSession.id },
        data: {
          response,
          insights: insights || existingSession.insights,
          completed: true,
          updatedAt: new Date(),
        },
      });

      res.json(updatedSession);
    } else {
      // Create new session
      const session = await prisma.shadowWorkSession.create({
        data: {
          userId: req.user.id,
          questionId,
          response,
          insights: insights || '',
          completed: true,
        },
      });

      res.status(201).json(session);
    }
  } catch (error) {
    console.error('Error creating shadow work session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate insights for a shadow work response
router.post('/sessions/:id/insights', authenticateToken, async (req, res) => {
  try {
    const session = await prisma.shadowWorkSession.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // TODO: Integrate with OpenAI API for generating insights
    // For now, return a mock insight
    const mockInsight = `Based on your response, I can see you're exploring deep patterns within yourself. This kind of self-reflection takes courage. Consider how this pattern might be both protecting you and limiting you. What small step could you take to honor both the protection and the growth you're seeking?`;

    const updatedSession = await prisma.shadowWorkSession.update({
      where: { id: req.params.id },
      data: {
        insights: mockInsight,
        updatedAt: new Date(),
      },
    });

    res.json(updatedSession);
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's shadow work progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const completedSessions = await prisma.shadowWorkSession.count({
      where: { 
        userId: req.user.id,
        completed: true 
      },
    });

    const totalQuestions = shadowWorkQuestions.length;
    const progressPercentage = (completedSessions / totalQuestions) * 100;

    const recentSessions = await prisma.shadowWorkSession.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      completedSessions,
      totalQuestions,
      progressPercentage,
      recentSessions,
    });
  } catch (error) {
    console.error('Error fetching shadow work progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;