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
      
      answerQuestion: async (questionId, answer) => {
        const { api } = await import('../utils/api');
        try {
          const response = await api.post('/self-discovery/sessions', {
            questionId: String(questionId),
            response: answer,
          });
          set((state) => ({
            answers: {
              ...state.answers,
              [questionId]: {
                text: answer,
                sessionId: response.data.id,
              },
            },
          }));
        } catch (error) {
          console.error("Failed to save answer:", error);
        }
      },
      
      nextQuestion: () => {
        set((state) => ({
          currentQuestion: Math.min(state.currentQuestion + 1, state.questions.length - 1),
        }));
      },
      
      previousQuestion: () => {
        set((state) => ({
          currentQuestion: Math.max(state.currentQuestion - 1, 0),
        }));
      },

      setCurrentQuestion: (index) => {
        set((state) => ({
          currentQuestion: Math.min(Math.max(index, 0), state.questions.length - 1),
        }));
      },
      
      completeAssessment: () => {
        set({ isCompleted: true });
        // This would typically trigger AI analysis
        get().generateInsights();
        // Reward user with crystals for completion
        import('../store/authStore').then(({ useAuthStore }) => {
          useAuthStore.getState().addCrystals(10);
          useAuthStore.getState().updateProgress(100);
        });
      },
      
      generateInsights: async () => {
        const { answers, questions } = get();
        const { api } = await import('../utils/api');
        
        // Find the session ID for the last question answered
        const lastQuestionId = questions[questions.length - 1].id;
        const lastAnswer = answers[lastQuestionId];

        if (!lastAnswer || !lastAnswer.sessionId) {
          console.error("Could not find session ID for the last answer.");
          return;
        }

        try {
          const response = await api.post(`/self-discovery/sessions/${lastAnswer.sessionId}/insights`);
          set({ insights: response.data.insights });
        } catch (error) {
          console.error('Failed to generate insights:', error);
          // Optionally, set some error state to show in the UI
        }
      },
      
      resetAssessment: () => {
        set({
          currentQuestion: 0,
          answers: {},
          isCompleted: false,
          insights: null,
          actionPlan: null,
          affirmations: [],
        });
      },
    }),
    {
      name: 'shadow-work-storage',
    }
  )
);

export default useShadowWorkStore;
