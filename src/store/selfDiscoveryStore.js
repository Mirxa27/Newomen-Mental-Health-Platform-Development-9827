import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useShadowWorkStore = create(
  persist(
    (set, get) => ({
      currentQuestion: 0,
      answers: {},
      isCompleted: false,
      insights: null,
      actionPlan: null,
      affirmations: [],
      
      // Loading states
      isLoading: false,
      isSaving: false,
      isGeneratingInsights: false,
      
      // Error states
      error: null,
      
      // Clear error state
      clearError: () => set({ error: null }),
      
      questions: [
        {
          id: 1,
          text: "What roles do you most often play in front of others?",
          textAr: "ما هي الأدوار التي تلعبينها غالباً أمام الآخرين؟",
          category: "persona",
        },
        {
          id: 2,
          text: "Which emotions do you feel ashamed to show?",
          textAr: "ما هي المشاعر التي تشعرين بالخجل من إظهارها؟",
          category: "suppressed_emotions",
        },
        {
          id: 3,
          text: "What beliefs echo in your mind during hard moments?",
          textAr: "ما هي المعتقدات التي تتردد في ذهنك خلال اللحظات الصعبة؟",
          category: "limiting_beliefs",
        },
        {
          id: 4,
          text: "What do you tolerate that hurts you?",
          textAr: "ما الذي تتحملينه رغم أنه يؤذيك؟",
          category: "boundaries",
        },
        {
          id: 5,
          text: "Describe your most free, authentic self",
          textAr: "صفي ذاتك الأكثر حرية وأصالة",
          category: "authentic_self",
        },
        {
          id: 6,
          text: "What would you do if you knew you couldn't fail?",
          textAr: "ماذا ستفعلين لو علمت أنك لن تفشلي؟",
          category: "hidden_desires",
        },
        {
          id: 7,
          text: "What parts of yourself do you judge most harshly?",
          textAr: "ما هي الجوانب في شخصيتك التي تحكمين عليها بقسوة؟",
          category: "self_judgment",
        },
        {
          id: 8,
          text: "When do you feel most powerful and alive?",
          textAr: "متى تشعرين بأقوى ما يكون وأكثر حيوية؟",
          category: "inner_strength",
        },
        {
          id: 9,
          text: "What patterns keep repeating in your relationships?",
          textAr: "ما هي الأنماط التي تتكرر في علاقاتك؟",
          category: "relationship_patterns",
        },
        {
          id: 10,
          text: "What wisdom would you share with your younger self?",
          textAr: "ما هي الحكمة التي ستشاركينها مع نفسك الأصغر سناً؟",
          category: "inner_wisdom",
        },
      ],
      
      answerQuestion: (questionId, answer) => {
        try {
          if (!questionId || !answer) {
            throw new Error('Question ID and answer are required');
          }
          
          set((state) => ({
            answers: {
              ...state.answers,
              [questionId]: answer,
            },
            error: null,
          }));
        } catch (error) {
          set({ error: error.message || 'Failed to save answer' });
          throw error;
        }
      },
      
      nextQuestion: () => {
        try {
          set((state) => ({
            currentQuestion: Math.min(state.currentQuestion + 1, state.questions.length - 1),
            error: null,
          }));
        } catch (error) {
          set({ error: error.message || 'Failed to navigate to next question' });
          throw error;
        }
      },
      
      previousQuestion: () => {
        try {
          set((state) => ({
            currentQuestion: Math.max(state.currentQuestion - 1, 0),
            error: null,
          }));
        } catch (error) {
          set({ error: error.message || 'Failed to navigate to previous question' });
          throw error;
        }
      },

      setCurrentQuestion: (index) => {
        try {
          if (typeof index !== 'number' || index < 0) {
            throw new Error('Invalid question index');
          }
          
          set((state) => ({
            currentQuestion: Math.min(Math.max(index, 0), state.questions.length - 1),
            error: null,
          }));
        } catch (error) {
          set({ error: error.message || 'Failed to set current question' });
          throw error;
        }
      },
      
       completeAssessment: async () => {
         try {
           set({ isCompleted: true, error: null });
           
           // This would typically trigger AI analysis
           await get().generateInsights();
           
           // Reward user with crystals for completion
           try {
             const { useAuthStore } = await import('../store/authStore');
             useAuthStore.getState().addCrystals(10);
             useAuthStore.getState().updateProgress(100);
           } catch (rewardError) {
             // Don't fail the assessment completion if reward fails
           }
         } catch (error) {
           set({ error: error.message || 'Failed to complete assessment' });
           throw error;
         }
       },
      
      generateInsights: async () => {
        set({ isGeneratingInsights: true, error: null });
        
        try {
          const { answers } = get();

          if (!answers || Object.keys(answers).length === 0) {
            throw new Error('No answers provided for insights generation');
          }

          const systemPrompt = `You are Newomen, an AI coach helping users perform shadow work. Based on the following answers, provide a summary of shadow patterns, hidden strengths, areas for transformation and a short action plan with affirmations.`;

          const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
          if (!apiKey) {
            throw new Error('OpenAI API key is not configured');
          }

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(answers) }
              ],
              max_tokens: 300,
              temperature: 0.7
            })
          });

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          
          if (!content) {
            throw new Error('No insights content received from OpenAI');
          }
          
          set({ 
            insights: { summary: content },
            isGeneratingInsights: false,
            error: null
          });
        } catch (error) {
          const errorMessage = error.message || 'Failed to generate insights';
          set({ 
            isGeneratingInsights: false,
            error: errorMessage
          });
          throw new Error(errorMessage);
        }
      },
      
      resetAssessment: () => {
        try {
          set({
            currentQuestion: 0,
            answers: {},
            isCompleted: false,
            insights: null,
            actionPlan: null,
            affirmations: [],
            isLoading: false,
            isSaving: false,
            isGeneratingInsights: false,
            error: null,
          });
        } catch (error) {
          set({ error: error.message || 'Failed to reset assessment' });
          throw error;
        }
      },
    }),
    {
      name: 'shadow-work-storage',
    }
  )
);

// Make sure the alias export is explicitly defined and exported
export const useSelfDiscoveryStore = useShadowWorkStore;
