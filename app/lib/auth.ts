export const AUTH_TOKEN_KEY = 'amemoryi_token';

export function saveAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function buildAuthHeaders(extraHeaders?: HeadersInit) {
  const token = getAuthToken();
  const headers = new Headers(extraHeaders);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}
