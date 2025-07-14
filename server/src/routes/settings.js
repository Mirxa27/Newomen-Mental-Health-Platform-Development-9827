import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = user;
    next();
  });
};

router.get('/', authenticateAdmin, async (_req, res) => {
  try {
    const settings = await prisma.systemSettings.findMany();
    const result = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const updates = req.body || {};
    if (typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload' });
    }
    const entries = Object.entries(updates);
    for (const [key, value] of entries) {
      await prisma.systemSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/public', async (_req, res) => {
  try {
    const settings = await prisma.systemSettings.findMany({ where: { isPublic: true } });
    const result = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
