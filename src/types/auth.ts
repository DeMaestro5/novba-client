export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicUrl?: string;
  verified: boolean;
  onboardingCompleted: boolean;
  plan: 'free' | 'pro' | 'studio';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
