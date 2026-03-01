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

    console.log('[interceptor] error', {
      status: error.response?.status,
      url: originalRequest?.url,
      _retry: originalRequest?._retry,
    });

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/refresh')) {
      console.error(
        '[interceptor] /refresh itself returned 401 — refresh token is dead, clearing session',
      );
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const storedRefreshToken = getRefreshToken();
    console.log(
      '[interceptor] 401 on',
      originalRequest.url,
      '— storedRefreshToken present:',
      !!storedRefreshToken,
    );

    if (!storedRefreshToken) {
      console.warn(
        '[interceptor] no refresh token, rejecting without redirect',
      );
      return Promise.reject(error);
    }

    if (isRefreshing) {
      console.log('[interceptor] refresh already in flight, queuing request');
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
    console.log('[interceptor] starting token refresh...');

    return api
      .post<{
        success: true;
        data: { accessToken: string; refreshToken: string };
      }>('/refresh', { refreshToken: storedRefreshToken })
      .then((res) => {
        console.log(
          '[interceptor] token refresh SUCCESS, retrying original request:',
          originalRequest.url,
        );
        const { accessToken: newAccess, refreshToken: newRefresh } = (res.data.data as any).tokens;
        setTokens(newAccess, newRefresh);
        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      })
      .catch((err) => {
        console.error('[interceptor] token refresh FAILED:', {
          status: (err as AxiosError).response?.status,
          data: (err as AxiosError).response?.data,
          message: (err as Error).message,
        });
        processQueue(err, null);
        clearTokens();
        if (typeof window !== 'undefined') {
          console.error('[interceptor] redirecting to /login');
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

// --- OAuth API ---

const oauthBase = baseURL + '/auth/oauth';

export const oauthApi = {
  getGoogleUrl(): string {
    return `${oauthBase}/google`;
  },
  getGitHubUrl(): string {
    return `${oauthBase}/github`;
  },
};

// --- Dashboard API ---

export const dashboardApi = {
  getOverview(params?: { startDate?: string; endDate?: string }) {
    return api.get<{
      success: boolean;
      data: {
        overview: {
          revenue: {
            total: number;
            previousTotal: number;
            percentageChange: number;
            currency: string;
          };
          pendingInvoices: { total: number; count: number; currency: string };
          outstanding: {
            total: number;
            overdueCount: number;
            currency: string;
          };
          activeClients: {
            count: number;
            previousCount: number;
            percentageChange: number;
          };
          expenses: { total: number; currency: string };
          profit: { total: number; currency: string };
          counts: {
            totalClients: number;
            activeProjects: number;
            totalInvoices: number;
            overdueInvoices: number;
          };
        };
      };
    }>('/dashboard/overview', { params });
  },

  getIncomeChart(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    return api.get<{
      success: boolean;
      data: {
        data: Array<{ period: string; amount: number; currency: string }>;
        groupBy: string;
      };
    }>('/dashboard/income-chart', { params });
  },

  getExpensesChart(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    return api.get<{
      success: boolean;
      data: {
        data: {
          byPeriod: Array<{ period: string; amount: number; currency: string }>;
          byCategory: Array<{
            category: string;
            amount: number;
            currency: string;
          }>;
          total: number;
        };
        groupBy: string;
      };
    }>('/dashboard/expenses-chart', { params });
  },

  getClientRevenue(params?: { limit?: number }) {
    return api.get<{
      success: boolean;
      data: {
        clients: Array<{
          clientId: string;
          companyName: string;
          contactName: string | null;
          email: string | null;
          totalRevenue: number;
          totalInvoices: number;
          currency: string;
        }>;
        summary: {
          topNTotal: number;
          grandTotal: number;
          concentrationPercent: number;
          concentrationStatus: 'HEALTHY' | 'MODERATE' | 'CONCENTRATED';
          currency: string;
        };
      };
    }>('/dashboard/client-revenue', { params });
  },

  getCashFlowForecast(params?: { months?: number }) {
    return api.get<{
      success: boolean;
      data: {
        forecast: {
          monthlyForecast: Array<{
            month: string;
            projected: number;
            conservative: number;
            currency: string;
          }>;
          totalExpected: number;
          insights: {
            peakMonth: {
              label: string | null;
              month: string;
              projected: number;
              conservative: number;
              currency: string;
            };
            projectedGrowth: {
              percent: number;
              direction: 'up' | 'down';
              currentMonthTotal: number;
            };
            pipeline: {
              total: number;
              overdueAmount: number;
              overduePercent: number;
            };
          };
        };
      };
    }>('/dashboard/cash-flow-forecast', { params });
  },

  getHealthMetrics() {
    return api.get<{
      success: boolean;
      data: {
        metrics: {
          healthScore: number;
          healthStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION';
          collectionRate: number;
          avgPaymentTime: number;
          clientRetention: number;
          revenueGrowth: number;
        };
      };
    }>('/dashboard/health-metrics');
  },

  getRecentActivity(params?: { limit?: number }) {
    return api.get<{
      success: boolean;
      data: {
        activity: Array<{
          id: string;
          type: 'PAYMENT_RECEIVED' | 'INVOICE_SENT' | 'INVOICE_OVERDUE';
          clientName: string;
          invoiceNumber: string;
          amount: number;
          currency: string;
          timestamp: string | null;
        }>;
      };
    }>('/dashboard/recent-activity', { params });
  },
};

export default api;
