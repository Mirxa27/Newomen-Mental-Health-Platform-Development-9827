import { useAuthStore } from '../store/authStore';

// Default OpenAI configuration
const DEFAULT_CONFIG = {
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

// Get API key from environment or admin settings
const getApiKey = () => {
  // First try environment variable
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envKey && envKey !== 'your_openai_key_here') {
    return envKey;
  }

  // Then try admin settings
  const authStore = useAuthStore.getState();
  const adminSettings = authStore.adminSettings;
  if (adminSettings?.openai?.apiKey) {
    return adminSettings.openai.apiKey;
  }

  throw new Error('OpenAI API key not found. Please configure it in admin settings or environment variables.');
};

// Format messages for OpenAI API
const formatMessages = (messages) => {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
};

// Add system context for mental health support
const addSystemContext = (messages) => {
  const systemMessage = {
    role: 'system',
    content: `You are Newomen, an AI mental health companion designed specifically for women. Your role is to provide empathetic, culturally-sensitive support while maintaining professional boundaries.

Key guidelines:
- Be warm, understanding, and non-judgmental
- Provide evidence-based mental health information
- Encourage self-reflection and personal growth
- Respect cultural and religious values
- Never give medical advice or diagnose conditions
- Encourage professional help when appropriate
- Use inclusive, empowering language
- Focus on strengths and resilience
- Provide practical coping strategies
- Maintain appropriate boundaries

Cultural considerations for MENA region:
- Respect family values and traditions
- Be mindful of religious and cultural beliefs
- Understand the importance of community and family
- Consider gender roles and expectations
- Be sensitive to stigma around mental health

Always respond in a supportive, educational, and empowering manner.`
  };

  return [systemMessage, ...messages];
};

// Get OpenAI completion
export const getOpenAICompletion = async (messages, options = {}) => {
  try {
    const apiKey = getApiKey();
    const config = { ...DEFAULT_CONFIG, ...options };
    
    const formattedMessages = formatMessages(messages);
    const messagesWithContext = addSystemContext(formattedMessages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: messagesWithContext,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        top_p: config.top_p,
        frequency_penalty: config.frequency_penalty,
        presence_penalty: config.presence_penalty,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I am unable to provide a response at this time.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback responses for different scenarios
    if (error.message.includes('API key')) {
      return 'I apologize, but there seems to be a configuration issue. Please contact support or check your API settings.';
    }
    
    if (error.message.includes('rate limit')) {
      return 'I apologize, but the service is currently experiencing high demand. Please try again in a few moments.';
    }
    
    if (error.message.includes('quota')) {
      return 'I apologize, but the service quota has been exceeded. Please try again later or contact support.';
    }
    
    return 'I apologize, but I am experiencing technical difficulties. Please try again or contact support if the issue persists.';
  }
};

// Stream OpenAI completion (for real-time responses)
export const streamOpenAICompletion = async (messages, onChunk, options = {}) => {
  try {
    const apiKey = getApiKey();
    const config = { ...DEFAULT_CONFIG, ...options };
    
    const formattedMessages = formatMessages(messages);
    const messagesWithContext = addSystemContext(formattedMessages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: messagesWithContext,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        top_p: config.top_p,
        frequency_penalty: config.frequency_penalty,
        presence_penalty: config.presence_penalty,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const chunk = parsed.choices[0]?.delta?.content;
            if (chunk) {
              onChunk(chunk);
            }
          } catch (e) {
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    }
  } catch (error) {
    console.error('OpenAI streaming error:', error);
    onChunk('I apologize, but I am experiencing technical difficulties. Please try again.');
  }
};

// Get conversation summary
export const getConversationSummary = async (messages) => {
  try {
    const summaryPrompt = {
      role: 'user',
      content: 'Please provide a brief, empathetic summary of this conversation, focusing on the key themes and any actionable insights. Keep it under 100 words.'
    };

    const messagesWithSummary = [...messages, summaryPrompt];
    return await getOpenAICompletion(messagesWithSummary, { max_tokens: 150 });
  } catch (error) {
    console.error('Summary generation error:', error);
    return 'Conversation summary unavailable.';
  }
};

// Get emotional analysis
export const getEmotionalAnalysis = async (messages) => {
  try {
    const analysisPrompt = {
      role: 'user',
      content: 'Please analyze the emotional tone of this conversation. Identify the primary emotions expressed and their intensity (low/medium/high). Focus on understanding, not diagnosing.'
    };

    const messagesWithAnalysis = [...messages, analysisPrompt];
    return await getOpenAICompletion(messagesWithAnalysis, { max_tokens: 200 });
  } catch (error) {
    console.error('Emotional analysis error:', error);
    return 'Emotional analysis unavailable.';
  }
};

// Get personalized recommendations
export const getPersonalizedRecommendations = async (messages, userProfile = {}) => {
  try {
    const recommendationsPrompt = {
      role: 'user',
      content: `Based on this conversation and the user's profile, provide 2-3 personalized, actionable recommendations for self-care, personal growth, or next steps. Consider cultural context and practical feasibility. Keep each recommendation brief and specific.`
    };

    const messagesWithRecommendations = [...messages, recommendationsPrompt];
    return await getOpenAICompletion(messagesWithRecommendations, { max_tokens: 300 });
  } catch (error) {
    console.error('Recommendations error:', error);
    return 'Personalized recommendations unavailable.';
  }
};

export default {
  getOpenAICompletion,
  streamOpenAICompletion,
  getConversationSummary,
  getEmotionalAnalysis,
  getPersonalizedRecommendations,
};