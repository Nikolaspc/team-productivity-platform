import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
}

// English: Using persist middleware to keep user data after page reload
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      // English: Check for refresh_token to match our proxy.ts logic
      isAuthenticated: !!Cookies.get('refresh_token'),
      setAuth: (user, token) => {
        // English: Although the server sets refresh_token via HttpOnly,
        // we store the access_token for client-side API calls.
        Cookies.set('access_token', token, {
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        // English: Clear all possible tokens and redirect
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        set({ user: null, isAuthenticated: false });
        window.location.href = '/auth/login';
      },
    }),
    {
      name: 'auth-storage', // English: Key for localStorage
    },
  ),
);
