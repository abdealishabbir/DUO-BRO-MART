export type PortalRole = 'customer' | 'vendor' | 'admin';

export interface ApiUser { name: string; email: string; phone: string; role: PortalRole; email_verified: boolean; must_change_password: boolean }

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(path: string, body: Record<string, string>): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail || Object.values(data).flat().join(' ') || 'Unable to complete your request.';
    throw new Error(detail);
  }
  return data as T;
}

export async function registerCustomer(data: { fullName: string; email: string; phone: string; password: string }) {
  return request<{ user: ApiUser; tokens: { access: string; refresh: string } }>('/auth/signup/', { full_name: data.fullName, email: data.email, phone: data.phone, password: data.password });
}

export async function login(data: { email: string; password: string; portal: PortalRole }) {
  return request<{ user: ApiUser; tokens: { access: string; refresh: string } }>('/auth/login/', data);
}
