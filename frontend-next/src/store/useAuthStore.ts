import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  // English: Added a method to check current session validity
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        // English: Access token for headers, expires in 7 days
        Cookies.set('access_token', token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        // English: Clear tokens and state
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');

        // English: Clear localStorage specifically
        localStorage.removeItem('auth-storage');

        set({ user: null, isAuthenticated: false });

        // English: Hard redirect to clear any residual memory state
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },

      checkAuth: () => {
        const token = Cookies.get('access_token');
        const hasUser = !!get().user;
        set({ isAuthenticated: !!token && hasUser });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // English: Prevent hydration errors by waiting for the client
      onRehydrateStorage: () => (state) => {
        if (state) state.checkAuth();
      },
    },
  ),
);
