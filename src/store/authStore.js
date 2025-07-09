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
        progressByArea: {},
        
        // Loading states
        isLoading: false,
        isRegistering: false,
        isLoggingIn: false,
        isLoggingOut: false,
        
        // Error states
        error: null,
        
        subscription: {
          tier: 'discovery',
          minutesRemaining: 10,
          isActive: true,
          expiresAt: null,
        },

      // Clear error state
      clearError: () => set({ error: null }),
      
      // Register method with proper error handling
      register: async (userData) => {
        set({ isRegistering: true, error: null });
        try {
          const { register } = await import('../services/auth');
          const user = await register(userData);
          
          // Determine admin based on env variable
          const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || '';
          const isAdmin = user.email === adminEmail;
          
          set({
            user: {
              ...user,
              role: isAdmin ? 'admin' : 'user',
              avatarUrl: user.avatarUrl || null,
            },
            isAuthenticated: true,
            isRegistering: false,
            error: null,
          });
          
          return user;
        } catch (error) {
          set({ 
            isRegistering: false, 
            error: error.message || 'Registration failed. Please try again.' 
          });
          throw error;
        }
      },
      
      // Login method with proper error handling
      loginWithCredentials: async (credentials) => {
        set({ isLoggingIn: true, error: null });
        try {
          const { login } = await import('../services/auth');
          const user = await login(credentials);
          
          // Determine admin based on env variable
          const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || '';
          const isAdmin = user.email === adminEmail;
          
          set({
            user: {
              ...user,
              role: isAdmin ? 'admin' : 'user',
              avatarUrl: user.avatarUrl || null,
            },
            isAuthenticated: true,
            isLoggingIn: false,
            error: null,
          });
          
          return user;
        } catch (error) {
          set({ 
            isLoggingIn: false, 
            error: error.message || 'Login failed. Please check your credentials.' 
          });
          throw error;
        }
      },

      // Legacy login method for backward compatibility
      login: (userData) => {
        try {
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
            error: null,
          });
        } catch (error) {
          set({ error: error.message || 'Login failed' });
          throw error;
        }
      },

        // Logout method with proper error handling
        logout: async () => {
          set({ isLoggingOut: true, error: null });
          try {
            const { logout } = await import('../services/auth');
            await logout();
            
            set({
              user: null,
              isAuthenticated: false,
              personalityType: null,
              crystals: 0,
              shadowProgress: 0,
              isLoggingOut: false,
              error: null,
              subscription: {
                tier: 'discovery',
                minutesRemaining: 10,
                isActive: true,
                expiresAt: null,
              },
            });
          } catch (error) {
            // Even if logout fails on the server, we should clear local state
            set({
              user: null,
              isAuthenticated: false,
              personalityType: null,
              crystals: 0,
              shadowProgress: 0,
              isLoggingOut: false,
              error: null,
              subscription: {
                tier: 'discovery',
                minutesRemaining: 10,
                isActive: true,
                expiresAt: null,
              },
            });
          }
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
          try {
            set((state) => ({
              user: {
                ...state.user,
                ...profileData,
              },
              error: null,
            }));
          } catch (error) {
            set({ error: error.message || 'Failed to update profile' });
            throw error;
          }
        },

        setPersonality: (type) => set({ personalityType: type }),

        addCrystals: (amount) =>
          set((state) => ({ crystals: (state.crystals || 0) + amount })),

        updateProgress: (area, value) =>
          set((state) => ({ 
            progressByArea: {
              ...state.progressByArea,
              [area]: Math.min(100, (state.progressByArea[area] || 0) + value)
            }
          })),

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
