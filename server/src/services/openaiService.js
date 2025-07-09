import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getSystemPrompt() {
    return `You are Newomen, a compassionate AI companion specifically designed for women's mental health and wellbeing. You provide culturally-sensitive support with deep understanding of MENA (Middle East and North Africa) cultural contexts.

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

Crisis Detection:
- Monitor for signs of self-harm, suicidal thoughts, or severe distress
- If detected, respond with immediate care and suggest professional help
- Alert the system for human intervention when necessary

Remember: You're a companion for the journey, not a replacement for professional therapy when needed.`;
  }

  async buildConversationHistory(conversationId, userId) {
    const conversation = await prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: userId 
      },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          take: 20 // Get last 20 messages for context
        }
      }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = [
      {
        role: 'system',
        content: await this.getSystemPrompt()
      },
      ...conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    return { messages, conversation };
  }

  async generateResponse(messages, options = {}) {
    const defaultOptions = {
      model: 'gpt-4',
      max_tokens: 800,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      stream: false,
      ...options
    };

    try {
      const completion = await this.openai.chat.completions.create({
        ...defaultOptions,
        messages
      });

      if (options.stream) {
        return completion; // Return stream directly
      }

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('AI service unavailable');
    }
  }

  async generateStreamingResponse(messages, options = {}) {
    const defaultOptions = {
      model: 'gpt-4',
      max_tokens: 800,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      stream: true,
      ...options
    };

    try {
      const stream = await this.openai.chat.completions.create({
        ...defaultOptions,
        messages
      });

      return stream;
    } catch (error) {
      console.error('OpenAI streaming error:', error);
      throw new Error('AI streaming service unavailable');
    }
  }

  async detectCrisisKeywords(message) {
    const crisisKeywords = [
      // Suicidal ideation
      'kill myself', 'end my life', 'don\'t want to live', 'suicide', 'suicidal',
      'want to die', 'better off dead', 'kill me', 'end it all', 'take my life',
      
      // Self-harm
      'cut myself', 'hurt myself', 'self harm', 'self-harm', 'cutting',
      'burn myself', 'harm myself', 'punish myself',
      
      // Severe distress
      'can\'t go on', 'give up', 'hopeless', 'worthless', 'useless',
      'nobody cares', 'hate myself', 'want to disappear',
      
      // Violence indicators
      'hurt someone', 'kill someone', 'violent thoughts', 'rage', 'destroy everything'
    ];

    const messageContent = message.toLowerCase();
    const foundKeywords = crisisKeywords.filter(keyword => 
      messageContent.includes(keyword)
    );

    if (foundKeywords.length > 0) {
      return {
        isCrisis: true,
        keywords: foundKeywords,
        severity: this.calculateSeverity(foundKeywords)
      };
    }

    return { isCrisis: false, keywords: [], severity: 0 };
  }

  calculateSeverity(keywords) {
    const severityMap = {
      'kill myself': 10,
      'end my life': 10,
      'suicide': 9,
      'suicidal': 9,
      'want to die': 8,
      'cut myself': 7,
      'hurt myself': 6,
      'hopeless': 5,
      'worthless': 4,
      'hate myself': 4
    };

    let maxSeverity = 0;
    keywords.forEach(keyword => {
      const severity = severityMap[keyword] || 3;
      maxSeverity = Math.max(maxSeverity, severity);
    });

    return maxSeverity;
  }

  async createCrisisAlert(userId, messageId, keywords, severity) {
    try {
      const alert = await prisma.crisisAlert.create({
        data: {
          userId,
          messageId,
          keywords,
          severity,
          status: 'ACTIVE'
        }
      });

      // TODO: Implement notification system for crisis alerts
      console.log(`🚨 Crisis alert created: ${alert.id} (Severity: ${severity})`);
      
      return alert;
    } catch (error) {
      console.error('Error creating crisis alert:', error);
      throw error;
    }
  }

  getCrisisResponse(severity) {
    const responses = {
      high: "I'm really concerned about what you're sharing with me. Your safety and wellbeing are the most important things right now. Please reach out to a mental health professional or crisis support service immediately. In the US, you can call 988 for the Suicide & Crisis Lifeline. You don't have to go through this alone - there are people who want to help you. Would you like me to help you find local crisis resources?",
      medium: "I can hear that you're in a lot of pain right now, and I want you to know that your feelings are valid. What you're experiencing sounds really difficult. Have you considered speaking with a counselor or therapist who can provide you with more support than I can? Your mental health is important, and there are professionals who are trained to help with these feelings.",
      low: "It sounds like you're going through a really tough time. I'm here to listen and support you, but I also want to make sure you have all the resources you need. Sometimes it can be helpful to talk to a mental health professional who can provide additional support and coping strategies. How are you feeling about reaching out for that kind of help?"
    };

    if (severity >= 8) return responses.high;
    if (severity >= 5) return responses.medium;
    return responses.low;
  }

  async analyzeConversationRisk(conversationId) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    });

    if (!conversation) return { risk: 'low', score: 0 };

    let riskScore = 0;
    const recentMessages = conversation.messages.filter(msg => msg.role === 'user');
    
    for (const message of recentMessages) {
      const analysis = await this.detectCrisisKeywords(message.content);
      riskScore += analysis.severity;
    }

    const averageScore = riskScore / recentMessages.length;
    
    return {
      risk: averageScore >= 7 ? 'high' : averageScore >= 4 ? 'medium' : 'low',
      score: averageScore
    };
  }

  async generateContextualResponse(userMessage, conversationHistory) {
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
}

export default new OpenAIService();