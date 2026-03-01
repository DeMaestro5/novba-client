const ACCESS_TOKEN_KEY = 'novba_access_token';
const REFRESH_TOKEN_KEY = 'novba_refresh_token';

function setCookie(name: string, value: string, maxAge?: number) {
  if (typeof document === 'undefined') return;
  const opts = `path=/; SameSite=Lax${maxAge != null ? `; max-age=${maxAge}` : ''}`;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${opts}`;
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  setCookie(ACCESS_TOKEN_KEY, accessToken);
  setCookie(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('novba_onboarding_completed');
  clearCookie(ACCESS_TOKEN_KEY);
  clearCookie(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
