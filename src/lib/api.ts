import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '@/lib/tokens';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: Error | null, newAccessToken: string | null) {
  failedQueue.forEach((prom) => {
    if (error || !newAccessToken) {
      prom.reject(error);
    } else {
      prom.resolve(newAccessToken);
    }
  });
  failedQueue = [];
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      if (typeof window !== 'undefined') {
        clearTokens();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      if (typeof window !== 'undefined') {
        clearTokens();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    return api
      .post<{
        success: true;
        data: { accessToken: string; refreshToken: string };
      }>('/refresh', { refreshToken })
      .then((res) => {
        const { accessToken: newAccess, refreshToken: newRefresh } =
          res.data.data;
        setTokens(newAccess, newRefresh);
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      })
      .catch((err) => {
        processQueue(err, null);
        if (typeof window !== 'undefined') {
          clearTokens();
          window.location.href = '/login';
        }
        return Promise.reject(err);
      })
      .finally(() => {
        isRefreshing = false;
      });
  },
);

export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{
    error?: { message?: string };
    message?: string;
  }>;
  return (
    axiosError.response?.data?.error?.message ||
    axiosError.response?.data?.message ||
    (axiosError instanceof Error ? axiosError.message : 'Something went wrong')
  );
}

// --- Auth API ---

export const authApi = {
  login(email: string, password: string) {
    return api.post<{
      success: boolean;
      data: {
        user: import('@/types/auth').User;
        accessToken: string;
        refreshToken: string;
      };
    }>('/login', { email, password });
  },

  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return api.post<{ success: boolean; data?: unknown }>('/signup', {
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      password: data.password,
    });
  },

  /** DELETE /logout — Bearer token auto-attached. Fire-and-forget on client. */
  logout() {
    return api.delete<{ success: true; message: string }>('/logout');
  },

  refresh(refreshToken: string) {
    return api.post<{
      success: boolean;
      data: { accessToken: string; refreshToken: string };
    }>('/refresh', { refreshToken });
  },

  forgotPassword(email: string) {
    return api.post('/forgot-password', { email });
  },

  resetPassword(token: string, email: string, password: string) {
    return api.post('/reset-password', { token, email, password });
  },

  verifyEmail(token: string) {
    return api.post('/verify-email', { token });
  },

  resendVerification(email: string) {
    return api.post('/resend-verification', { email });
  },

  me() {
    return api.get<{ data: { user: import('@/types/auth').User } }>('/profile');
  },
};

// --- OAuth API (URLs only, full page redirect) ---

const oauthBase = baseURL + '/auth/oauth';

export const oauthApi = {
  getGoogleUrl(): string {
    return `${oauthBase}/google`;
  },
  getGitHubUrl(): string {
    return `${oauthBase}/github`;
  },
};

export default api;
