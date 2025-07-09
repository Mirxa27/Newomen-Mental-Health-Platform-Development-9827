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
      
      answerQuestion: (questionId, answer) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: answer,
          },
        }));
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
        const { answers } = get();

        const systemPrompt = `You are Newomen, an AI coach helping users perform shadow work. Based on the following answers, provide a summary of shadow patterns, hidden strengths, areas for transformation and a short action plan with affirmations.`;

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
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

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            set({ insights: { summary: content } });
          }
        } catch (error) {
          console.error('Failed to generate insights:', error);
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
      name: 'newomen-shadow-work',
    }
  )
);
