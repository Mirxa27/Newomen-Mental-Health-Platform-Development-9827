import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      subscription: {
        tier: 'discovery',
        minutesRemaining: 10,
        isActive: true,
        expiresAt: null,
      },
      
      login: (userData) => {
        set({
          user: userData,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
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
    }),
    {
      name: 'newomen-auth',
    }
  )
);