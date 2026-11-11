// Client for the Spring Boot admin endpoints (/admin/v1/*). All calls need an admin token.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
export const CMS_URL = (import.meta.env.VITE_CMS_URL || 'http://localhost:1337').replace(/\/+$/, '');

let getToken: () => Promise<string | null> = async () => sessionStorage.getItem('gp-admin-token');
export function setTokenGetter(fn: () => Promise<string | null>) {
  getToken = fn;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string>),
    },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      res.status === 401 ? 'Your session has ended. Sign in again.'
      : res.status === 403 ? 'This account is not a Gita Path admin.'
      : body?.message ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, msg);
  }
  return body as T;
}

// ---- Types (mirror services/api) -------------------------------------------
export type Verse = {
  id: string; chapter: number; number: number; sanskrit: string[]; iast: string;
  meaning: string; lifeNote: string; words: string[][]; themes: string[]; actions: string[];
};
export type VerseRow = { verse: Verse; checksum: string | null; updatedAt: string | null };
export type Stats = {
  users: number; versesLive: number; chaptersWithVerses: number; storiesLive: number; stepsCompletedToday: number;
  questionsThisWeek: number; openFlags: number; resolvedFlagsThisWeek: number; crisisRepliesThisWeek: number;
};
export type Flag = {
  id: string; question: string; answer: string | null; cited: string; flag_reason: string | null; safety_label: string;
  created_at: string; reviewed: boolean; review_action: string | null; review_note: string | null;
  reviewed_by: string | null; reviewed_at: string | null;
};

export const adminApi = {
  stats: () => api<Stats>('/admin/v1/stats'),
  verses: () => api<VerseRow[]>('/admin/v1/verses'),
  verse: (id: string) => api<VerseRow>(`/admin/v1/verses/${encodeURIComponent(id)}`),
  flags: (status: 'open' | 'resolved' | 'all') => api<Flag[]>(`/admin/v1/ai/flags?status=${status}`),
  resolve: (id: string, action: 'dismissed' | 'confirmed', note: string) =>
    api<void>(`/admin/v1/ai/flags/${id}/resolve`, { method: 'POST', body: JSON.stringify({ action, note: note || null }) }),
  devToken: (phone: string, otp: string, name: string) =>
    api<{ token: string; userId: string }>('/v1/auth/dev-token', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, name, admin: true }),
    }),
};

/** Link that opens a verse in the Strapi admin for editing. */
export const strapiVerseLink = () => `${CMS_URL}/admin/content-manager/collection-types/api::verse.verse`;
