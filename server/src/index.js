import 'dotenv/config';

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in environment.');
  process.exit(1);
}
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import authRouter from './routes/auth.js';
import chatRouter from './routes/chat.js';
import shadowWorkRouter from './routes/shadowwork.js';
import adminRouter from './routes/admin.js';
import aiProvidersRouter from './routes/aiProviders.js';
import voiceChatRouter from './routes/voiceChat.js';
import paymentsRouter from './routes/payments.js';
import socketService from './services/socketService.js';
import {
  generalLimiter,
  speedLimiter,
  helmetConfig,
  corsOptions,
  requestLogger,
  sanitizeErrors,
} from './middleware/security.js';

const app = express();
const server = createServer(app);
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
app.use('/api/chat', chatRouter);
app.use('/api/shadow-work', shadowWorkRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai-providers', aiProvidersRouter);
app.use('/api/voice', voiceChatRouter);
app.use('/api/payments', paymentsRouter);

// Error handling middleware (must be last)
app.use(sanitizeErrors);

// Initialize Socket.IO
socketService.initialize(server);

// Start periodic cleanup of inactive sessions
setInterval(() => {
  socketService.cleanupInactiveSessions();
}, 15 * 60 * 1000); // Every 15 minutes

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time features`);
});
