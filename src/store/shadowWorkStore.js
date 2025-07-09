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
      selectedTopic: null,
      
      // Loading states
      isLoading: false,
      isSaving: false,
      isGeneratingInsights: false,
      
      // Error states
      error: null,
      
      // Clear error state
      clearError: () => set({ error: null }),

      setTopic: (topic) => {
        set({ 
          selectedTopic: topic, 
          currentQuestion: 0,
          answers: {},
          isCompleted: false,
          insights: null,
        });
      },
      
      getFilteredQuestions: () => {
        const { questions, selectedTopic } = get();
        if (!selectedTopic || selectedTopic === 'general') {
          return questions;
        }
        return questions.filter(q => q.category === selectedTopic);
      },

      questions: [
        {
          id: 1,
          text: "What roles do you most often play in front of others?",
          textAr: "ما هي الأدوار التي تلعبينها غالباً أمام الآخرين؟",
          category: "self-development",
        },
        {
          id: 2,
          text: "Which emotions do you feel ashamed to show?",
          textAr: "ما هي المشاعر التي تشعرين بالخجل من إظهارها؟",
          category: "self-esteem",
        },
        {
          id: 3,
          text: "What beliefs echo in your mind during hard moments?",
          textAr: "ما هي المعتقدات التي تتردد في ذهنك خلال اللحظات الصعبة؟",
          category: "self-esteem",
        },
        {
          id: 4,
          text: "What do you tolerate that hurts you?",
          textAr: "ما الذي تتحملينه رغم أنه يؤذيك؟",
          category: "relationships",
        },
        {
          id: 5,
          text: "Describe your most free, authentic self",
          textAr: "صفي ذاتك الأكثر حرية وأصالة",
          category: "self-development",
        },
        {
          id: 6,
          text: "What would you do if you knew you couldn't fail?",
          textAr: "ماذا ستفعلين لو علمت أنك لن تفشلي؟",
          category: "health",
        },
        {
          id: 7,
          text: "What parts of yourself do you judge most harshly?",
          textAr: "ما هي الجوانب في شخصيتك التي تحكمين عليها بقسوة؟",
          category: "self-esteem",
        },
        {
          id: 8,
          text: "When do you feel most powerful and alive?",
          textAr: "متى تشعرين بأقوى ما يكون وأكثر حيوية؟",
          category: "self-development",
        },
        {
          id: 9,
          text: "What patterns keep repeating in your relationships?",
          textAr: "ما هي الأنماط التي تتكرر في علاقاتك؟",
          category: "relationships",
        },
        {
          id: 10,
          text: "What wisdom would you share with your younger self?",
          textAr: "ما هي الحكمة التي ستشاركينها مع نفسك الأصغر سناً؟",
          category: "family",
        },
      ],
      
      answerQuestion: async (questionId, answer) => {
        if (!questionId || !answer) {
          const error = new Error('Question ID and answer are required');
          set({ error: error.message });
          throw error;
        }
        
        set({ isSaving: true, error: null });
        
        try {
          const { api } = await import('../utils/api');
          const response = await api.post('/shadow-work/sessions', {
            questionId: String(questionId),
            response: answer,
          });
          
          if (!response.data || !response.data.id) {
            throw new Error('Invalid response from server');
          }
          
          set((state) => ({
            answers: {
              ...state.answers,
              [questionId]: {
                text: answer,
                sessionId: response.data.id,
              },
            },
            isSaving: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to save answer';
          set({ 
            isSaving: false, 
            error: errorMessage 
          });
          throw new Error(errorMessage);
        }
      },
      
      generateAffirmations: async (personalityType) => {
        if (!personalityType) return;
        set({ isLoading: true, error: null });
        try {
          const { api } = await import('../utils/api');
          // Assuming an endpoint exists to generate affirmations based on personality
          const response = await api.post('/ai/generate-affirmations', { personalityType });
          
          if (response.data && response.data.affirmations) {
            set({ affirmations: response.data.affirmations, isLoading: false });
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to generate affirmations';
          set({ isLoading: false, error: errorMessage });
          // Fallback to default affirmations if generation fails
          const personalityAffirmations = {
            leader: ['Lead with compassion and courage.', 'Your vision inspires others.'],
            nurturer: ['Your kindness uplifts those around you.', 'Self-care fuels your giving heart.'],
            visionary: ['Your ideas shape a brighter future.', 'Creativity flows through you.'],
          };
          set({ affirmations: personalityAffirmations[personalityType] || [] });
        }
      },
      
      nextQuestion: () => {
        try {
          set((state) => {
            const questions = state.getFilteredQuestions();
            return {
              currentQuestion: Math.min(state.currentQuestion + 1, questions.length - 1),
              error: null,
            }
          });
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
          const { getFilteredQuestions } = get();
          const questions = getFilteredQuestions();
          
          set(() => ({
            currentQuestion: Math.min(Math.max(index, 0), questions.length - 1),
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
          
          const { selectedTopic } = get();
          
          // Reward user with crystals and update progress for the specific area
          try {
            const { useAuthStore } = await import('../store/authStore');
            useAuthStore.getState().addCrystals(25); // Increased reward
            if (selectedTopic) {
              useAuthStore.getState().updateProgress(selectedTopic, 15); // Add 15% progress
            }
          } catch (rewardError) {
            // Don't fail the assessment completion if reward fails
            console.error("Failed to apply rewards:", rewardError);
          }
        } catch (error) {
          set({ error: error.message || 'Failed to complete assessment' });
          throw error;
        }
      },
      
      generateInsights: async () => {
        set({ isGeneratingInsights: true, error: null });
        
        try {
          const { answers, getFilteredQuestions } = get();
          const questions = getFilteredQuestions();
          const { api } = await import('../utils/api');
          
          // Find the session ID for the last question answered
          const lastQuestionId = questions[questions.length - 1].id;
          const lastAnswer = answers[lastQuestionId];

          if (!lastAnswer || !lastAnswer.sessionId) {
            throw new Error("Could not find session ID for the last answer");
          }

          const response = await api.post(`/shadow-work/sessions/${lastAnswer.sessionId}/insights`);
          
          if (!response.data || !response.data.insights) {
            throw new Error('Invalid insights response from server');
          }
          
          set({ 
            insights: response.data.insights,
            isGeneratingInsights: false,
            error: null
          });
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to generate insights';
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
            selectedTopic: null,
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

export default useShadowWorkStore;
