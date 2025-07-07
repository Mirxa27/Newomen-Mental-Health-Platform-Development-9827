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
      
      completeAssessment: () => {
        set({ isCompleted: true });
        // This would typically trigger AI analysis
        get().generateInsights();
      },
      
      generateInsights: async () => {
        const { answers } = get();
        
        // Mock AI-generated insights - in production, this would call the AI service
        const mockInsights = {
          shadowPatterns: [
            "Pattern of perfectionism masking fear of judgment",
            "Tendency to prioritize others' needs over your own",
            "Hidden strength in creative expression",
          ],
          hiddenStrengths: [
            "Natural empathy and emotional intelligence",
            "Resilience through challenging experiences",
            "Intuitive wisdom and inner knowing",
          ],
          transformationAreas: [
            "Embracing vulnerability as strength",
            "Setting healthy boundaries",
            "Expressing authentic emotions",
          ],
        };
        
        const mockActionPlan = [
          {
            category: "Daily Practice",
            actions: [
              "Morning self-compassion meditation (5 minutes)",
              "Evening reflection on authentic moments",
              "Practice saying 'no' to one thing that doesn't serve you",
            ],
          },
          {
            category: "Weekly Challenges",
            actions: [
              "Express one emotion you usually hide",
              "Set one boundary in a relationship",
              "Engage in creative expression without judgment",
            ],
          },
        ];
        
        const mockAffirmations = [
          "I am worthy of love and acceptance exactly as I am",
          "My sensitivity is a gift, not a weakness",
          "I trust my inner wisdom to guide me",
          "I deserve to take up space and be heard",
          "My authentic self is my greatest strength",
        ];
        
        set({
          insights: mockInsights,
          actionPlan: mockActionPlan,
          affirmations: mockAffirmations,
        });
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