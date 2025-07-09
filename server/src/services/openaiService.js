import OpenAI from 'openai';
import { useOpenAIStore } from '../../store/openaiStore';

let openai;

const initializeOpenAI = () => {
  const { apiKey } = useOpenAIStore.getState();
  if (apiKey) {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
};

initializeOpenAI();

useOpenAIStore.subscribe(initializeOpenAI);

export const getOpenAICompletion = async (messages) => {
  if (!openai) {
    throw new Error('OpenAI API key not set.');
  }

  const { model, temperature, maxTokens } = useOpenAIStore.getState();

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error getting OpenAI completion:', error);
    throw new Error('Failed to get OpenAI completion.');
  }
};