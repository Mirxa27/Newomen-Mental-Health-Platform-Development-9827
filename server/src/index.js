import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import http from 'http';
import authRouter from './routes/auth.js';
import chatRouter from './routes/chat.js';
import shadowWorkRouter from './routes/shadowwork.js';
import adminRouter from './routes/admin.js';
import aiProvidersRouter from './routes/aiProviders.js';
import voiceChatRouter from './routes/voiceChat.js';
import paypalRouter from './routes/paypal.js';
import livekitRouter from './routes/livekit.js';
import agentRouter from './routes/agent.js';
import connectionJourneyRouter from './routes/connectionJourney.js';
import emotionRouter from './routes/emotion.js';
import settingsRouter from './routes/settings.js';
import mfaRouter from './routes/mfa.js';
import initSocket from './services/socketService.js';
import {
  generalLimiter,
  speedLimiter,
  helmetConfig,
  corsOptions,
  requestLogger,
  sanitizeErrors,
} from './middleware/security.js';

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

const PORT = process.env.PORT || 4000;

// Create public/uploads directory if it doesn't exist
const uploadsDir = path.join(path.resolve(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Trust proxy for accurate IP addresses behind reverse proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(requestLogger);
app.use(generalLimiter);
app.use(speedLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files
app.use(express.static('public'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/chat', (req, res, next) => {
  req.io = io;
  next();
}, chatRouter);
app.use('/api/shadow-work', shadowWorkRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai-providers', aiProvidersRouter);
app.use('/api/voice', voiceChatRouter);
app.use('/api/emotion', emotionRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/mfa', mfaRouter);
app.use('/api/paypal', paypalRouter);
app.use('/api/livekit', livekitRouter);
app.use('/api/agent', agentRouter);
app.use('/api/connection-journey', connectionJourneyRouter);

// Error handling middleware (must be last)
app.use(sanitizeErrors);

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
