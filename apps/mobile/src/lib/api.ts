// Client for the Spring Boot API (services/api).
// The app is local-first: everything works without a server. When EXPO_PUBLIC_API_URL is set,
// progress is synced to the server and the Ask tab uses the server's Guide.
import { useApp } from './store';
import type { AskResult, StepState, Streak } from './types';

export const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') || '';
export const apiEnabled = API_URL.length > 0;

/** Returns a fresh bearer token. Clerk mode replaces this (see clerk.tsx). */
let tokenProvider: () => Promise<string | undefined> = async () => useApp.getState().session?.token;
export function setTokenProvider(fn: () => Promise<string | undefined>) {
  tokenProvider = fn;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

const timezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
};

export async function api<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-Timezone': timezone() };
  if (init.auth !== false) {
    const token = await tokenProvider();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers: { ...headers, ...(init.headers as object) } });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.code ?? `E-${res.status}`, body?.message ?? 'Something went wrong');
  return body as T;
}

// ---- Auth (dev mode) --------------------------------------------------------
export function devToken(phone: string, otp: string, name: string) {
  return api<{ token: string; userId: string }>('/v1/auth/dev-token', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ phone, otp, name }),
  });
}

// ---- Learning ---------------------------------------------------------------
type ServerStep = {
  verseId: string; listened: boolean; understood: boolean; actionDone: boolean;
  chantCount: number; actionCheckIn: string | null; completedAt: string | null;
};
type ServerStreak = { current: number; longest: number; lastDate: string | null; freezes: number };

const toStep = (s: ServerStep): StepState => ({
  listened: s.listened,
  understood: s.understood,
  action: s.actionDone,
  chantCount: s.chantCount,
  completedAt: s.completedAt ?? undefined,
  actionCheckIn: s.actionCheckIn === 'yes' || s.actionCheckIn === 'no' ? s.actionCheckIn : undefined,
});
const toStreak = (s: ServerStreak): Streak => ({ current: s.current, longest: s.longest, lastDate: s.lastDate, freezes: s.freezes });

/** Pulls steps + streak from the server and merges them into the local store. */
export async function pullProgress() {
  if (!apiEnabled || !useApp.getState().session) return;
  const p = await api<{ steps: Record<string, ServerStep>; streak: ServerStreak }>('/v1/progress');
  const local = useApp.getState();
  const steps = { ...local.steps };
  for (const [id, s] of Object.entries(p.steps)) steps[id] = { ...steps[id], ...toStep(s) };
  const streak = p.streak.current >= local.streak.current ? toStreak(p.streak) : local.streak;
  useApp.setState({ steps, streak });
}

/** Sends a step change. Failures are ignored: local state is the source of truth on the phone. */
export function pushStep(verseId: string, patch: Partial<StepState>) {
  if (!apiEnabled) return;
  const body = {
    listened: patch.listened,
    understood: patch.understood,
    actionDone: patch.action,
    chantCount: patch.chantCount,
    actionCheckIn: patch.actionCheckIn,
  };
  api(`/v1/progress/${verseId}`, { method: 'PATCH', body: JSON.stringify(body) }).catch(() => {});
}

export async function pushComplete(verseId: string) {
  if (!apiEnabled) return;
  try {
    const r = await api<{ streak: ServerStreak; increased: boolean }>(`/v1/progress/${verseId}/complete`, { method: 'POST' });
    useApp.setState({ streak: toStreak(r.streak) });
  } catch {
    // keep the local streak; next pullProgress reconciles
  }
}

// ---- Guide ------------------------------------------------------------------
export async function askServer(question: string): Promise<AskResult> {
  try {
    const r = await api<{ kind: string; id: string; text: string | null; verses: string[]; action: string | null }>('/v1/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
    if (r.kind === 'safety') return { kind: 'safety' };
    return { kind: 'answer', text: r.text ?? '', verses: r.verses, action: r.action ?? '', id: r.id };
  } catch (e) {
    if (e instanceof ApiError && e.status === 429) return { kind: 'limit' };
    throw e;
  }
}

export function flagAnswer(id: string, reason: string) {
  if (!apiEnabled) return Promise.resolve();
  return api(`/v1/ask/${id}/flag`, { method: 'POST', body: JSON.stringify({ reason }) }).catch(() => {});
}
