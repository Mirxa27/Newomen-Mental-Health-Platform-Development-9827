import OpenAI from 'openai';
import { useOpenAIStore } from '../store/openaiStore';

let openaiInstance = null;

const init = () => {
  const { apiKey } = useOpenAIStore.getState();
  if (apiKey) {
    openaiInstance = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  } else {
    openaiInstance = null;
  }
};

// Initialise immediately
init();

// Re-initialise whenever the API key changes
useOpenAIStore.subscribe(init);

export const getOpenAICompletion = async (messages = []) => {
  if (!openaiInstance) {
    throw new Error('OpenAI API key is not configured. Please set it in the settings panel.');
  }

  const { model, temperature, maxTokens } = useOpenAIStore.getState();

  const completion = await openaiInstance.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return completion.choices[0].message.content.trim();
};