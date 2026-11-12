// Kids mode state, on the device. The parent PIN never leaves the phone.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { todayKey } from '../dates';
import { REWARDS, stickers, type AvatarId, type StickerRule } from './content';

export type KidProfile = { id: string; name: string; age: number; avatar: AvatarId };
export type KidProgress = {
  stars: number;
  stories: Record<string, string>; // storyId → first date
  shlokas: Record<string, string>; // shlokaId → first date
  games: number;
  days: Record<string, { story?: boolean; shloka?: boolean; game?: boolean }>;
  stickers: string[];
  newStickers: string[]; // earned but not yet seen in the sticker book
};
export type KidsSettings = {
  dailyLimitMin: number;
  bedtimeOn: boolean;
  bedtimeStart: string; // HH:mm
  bedtimeEnd: string;
  chantGate: boolean; // sing today's shloka before stories unlock
  narration: 'hi+en' | 'hi' | 'en';
  strictness: 'gentle' | 'strict';
};

export const DEFAULT_SETTINGS: KidsSettings = {
  dailyLimitMin: 15, bedtimeOn: true, bedtimeStart: '19:30', bedtimeEnd: '07:00', chantGate: true, narration: 'hi+en', strictness: 'gentle',
};
const emptyProgress = (): KidProgress => ({ stars: 0, stories: {}, shlokas: {}, games: 0, days: {}, stickers: [], newStickers: [] });

/** A parental gate, not a password: hashed so the PIN isn't stored as typed. */
export function hashPin(pin: string) {
  let h = 2166136261;
  for (const c of `gita-path-kids:${pin}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16);
}

function earned(rule: StickerRule, p: KidProgress, owned: string[]): boolean {
  if (rule.story) return !!p.stories[rule.story];
  if (rule.shloka) return !!p.shlokas[rule.shloka];
  if (rule.games) return p.games >= rule.games;
  if (rule.stars) return p.stars >= rule.stars;
  if (rule.questDays) return Object.values(p.days).filter((d) => d.story && d.shloka && d.game).length >= rule.questDays;
  if (rule.allOthers) return stickers.filter((s) => !s.rule.allOthers).every((s) => owned.includes(s.id));
  return false;
}

type State = {
  active: boolean; // the app is locked into Kids mode
  pinHash: string | null;
  profiles: KidProfile[];
  currentId: string | null;
  progress: Record<string, KidProgress>;
  usage: Record<string, { date: string; seconds: number }>;
  extra: { date: string; minutes: number } | null; // parent-granted extra time today
  settings: KidsSettings;

  setPin: (pin: string) => void;
  checkPin: (pin: string) => boolean;
  saveProfile: (p: KidProfile) => void;
  removeProfile: (id: string) => void;
  select: (id: string) => void;
  setActive: (on: boolean) => void;
  award: (kind: 'story' | 'shloka' | 'game', itemId: string) => { stars: number; gained: number; newStickers: string[] };
  seenStickers: () => void;
  addUsage: (seconds: number) => void;
  grantExtra: (minutes: number) => void;
  setSettings: (s: Partial<KidsSettings>) => void;
  reset: () => void;
};

const initial = {
  active: false,
  pinHash: null as string | null,
  profiles: [] as KidProfile[],
  currentId: null as string | null,
  progress: {} as Record<string, KidProgress>,
  usage: {} as Record<string, { date: string; seconds: number }>,
  extra: null as { date: string; minutes: number } | null,
  settings: DEFAULT_SETTINGS,
};

export const useKids = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setPin: (pin) => set({ pinHash: hashPin(pin) }),
      checkPin: (pin) => get().pinHash === hashPin(pin),
      saveProfile: (p) =>
        set((s) => ({
          profiles: s.profiles.some((x) => x.id === p.id) ? s.profiles.map((x) => (x.id === p.id ? p : x)) : [...s.profiles, p],
          currentId: s.currentId ?? p.id,
        })),
      removeProfile: (id) =>
        set((s) => {
          const profiles = s.profiles.filter((p) => p.id !== id);
          const progress = { ...s.progress };
          delete progress[id];
          return { profiles, progress, currentId: s.currentId === id ? profiles[0]?.id ?? null : s.currentId };
        }),
      select: (id) => set({ currentId: id }),
      setActive: (on) => set({ active: on }),
      award: (kind, itemId) => {
        const id = get().currentId;
        if (!id) return { stars: 0, gained: 0, newStickers: [] };
        const today = todayKey();
        const p = { ...(get().progress[id] ?? emptyProgress()) };
        const day = { ...(p.days[today] ?? {}) };
        let gained = 0;
        if (kind === 'story') {
          gained = p.stories[itemId] ? 5 : REWARDS.story; // replays still earn a little
          p.stories = { ...p.stories, [itemId]: p.stories[itemId] ?? today };
          day.story = true;
        } else if (kind === 'shloka') {
          gained = p.shlokas[itemId] ? 5 : REWARDS.shloka;
          p.shlokas = { ...p.shlokas, [itemId]: p.shlokas[itemId] ?? today };
          day.shloka = true;
        } else {
          gained = REWARDS.game;
          p.games += 1;
          day.game = true;
        }
        const questDone = day.story && day.shloka && day.game;
        const wasDone = p.days[today]?.story && p.days[today]?.shloka && p.days[today]?.game;
        if (questDone && !wasDone) gained += REWARDS.questBonus;
        p.days = { ...p.days, [today]: day };
        p.stars += gained;
        const owned = [...p.stickers];
        const fresh: string[] = [];
        // two passes so "collect every other sticker" can unlock in the same step
        for (let pass = 0; pass < 2; pass++) {
          for (const st of stickers) {
            if (!owned.includes(st.id) && earned(st.rule, p, owned)) {
              owned.push(st.id);
              fresh.push(st.id);
            }
          }
        }
        p.stickers = owned;
        p.newStickers = [...p.newStickers, ...fresh];
        set((s) => ({ progress: { ...s.progress, [id]: p } }));
        return { stars: p.stars, gained, newStickers: fresh };
      },
      seenStickers: () => {
        const id = get().currentId;
        if (!id || !get().progress[id]) return;
        set((s) => ({ progress: { ...s.progress, [id]: { ...s.progress[id], newStickers: [] } } }));
      },
      addUsage: (seconds) => {
        const id = get().currentId;
        if (!id) return;
        const today = todayKey();
        set((s) => {
          const u = s.usage[id];
          const prev = u && u.date === today ? u.seconds : 0;
          return { usage: { ...s.usage, [id]: { date: today, seconds: prev + seconds } } };
        });
      },
      grantExtra: (minutes) =>
        set((s) => {
          const today = todayKey();
          const prev = s.extra && s.extra.date === today ? s.extra.minutes : 0;
          return { extra: { date: today, minutes: prev + minutes } };
        }),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      reset: () => set({ ...initial }),
    }),
    { name: 'gita-path-kids', storage: createJSONStorage(() => AsyncStorage), version: 1 },
  ),
);

export const emptyKidProgress = emptyProgress;

/** The current child and their progress (with safe defaults). */
export function useCurrentKid() {
  const kid = useKids((s) => s.profiles.find((p) => p.id === s.currentId) ?? null);
  const progress = useKids((s) => (s.currentId ? s.progress[s.currentId] : undefined)) ?? emptyProgress();
  return { kid, progress };
}

export function newKidId() {
  // RFC 4122 v4 layout; ids only need to be unique per family.
  const h = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) out += '-';
    else if (i === 14) out += '4';
    else if (i === 19) out += h[8 + Math.floor(Math.random() * 4)];
    else out += h[Math.floor(Math.random() * 16)];
  }
  return out;
}
