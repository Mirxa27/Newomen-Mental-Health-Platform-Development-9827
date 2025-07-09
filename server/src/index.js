import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import chatRouter from './routes/chat.js';
import shadowWorkRouter from './routes/shadowwork.js';
import adminRouter from './routes/admin.js';
import aiProvidersRouter from './routes/aiProviders.js';
import voiceChatRouter from './routes/voiceChat.js';
import {
  generalLimiter,
  speedLimiter,
  helmetConfig,
  corsOptions,
  requestLogger,
  sanitizeErrors,
} from './middleware/security.js';

const app = express();
const PORT = process.env.PORT || 4000;

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

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/shadowwork', shadowWorkRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai-providers', aiProvidersRouter);
app.use('/api/voice', voiceChatRouter);

// Error handling middleware (must be last)
app.use(sanitizeErrors);

app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));