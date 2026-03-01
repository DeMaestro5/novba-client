import { create } from 'zustand';
import type { User, AuthState, AuthActions, RegisterData } from '@/types/auth';
import { authApi, getErrorMessage } from '@/lib/api';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '@/lib/tokens';

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

let initializingPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  initializeAuth: async () => {
    // Prevent concurrent calls — e.g. AuthProvider + onboarding page retry
    if (initializingPromise) return initializingPromise;

    initializingPromise = (async () => {
      set({ isLoading: true });
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken && !refreshToken) {
        set({ isInitialized: true, isLoading: false });
        return;
      }

      try {
        const response = await authApi.me();
        console.log('[initializeAuth] raw response:', JSON.stringify(response.data, null, 2));
        const user = response.data.data.user as User;
        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('[Auth] initializeAuth failed:', err);
        // Don't clear tokens — could be a temporary network error
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      } finally {
        initializingPromise = null;
      }
    })();

    return initializingPromise;
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      const { user, accessToken, refreshToken } = res.data.data;
      setTokens(accessToken, refreshToken);
      set({
        user: user as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message = getErrorMessage(err);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(data);
      set({ isLoading: false, error: null });
    } catch (err) {
      const message = getErrorMessage(err);
      set({ isLoading: false, error: message });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Fire-and-forget: always clear local state and redirect
    }
    clearTokens();
    initializingPromise = null; // Reset so next login can re-initialize
    set({ user: null, isAuthenticated: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: User | null) => set({ user, isAuthenticated: user !== null }),
}));
