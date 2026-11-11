import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { daysBetween, todayKey } from './dates';
import type { Plan, StepState, Streak, WhoFor } from './types';

export type CircleMember = { id: string; name: string; color: string; done: number; status: 'member' | 'pending'; isMe?: boolean; isKid?: boolean };
export type Circle = { id: string; name: string; code: string; ownerId: string; challenge: { title: string; chapter: number; target: number }; members: CircleMember[]; feed: { who: string; what: string; at: string }[] };

export type Session = { userId: string; name: string; phone?: string; provider: 'dev' | 'clerk' | 'guest'; token?: string };

type Prefs = {
  whoFor: WhoFor | null;
  appLanguage: string;
  verseScript: string;
  narration: string;
  goals: string[];
  dailyMinutes: 5 | 10 | 15;
  reminderTime: string;
  notificationsAllowed: boolean | null;
  micAllowed: boolean | null;
  onboarded: boolean;
};

type State = {
  session: Session | null;
  prefs: Prefs;
  steps: Record<string, StepState>;
  streak: Streak;
  bookmarks: Record<string, { note: string; savedAt: string }>;
  quiz: Record<number, { correct: number; total: number }>;
  plan: Plan;
  ask: { date: string; count: number };
  watched: Record<string, string>;
  markWatched: (storyId: string) => void;
  downloads: Record<string, { title: string; mb: number; savedAt: string }>;
  wifiOnly: boolean;
  autoNextChapter: boolean;
  setDownload: (id: string, item: { title: string; mb: number } | null) => void;
  setDownloadPrefs: (p: { wifiOnly?: boolean; autoNextChapter?: boolean }) => void;
  circle: Circle | null;
  setCircle: (c: Circle | null) => void;
  // actions
  setSession: (s: Session | null) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  markStep: (verseId: string, patch: Partial<StepState>) => void;
  completeVerse: (verseId: string) => { streakIncreased: boolean; streak: number };
  toggleBookmark: (verseId: string, note?: string) => void;
  setNote: (verseId: string, note: string) => void;
  saveQuiz: (chapter: number, correct: number, total: number) => void;
  setPlan: (p: Plan) => void;
  countAsk: () => number;
  reset: () => void;
};

const emptyStep: StepState = { listened: false, understood: false, action: false, chantCount: 0 };
const initial = {
  session: null as Session | null,
  prefs: {
    whoFor: null,
    appLanguage: 'English',
    verseScript: 'Devanagari',
    narration: 'हिन्दी',
    goals: [],
    dailyMinutes: 10,
    reminderTime: '7:00 am',
    notificationsAllowed: null,
    micAllowed: null,
    onboarded: false,
  } as Prefs,
  steps: {} as Record<string, StepState>,
  streak: { current: 0, longest: 0, lastDate: null, freezes: 1 } as Streak,
  bookmarks: {} as Record<string, { note: string; savedAt: string }>,
  quiz: {} as Record<number, { correct: number; total: number }>,
  plan: 'free' as Plan,
  ask: { date: todayKey(), count: 0 },
  watched: {} as Record<string, string>,
  downloads: { today: { title: "Today's verse + next 7 steps", mb: 24, savedAt: new Date().toISOString() } } as Record<string, { title: string; mb: number; savedAt: string }>,
  wifiOnly: true,
  autoNextChapter: false,
  circle: null as Circle | null,
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setSession: (session) => set({ session }),
      setPrefs: (p) => set({ prefs: { ...get().prefs, ...p } }),
      markStep: (verseId, patch) => set({ steps: { ...get().steps, [verseId]: { ...emptyStep, ...get().steps[verseId], ...patch } } }),
      completeVerse: (verseId) => {
        const today = todayKey();
        const s = get().streak;
        const step = { ...emptyStep, ...get().steps[verseId], completedAt: new Date().toISOString() };
        let current = s.current;
        let freezes = s.freezes;
        let increased = false;
        if (s.lastDate !== today) {
          const gap = s.lastDate ? daysBetween(s.lastDate, today) : 1;
          if (gap === 1) current += 1;
          else if (gap === 2 && freezes > 0) { current += 1; freezes -= 1; }
          else current = 1;
          increased = true;
        }
        set({
          steps: { ...get().steps, [verseId]: step },
          streak: { current, longest: Math.max(s.longest, current), lastDate: today, freezes },
        });
        return { streakIncreased: increased, streak: current };
      },
      toggleBookmark: (verseId, note = '') => {
        const b = { ...get().bookmarks };
        if (b[verseId]) delete b[verseId];
        else b[verseId] = { note, savedAt: new Date().toISOString() };
        set({ bookmarks: b });
      },
      setNote: (verseId, note) => set({ bookmarks: { ...get().bookmarks, [verseId]: { note, savedAt: get().bookmarks[verseId]?.savedAt ?? new Date().toISOString() } } }),
      saveQuiz: (chapter, correct, total) => set({ quiz: { ...get().quiz, [chapter]: { correct, total } } }),
      setPlan: (plan) => set({ plan }),
      countAsk: () => {
        const today = todayKey();
        const a = get().ask.date === today ? get().ask : { date: today, count: 0 };
        const next = { date: today, count: a.count + 1 };
        set({ ask: next });
        return next.count;
      },
      markWatched: (storyId) => set({ watched: { ...get().watched, [storyId]: new Date().toISOString() } }),
      setDownload: (id, item) => {
        const d = { ...get().downloads };
        if (item) d[id] = { ...item, savedAt: new Date().toISOString() };
        else delete d[id];
        set({ downloads: d });
      },
      setDownloadPrefs: (p) => set({ wifiOnly: p.wifiOnly ?? get().wifiOnly, autoNextChapter: p.autoNextChapter ?? get().autoNextChapter }),
      setCircle: (circle) => set({ circle }),
      reset: () => set({ ...initial }),
    }),
    { name: 'gita-path', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
