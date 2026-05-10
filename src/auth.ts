import { API_BASE } from './api.config';

const TOKEN_KEY = 'cortex_token';
const USER_KEY  = 'cortex_user';

// ── Token Helpers ─────────────────────────────────────────────────────────────
export const getToken  = (): string | null => localStorage.getItem(TOKEN_KEY);
export const getUser   = (): any | null => {
  const s = localStorage.getItem(USER_KEY);
  return s ? JSON.parse(s) : null;
};
export const isLoggedIn = (): boolean => !!getToken();

export const saveSession = (token: string, user: any) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // keep legacy 'user' key so existing components still work
  localStorage.setItem('user', JSON.stringify({ ...user, id: user.id }));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('user');
};

// ── API calls ─────────────────────────────────────────────────────────────────
export async function apiRegister(name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Registration failed');
  return data;
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

export async function apiMe(token: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Session expired');
  return res.json();
}
