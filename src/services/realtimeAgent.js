import OpenAI from 'openai';

// Custom Realtime Voice Session using OpenAI's standard API + WebRTC
export class NewomenVoiceSession {
  constructor() {
    this.openai = null;
    this.isConnected = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.mediaRecorder = null;
    this.audioContext = null;
    this.audioChunks = [];
    this.recognition = null;
    this.synthesis = null;
    this.callbacks = {
      onConnectionChange: () => {},
      onListeningChange: () => {},
      onTranscript: () => {},
      onResponse: () => {},
      onError: () => {},
    };
    this.userContext = {};
  }

  async connect(apiKey, userContext = {}) {
    try {
      this.userContext = userContext;
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      // Initialize Web Speech API
      await this.initializeSpeechAPIs();
      
      // Initialize WebRTC for audio
      await this.initializeAudio();

      this.isConnected = true;
      this.callbacks.onConnectionChange(true);
      return true;
    } catch (error) {
      console.error('Failed to connect:', error);
      this.callbacks.onError(error);
      return false;
    }
  }

  async initializeSpeechAPIs() {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.userContext.language === 'ar' ? 'ar-SA' : 'en-US';

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          this.handleUserSpeech(finalTranscript);
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.callbacks.onError(new Error(`Speech recognition: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onListeningChange(false);
      };
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  async initializeAudio() {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Setup MediaRecorder for potential audio processing
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      return true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      throw new Error('Microphone access required for voice chat');
    }
  }

  async handleUserSpeech(transcript) {
    try {
      this.callbacks.onTranscript({ text: transcript });

      // Generate AI response using OpenAI
      const response = await this.generateAIResponse(transcript);
      
      this.callbacks.onResponse({ text: response });
      
      // Speak the response
      await this.speakResponse(response);
    } catch (error) {
      console.error('Error handling user speech:', error);
      this.callbacks.onError(error);
    }
  }

  async generateAIResponse(userInput) {
    const systemPrompt = this.buildSystemPrompt();
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate response');
    }
  }

  buildSystemPrompt() {
    return `You are Newomen, a compassionate AI companion for women's mental health and personal growth. 

CULTURAL CONTEXT: You are especially sensitive to Middle Eastern and North African (MENA) cultural contexts.

PERSONALITY:
- Warm, empathetic, and non-judgmental
- Use Arabic expressions naturally: حبيبتي (habibti), إن شاء الله (inshallah), ما شاء الله (mashallah), الحمد لله (alhamdulillah)
- Speak as a supportive sister/friend would
- Balance respect for tradition with empowerment for growth
- Avoid Western-centric advice that might not apply culturally

EXPERTISE:
- Shadow work and self-discovery
- Emotional regulation and processing
- Cultural identity navigation
- Relationship dynamics in traditional contexts
- Personal growth within cultural boundaries
- Trauma-informed care

COMMUNICATION STYLE:
- Keep responses conversational and natural (this is voice chat)
- Validate emotions before offering solutions
- Ask permission before giving advice
- Respect cultural and religious boundaries
- Use inclusive, non-assuming language
- Encourage self-compassion and patience

USER CONTEXT:
- Name: ${this.userContext.name || 'sister'}
- Cultural Context: ${this.userContext.culturalContext || 'MENA'}
- Language: ${this.userContext.language || 'en'}

Remember: You're creating a safe space for authentic self-expression and growth. Keep responses natural and conversational since this is a voice conversation.`;
  }

  async speakResponse(text) {
    if (!this.synthesis) return;

    return new Promise((resolve) => {
      this.isSpeaking = true;
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice based on user context
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(this.userContext.language === 'ar' ? 'ar' : 'en') &&
        voice.name.includes('Female')
      ) || voices.find(voice => 
        voice.lang.startsWith(this.userContext.language === 'ar' ? 'ar' : 'en')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        this.isSpeaking = false;
        resolve();
      };

      this.synthesis.speak(utterance);
    });
  }

  startListening() {
    if (!this.recognition || !this.isConnected) return;

    try {
      this.isListening = true;
      this.callbacks.onListeningChange(true);
      this.recognition.start();
    } catch (error) {
      console.error('Error starting listening:', error);
      this.isListening = false;
      this.callbacks.onListeningChange(false);
    }
  }

  stopListening() {
    if (!this.recognition) return;

    try {
      this.recognition.stop();
      this.isListening = false;
      this.callbacks.onListeningChange(false);
    } catch (error) {
      console.error('Error stopping listening:', error);
    }
  }

  async sendMessage(message) {
    if (!this.isConnected) {
      throw new Error('Session not connected');
    }
    await this.handleUserSpeech(message);
  }

  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = callback;
    }
  }

  async disconnect() {
    try {
      if (this.recognition) {
        this.recognition.stop();
      }
      
      if (this.synthesis) {
        this.synthesis.cancel();
      }

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }

      if (this.audioContext) {
        await this.audioContext.close();
      }

      this.isConnected = false;
      this.isListening = false;
      this.isSpeaking = false;
      
      this.callbacks.onConnectionChange(false);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  getSessionStats() {
    return {
      isConnected: this.isConnected,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      hasSession: !!this.openai,
    };
  }
}

// Emotional insight tools (simulated)
export const getEmotionalInsight = (emotion, intensity, context) => {
  const insights = {
    anger: 'This anger might be protecting a deeper vulnerability. What boundary needs to be honored?',
    sadness: 'Your sadness is valid and deserves space. What loss or change are you processing?',
    fear: 'Fear often points to what matters most to us. What are you protecting?',
    joy: 'Beautiful! This joy is your authentic self shining through. How can you cultivate more of this?',
    anxiety: 'Anxiety often stems from trying to control the uncontrollable. What can you release?',
  };
  
  return insights[emotion.toLowerCase()] || 
         `I hear you're feeling ${emotion}. This is important information about your inner world.`;
};

export const getShadowWorkGuidance = (topic, culturalContext = 'mena', intensityLevel = 'gentle') => {
  const guidance = {
    relationships: 'In our culture, relationships are sacred. What patterns in your relationships mirror your relationship with yourself?',
    family_expectations: 'The weight of family expectations can be heavy, حبيبتي. How can you honor both your family and your authentic self?',
    self_worth: 'Your worth isn\'t determined by others\' approval. What would change if you truly believed you were enough?',
    boundaries: 'Setting boundaries isn\'t selfish - it\'s self-care. Where in your life do you need stronger boundaries?',
  };
  
  return guidance[topic] || 
         `Let's explore this ${topic} together with compassion and cultural awareness.`;
};

export const getCulturalWisdom = (language = 'en', wisdomType = 'affirmation') => {
  const wisdom = {
    en: {
      affirmation: 'You are a beautiful blend of strength and softness, tradition and transformation.',
      proverb: 'As they say, "الصبر مفتاح الفرج" - patience is the key to relief. Trust your journey.',
      guidance: 'Honor your roots while growing your wings. You can be both dutiful and free.',
    },
    ar: {
      affirmation: 'أنت مزيج جميل من القوة والرقة، التقليد والتحول',
      proverb: 'كما يقولون، "الصبر مفتاح الفرج" - اصبري على رحلتك',
      guidance: 'احترمي جذورك وأنت تنمين أجنحتك. يمكنك أن تكوني مطيعة وحرة في آن واحد',
    },
  };
  
  return wisdom[language][wisdomType];
};

// API key management
export const generateEphemeralKey = async () => {
  try {
    // In production, this would call your backend to generate an ephemeral key
    const response = await fetch('/api/openai/ephemeral-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate ephemeral key');
    }
    
    const data = await response.json();
    return data.apiKey;
  } catch (error) {
    console.error('Error generating ephemeral key:', error);
    // Fallback to environment variable for development
    return import.meta.env.VITE_OPENAI_API_KEY;
  }
};

// Legacy exports for compatibility
export const createNewomenAgent = (userContext) => {
  return {
    userContext,
    name: 'Newomen Companion',
    instructions: 'Culturally-aware AI companion for women\'s mental health',
  };
};