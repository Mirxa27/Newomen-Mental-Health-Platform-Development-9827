import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        personalityType: null,
        crystals: 0,
        shadowProgress: 0,
      subscription: {
        tier: 'discovery',
        minutesRemaining: 10,
        isActive: true,
        expiresAt: null,
      },

      login: (userData) => {
        // Determine admin based on env variable
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || '';
        const isAdmin = userData.email === adminEmail;
        
        set({
          user: {
            ...userData,
            role: isAdmin ? 'admin' : 'user',
            avatarUrl: userData.avatarUrl || null,
          },
          isAuthenticated: true,
        });
      },

        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            personalityType: null,
            crystals: 0,
            shadowProgress: 0,
            subscription: {
            tier: 'discovery',
            minutesRemaining: 10,
            isActive: true,
            expiresAt: null,
          },
        });
      },

      updateSubscription: (subscriptionData) => {
        set((state) => ({
          subscription: {
            ...state.subscription,
            ...subscriptionData,
          },
        }));
      },

      deductMinutes: (minutes) => {
        set((state) => ({
          subscription: {
            ...state.subscription,
            minutesRemaining: Math.max(0, state.subscription.minutesRemaining - minutes),
          },
        }));
      },

        updateProfile: (profileData) => {
          set((state) => ({
            user: {
              ...state.user,
              ...profileData,
            },
          }));
        },

        setPersonality: (type) => set({ personalityType: type }),

        addCrystals: (amount) =>
          set((state) => ({ crystals: state.crystals + amount })),

        updateProgress: (value) =>
          set({ shadowProgress: Math.min(100, value) }),

      // Admin functions
      isAdmin: () => {
        const { user } = get();
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || '';
        return user?.role === 'admin' || user?.email === adminEmail;
      },
    }),
    {
      name: 'newomen-auth',
    }
  ));
