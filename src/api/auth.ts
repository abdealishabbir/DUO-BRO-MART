export type PortalRole = 'customer' | 'vendor' | 'admin';

export interface ApiUser { name: string; email: string; phone: string; role: PortalRole; email_verified: boolean; must_change_password: boolean }

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const startSocialLogin = (provider: 'google' | 'facebook') => { window.location.assign(`${API_URL}/auth/social/${provider}/`); };

async function request<T>(path: string, body: Record<string, string> = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail || Object.values(data).flat().join(' ') || 'Unable to complete your request.';
    throw new Error(detail);
  }
  return data as T;
}

export async function registerCustomer(data: { fullName: string; email: string; phone: string; password: string }) {
  return request<{ user: ApiUser; tokens: { access: string } }>('/auth/signup/', { full_name: data.fullName, email: data.email, phone: data.phone, password: data.password });
}

export async function login(data: { email: string; password: string; portal: PortalRole }) {
  return request<{ user: ApiUser; tokens: { access: string } }>('/auth/login/', data);
}

export const verifyEmail = (uid: string, token: string) => request<{ detail: string }>(`/auth/verify-email/${uid}/${token}/`);
export const requestPasswordReset = (email: string) => request<{ detail: string }>('/auth/password-reset/', { email });
export const confirmPasswordReset = (uid: string, token: string, password: string) => request<{ detail: string }>('/auth/password-reset/confirm/', { uid, token, password });
export const changePassword = (access: string, current_password: string, new_password: string) => fetch(`${API_URL}/auth/change-password/`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` }, body: JSON.stringify({ current_password, new_password }) }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.detail || Object.values(data).flat().join(' ')); return data as { detail: string }; });
export const refreshSession = () => request<{ user: ApiUser; tokens: { access: string } }>('/auth/refresh/');
