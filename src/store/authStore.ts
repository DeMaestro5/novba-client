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
    const currentState = get();
    console.log(
      '[initializeAuth] called — isAuthenticated:',
      currentState.isAuthenticated,
      '| isInitialized:',
      currentState.isInitialized,
      '| user:',
      currentState.user?.email ?? null,
    );

    if (currentState.isAuthenticated && currentState.user) {
      console.log(
        '[initializeAuth] already authenticated, skipping /profile call',
      );
      set({ isInitialized: true });
      return;
    }

    if (initializingPromise) {
      console.log(
        '[initializeAuth] already in flight, returning existing promise',
      );
      return initializingPromise;
    }

    initializingPromise = (async () => {
      set({ isLoading: true });
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      console.log(
        '[initializeAuth] tokens — accessToken present:',
        !!accessToken,
        '| refreshToken present:',
        !!refreshToken,
      );

      if (!accessToken && !refreshToken) {
        console.log(
          '[initializeAuth] no tokens, marking initialized as unauthenticated',
        );
        set({ isInitialized: true, isLoading: false });
        return;
      }

      try {
        console.log('[initializeAuth] calling /profile...');
        const response = await authApi.me();
        console.log(
          '[initializeAuth] /profile SUCCESS:',
          JSON.stringify(response.data, null, 2),
        );
        const user = response.data.data.user as User;
        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
        console.log(
          '[initializeAuth] store updated — authenticated as',
          user.email,
        );
      } catch (err) {
        console.error('[initializeAuth] /profile FAILED:', err);
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
        console.warn(
          '[initializeAuth] store updated — unauthenticated (tokens kept)',
        );
      } finally {
        initializingPromise = null;
      }
    })();

    return initializingPromise;
  },

  login: async (email: string, password: string) => {
    console.log('[login] attempting login for:', email);
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      console.log(
        '[login] raw response data:',
        JSON.stringify(res.data, null, 2),
      );
      const { user, tokens } = res.data.data as any;
      const { accessToken, refreshToken } = tokens;
      console.log(
        '[login] SUCCESS — user:',
        user.email,
        '| accessToken present:',
        !!accessToken,
        '| refreshToken present:',
        !!refreshToken,
      );
      setTokens(accessToken, refreshToken);
      console.log('[login] tokens saved, updating store...');
      set({
        user: user as User,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
        error: null,
      });
      console.log(
        '[login] store updated — isAuthenticated: true, isInitialized: true',
      );
    } catch (err) {
      const message = getErrorMessage(err);
      console.error('[login] FAILED:', message);
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
    console.log('[logout] logging out...');
    try {
      await authApi.logout();
    } catch {
      // Fire-and-forget
    }
    clearTokens();
    initializingPromise = null;
    set({ user: null, isAuthenticated: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  clearError: () => set({ error: null }),

  setUser: (user: User | null) => set({ user, isAuthenticated: user !== null }),
}));
