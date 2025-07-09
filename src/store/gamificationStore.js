import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGamificationStore = create(
  persist(
    (set, get) => ({
      crystals: 0,
      level: 1,
      experience: 0,
      achievements: [],
      unlockedFeatures: ['basic-chat'],
      
      // Experience thresholds for each level
      levelThresholds: [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000],
      
      // Crystal rewards for different actions
      rewards: {
        completePersonalityTest: 50,
        completeShadowWorkQuestion: 10,
        finishShadowWork: 100,
        completeDiagnosticTest: 75,
        dailyCheckIn: 15,
        voiceChatSession: 25,
        weeklyGoalAchieved: 40,
      },
      
      awardCrystals: (amount, reason) => {
        set((state) => {
          const newCrystals = state.crystals + amount;
          const newExperience = state.experience + amount;
          const newLevel = get().calculateLevel(newExperience);
          
          // Check for level up
          const leveledUp = newLevel > state.level;
          
          if (leveledUp) {
            get().unlockLevelFeatures(newLevel);
          }
          
          return {
            crystals: newCrystals,
            experience: newExperience,
            level: newLevel,
          };
        });
        
        // Return level up status for UI notifications
        const currentState = get();
        return {
          crystals: currentState.crystals,
          level: currentState.level,
          leveledUp: currentState.level > get().level,
        };
      },
      
      calculateLevel: (experience) => {
        const { levelThresholds } = get();
        for (let i = levelThresholds.length - 1; i >= 0; i--) {
          if (experience >= levelThresholds[i]) {
            return i + 1;
          }
        }
        return 1;
      },
      
      unlockLevelFeatures: (level) => {
        set((state) => {
          const newFeatures = [...state.unlockedFeatures];
          
          // Unlock features based on level
          switch (level) {
            case 2:
              if (!newFeatures.includes('voice-chat')) {
                newFeatures.push('voice-chat');
              }
              break;
            case 3:
              if (!newFeatures.includes('shadow-work')) {
                newFeatures.push('shadow-work');
              }
              break;
            case 4:
              if (!newFeatures.includes('diagnostic-tests')) {
                newFeatures.push('diagnostic-tests');
              }
              break;
            case 5:
              if (!newFeatures.includes('breathing-library')) {
                newFeatures.push('breathing-library');
              }
              break;
            case 6:
              if (!newFeatures.includes('community-search')) {
                newFeatures.push('community-search');
              }
              break;
          }
          
          return { unlockedFeatures: newFeatures };
        });
      },
      
      addAchievement: (achievementId, title, description) => {
        set((state) => {
          if (!state.achievements.find(a => a.id === achievementId)) {
            return {
              achievements: [
                ...state.achievements,
                {
                  id: achievementId,
                  title,
                  description,
                  unlockedAt: new Date().toISOString(),
                }
              ]
            };
          }
          return state;
        });
      },
      
      getProgressToNextLevel: () => {
        const { experience, level, levelThresholds } = get();
        const currentLevelExp = levelThresholds[level - 1] || 0;
        const nextLevelExp = levelThresholds[level] || levelThresholds[levelThresholds.length - 1];
        const progress = ((experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
        
        return {
          current: experience - currentLevelExp,
          required: nextLevelExp - currentLevelExp,
          percentage: Math.min(progress, 100),
        };
      },
      
      isFeatureUnlocked: (feature) => {
        return get().unlockedFeatures.includes(feature);
      },
      
      reset: () => {
        set({
          crystals: 0,
          level: 1,
          experience: 0,
          achievements: [],
          unlockedFeatures: ['basic-chat'],
        });
      },
    }),
    {
      name: 'newomen-gamification',
    }
  )
);
