import { getStoredToken } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type ApiOptions = Omit<RequestInit, 'body'> & { body?: object };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, ...rest } = options;
  const token = getStoredToken();
  const headers: Record<string, string> = { ...((rest.headers as Record<string, string>) ?? {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...rest,
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed');
  return data as T;
}

export function getApiBase(): string {
  return API_BASE;
}export async function fetchAuthorizedBlob(path: string): Promise<Blob> {
  const token = getStoredToken();
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || res.statusText || 'Request failed');
  }
  return res.blob();
}
