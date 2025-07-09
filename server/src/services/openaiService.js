import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

// NOTE: This module is **server-side** only. It should not be imported by the
// browser bundle.  The previous client-side implementation has been moved to
// `src/services/openaiService.js` inside the frontend codebase.
//
// The chat routes (`server/src/routes/chat.js`) expect the following API:
//   - detectCrisisKeywords(message)
//   - createCrisisAlert(userId, messageId, keywords, severity)
//   - getCrisisResponse(severity)
//   - buildConversationHistory(conversationId, userId)
//   - generateResponse(messages)
//   - generateStreamingResponse(messages)
//   - generateContextualResponse(message, conversationMessages)
//
// We implement these helpers below and export them as the default object so the
// existing route code continues to function without modification.

const prisma = new PrismaClient();

// -------------------------------------------------------------
// OpenAI initialisation (if an API key is provided)
// -------------------------------------------------------------
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Default model + parameters (can be overridden via env vars)
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_TEMPERATURE = Number(process.env.OPENAI_TEMPERATURE ?? 0.7);
const OPENAI_MAX_TOKENS = Number(process.env.OPENAI_MAX_TOKENS ?? 1024);

// -------------------------------------------------------------
// Crisis keyword detection helpers
// -------------------------------------------------------------
// A curated list of phrases signalling self-harm or acute crisis.  In real life
// this should be far more exhaustive and use NLP for accuracy.
const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'self harm',
  'harm myself',
  'cut myself',
  'overdose',
  'die',
  'worthless',
  'jump off',
  'hang myself',
  'shoot myself',
  'take my life',
  'no reason to live',
  'life is pointless',
  'can\'t go on',
  'want to disappear',
  'i don\'t want to live',
];

/**
 * Scan the provided text for crisis keywords.
 * Returns an object { isCrisis, keywords, severity }
 */
function detectCrisisKeywords(message) {
  const lower = message.toLowerCase();
  const found = CRISIS_KEYWORDS.filter((kw) => lower.includes(kw));
  const isCrisis = found.length > 0;

  // Severity: simple heuristic -> (#keywords * 2) capped 10, min 5 when crisis
  let severity = 0;
  if (isCrisis) {
    severity = Math.min(10, Math.max(5, found.length * 2));
  }

  return {
    isCrisis,
    keywords: found,
    severity,
  };
}

/**
 * Persist a CrisisAlert record and send a notification to counsellors / user.
 */
async function createCrisisAlert(userId, messageId, keywords, severity) {
  const alert = await prisma.crisisAlert.create({
    data: {
      userId,
      messageId,
      keywords,
      severity,
    },
  });

  // Create a user-visible notification so they know help is available
  await prisma.notification.create({
    data: {
      userId,
      type: 'CRISIS_ALERT',
      title: 'We\'re here for you',
      message:
        'We noticed you might be in distress. A professional counsellor has been alerted and will reach out shortly. If you are in immediate danger please call your local emergency services.',
    },
  });

  return alert;
}

/**
 * Provide an immediate assistant message that is appropriate to the crisis
 * severity.
 */
function getCrisisResponse(severity = 5) {
  if (severity >= 8) {
    return (
      'I\'m really worried about your safety. You matter and your life is important. If you feel like you might act on thoughts of harming yourself, please call your local emergency services (for example, 911 in the US) or go to your nearest hospital. If you can, consider reaching out to someone you trust right now. You do not have to go through this alone.'
    );
  }

  if (severity >= 6) {
    return (
      'I hear how painful things feel right now. You are not alone and there is help available. If you ever feel like you might act on harmful thoughts please seek immediate help by calling your local emergency services, or consider calling a suicide prevention hotline such as 988 in the US or 1564 in the UAE. Would you like some resources that could support you at this moment?'
    );
  }

  return (
    'Thank you for sharing how you feel. I understand this may be very difficult. It might help to reach out to someone you trust or a mental-health professional. Remember, help is available and you deserve support. I can also share some resources with you if you\'d like.'
  );
}

// -------------------------------------------------------------
// Conversation helpers
// -------------------------------------------------------------

/**
 * Build an array of messages representing the last N exchanges in a
 * conversation, formatted for the OpenAI chat API.  Includes an initial system
 * prompt so the assistant has context about the product.
 */
async function buildConversationHistory(conversationId, userId, limit = 20) {
  // Fetch messages ordered oldest->newest (ascending)
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { timestamp: 'asc' },
    take: limit,
  });

  // Ensure the conversation belongs to the user (basic check)
  const convo = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    select: { id: true },
  });
  if (!convo) {
    throw new Error('Conversation not found or access denied');
  }

  const formatted = messages.map((m) => ({ role: m.role, content: m.content }));

  // Prepend system prompt
  const systemPrompt =
    'You are Newomen, an empathetic AI companion focused on women\'s mental health and personal growth. Provide warm, culturally aware responses, occasionally using Arabic endearments like "حبيبتي" when appropriate.';

  return { messages: [{ role: 'system', content: systemPrompt }, ...formatted] };
}

// -------------------------------------------------------------
// OpenAI wrappers
// -------------------------------------------------------------

async function generateResponse(messages) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: OPENAI_TEMPERATURE,
    max_tokens: OPENAI_MAX_TOKENS,
    messages,
  });
  return completion.choices[0].message.content.trim();
}

async function generateStreamingResponse(messages) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  return openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: OPENAI_TEMPERATURE,
    max_tokens: OPENAI_MAX_TOKENS,
    stream: true,
    messages,
  });
}

// -------------------------------------------------------------
// Fallback: heuristic / template-based response when no OpenAI key is present
// -------------------------------------------------------------
function generateContextualResponse(message, previousMessages = []) {
  // Very naive implementation – echoes back with supportive template.
  const encouragements = [
    'I hear you, and I\'m here for you.',
    'That sounds really challenging.',
    'Thank you for trusting me with your feelings.',
    'It\'s okay to feel this way. Let\'s explore it together.',
  ];
  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
  return `${randomEncouragement} You said: "${message}"`;
}

// -------------------------------------------------------------
// Export public API expected by the routes
// -------------------------------------------------------------
export default {
  detectCrisisKeywords,
  createCrisisAlert,
  getCrisisResponse,
  buildConversationHistory,
  generateResponse,
  generateStreamingResponse,
  generateContextualResponse,
};