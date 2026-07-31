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

/**
 * 尝试解析 JWT payload。如果不是 JWT 格式或解析失败，返回 null。
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * 判断本地 token 是否有效。
 * - 如果 token 不存在，返回 false
 * - 如果 token 是 JWT 且包含 exp 字段，根据过期时间判断
 * - 如果 token 不是 JWT 格式，只要存在就视为有效
 */
export function isTokenValid(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (payload && typeof payload.exp === 'number') {
    return Date.now() < payload.exp * 1000;
  }

  return true;
}
