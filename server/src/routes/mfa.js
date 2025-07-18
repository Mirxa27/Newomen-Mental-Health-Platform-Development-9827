import express from 'express';
import speakeasy from 'speakeasy';
import { PrismaClient } from '@prisma/client';
import { encryptionService } from '../services/encryptionService.js';
import { authLimiter } from '../middleware/security.js';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

// JWT authentication middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Setup TOTP for logged-in user
router.post('/setup', requireAuth, authLimiter, async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    await prisma.user.update({
      where: { id: req.user.id },
      data: { totpSecret: encryptionService.encrypt(secret.base32), isMfaEnabled: false },
    });
    res.json({ otpauth_url: secret.otpauth_url, base32: secret.base32 });
  } catch (err) {
    next(err);
  }
});

// Verify token and enable MFA
router.post('/verify', requireAuth, authLimiter, async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.totpSecret) return res.status(400).json({ error: 'TOTP not set up' });
    const secret = encryptionService.decrypt(user.totpSecret);
    const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token });
    if (!verified) return res.status(400).json({ error: 'Invalid token' });
    await prisma.user.update({ where: { id: user.id }, data: { isMfaEnabled: true } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
