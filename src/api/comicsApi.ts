import type { ComicBook } from '../types/comic';

const BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'เกิดข้อผิดพลาดจากระบบ');
  }
  if (response.status === 204) return undefined as T;
  return response.json();
};

export const fetchComics = async (): Promise<ComicBook[]> => {
  return request<ComicBook[]>('/comics');
};

export const fetchComicById = async (id: string): Promise<ComicBook> => {
  return request<ComicBook>(`/comics/${encodeURIComponent(id)}`);
};

export interface ComicInput {
  id: number;
  title: string;
  author: string;
  language: string;
  downloadCount: number;
  pointCost: number;
  coverUrl: string;
  subject: string;
  synopsis: string;
}

export interface AdminCredentials {
  email: string;
  password: string;
}

const adminAuthorization = ({ email, password }: AdminCredentials) => {
  const bytes = new TextEncoder().encode(`${email}:${password}`);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return `Basic ${btoa(binary)}`;
};

export const createComic = (comic: ComicInput, credentials: AdminCredentials) =>
  request<ComicBook>('/comics', {
    method: 'POST',
    headers: { Authorization: adminAuthorization(credentials) },
    body: JSON.stringify(comic),
  });

export const updateComic = (
  id: number,
  comic: Omit<ComicInput, 'id'>,
  credentials: AdminCredentials,
) =>
  request<ComicBook>(`/comics/${id}`, {
    method: 'PUT',
    headers: { Authorization: adminAuthorization(credentials) },
    body: JSON.stringify(comic),
  });

export const deleteComic = (id: number, credentials: AdminCredentials) =>
  request<void>(`/comics/${id}`, {
    method: 'DELETE',
    headers: { Authorization: adminAuthorization(credentials) },
  });

export interface UserState {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
  points: number;
  collection: number[];
  unlockedBooks: number[];
  transactions: Array<{
    id: string;
    type: 'topup' | 'purchase';
    title: string;
    amount: number;
    date: string;
  }>;
}

export const login = (email: string, password: string) =>
  request<UserState>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (email: string, password: string) =>
  request<UserState>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const getUserState = (userId: number) =>
  request<UserState>(`/users/${userId}/state`);

export const toggleCollection = (userId: number, comicId: number, saved: boolean) =>
  request<UserState>(saved ? `/users/${userId}/collection/${comicId}` : `/users/${userId}/collection`, {
    method: saved ? 'DELETE' : 'POST',
    body: saved ? undefined : JSON.stringify({ comicId }),
  });

export const topUpPoints = (userId: number, amount: number, title: string) =>
  request<UserState>(`/users/${userId}/topup`, {
    method: 'POST',
    body: JSON.stringify({ amount, title }),
  });

export const unlockComic = (userId: number, comicId: number) =>
  request<UserState>(`/users/${userId}/unlock`, {
    method: 'POST',
    body: JSON.stringify({ comicId }),
  });
