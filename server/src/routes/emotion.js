import express from 'express';
import humeService from '../services/humeService.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

router.post('/analyze', authenticateToken, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });
  try {
    const result = await humeService.analyzeText(text);
    res.json({ emotion: result });
  } catch (error) {
    console.error('Emotion analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze emotion' });
  }
});

export default router;
