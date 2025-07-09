import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class OpenAIService {
    constructor() {
        this.openai = null;
        this.initialize();
    }

    async initialize() {
        try {
            // Prioritize API key from the database (AIProvider model)
            const provider = await prisma.aIProvider.findFirst({
                where: { name: 'OpenAI', status: 'ACTIVE' },
            });

            const apiKey = provider?.apiKey || process.env.OPENAI_API_KEY;

            if (apiKey) {
                this.openai = new OpenAI({ apiKey });
                console.log('✅ OpenAI Service Initialized Successfully.');
            } else {
                console.warn('⚠️ OpenAI API key not found. AI features will be disabled.');
            }
        } catch (error) {
            console.error('❌ Error initializing OpenAI Service:', error);
        }
    }

    isReady() {
        return !!this.openai;
    }

    async getSystemPrompt() {
        // This can be enhanced to fetch dynamic system prompts from the DB
        return `You are Newomen, a compassionate AI companion for women's mental health, specializing in MENA cultural contexts. Be warm, empathetic, and non-judgmental.`;
    }

    async getConversationHistory(conversationId) {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                messages: {
                    orderBy: { timestamp: 'asc' },
                    take: 20, // Context window
                },
            },
        });

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        const history = conversation.messages.map(msg => ({
            role: msg.role.toLowerCase(), // Ensure role is 'user' or 'assistant'
            content: msg.content,
        }));

        return history;
    }

    async generateResponse(conversationId, userMessageContent) {
        if (!this.isReady()) {
            return this.getFallbackResponse();
        }

        try {
            const history = await this.getConversationHistory(conversationId);
            const systemPrompt = await this.getSystemPrompt();

            const messages = [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: userMessageContent },
            ];

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4', // This can be made dynamic later
                messages,
                temperature: 0.7,
                max_tokens: 1024,
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('❌ OpenAI API error:', error);
            return this.getFallbackResponse(error);
        }
    }

    getFallbackResponse(error = null) {
        const responses = [
            "I'm here for you. Could you tell me more about what's on your mind?",
            "Thank you for sharing. It takes courage to open up. Let's talk through it.",
            "I'm listening. Please feel free to share as much as you're comfortable with.",
        ];

        if (error) {
            console.log("Providing fallback response due to error.");
        }

        return responses[Math.floor(Math.random() * responses.length)];
    }
}

export default new OpenAIService(); 