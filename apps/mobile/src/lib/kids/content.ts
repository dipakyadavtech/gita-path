// Kids mode content (packages/content/data/kids.json): shlokas, story extras, game words, stickers.
import kidsJson from '@/content/kids.json';
import { stories } from '../content';

export type KidsWord = { dev: string; iast: string };
export type KidsShloka = {
  id: string;
  verseId: string;
  title: string;
  character: 'moru' | 'gopal' | 'chintu';
  lines: { sanskrit: string; words: KidsWord[] }[];
  simpleMeaning: string;
  pocketWord: { word: string; meaning: string };
};
export type KidsEpisode = { shlokaId: string; moral: string; talkAbout: string; captions: { at: number; hi: string; en: string }[] };
export type GameWord = { id: string; word: string; sanskrit: string; meaning: string; emoji: string };
export type StickerRule = { story?: string; shloka?: string; games?: number; stars?: number; questDays?: number; allOthers?: boolean };
export type Sticker = { id: string; name: string; emoji: string; how: string; rule: StickerRule };

const data = kidsJson as unknown as {
  shlokas: KidsShloka[];
  episodes: Record<string, KidsEpisode>;
  words: GameWord[];
  stickers: Sticker[];
  rewards: { story: number; shloka: number; game: number; questBonus: number };
};

export const kidsShlokas = data.shlokas;
export const kidsWords = data.words;
export const stickers = data.stickers;
export const REWARDS = data.rewards;
export const kidsStories = stories.filter((s) => s.kids);

export const shlokaById = (id: string) => kidsShlokas.find((s) => s.id === id);
export const episodeFor = (storyId: string) => data.episodes[storyId];

export const CHARACTERS = {
  moru: { name: 'Moru', emoji: '🦚', color: '#1E6FD9', tint: '#DDEFFF', about: 'the friendly peacock' },
  gopal: { name: 'Gopal', emoji: '🐄', color: '#0F5E63', tint: '#E2F1F1', about: 'the gentle calf' },
  chintu: { name: 'Chintu', emoji: '🐿️', color: '#C2410C', tint: '#FDEBDD', about: 'the curious squirrel' },
} as const;

export const AVATARS = ['moru', 'gopal', 'chintu', 'radha', 'surabhi'] as const;
export type AvatarId = (typeof AVATARS)[number];
export const AVATAR_EMOJI: Record<AvatarId, string> = { moru: '🦚', gopal: '🐄', chintu: '🐿️', radha: '🌸', surabhi: '🐮' };

/** Same story/shloka for everyone on a given day, rotating daily. */
const dayIndex = (dateKey: string) => Math.floor(new Date(`${dateKey}T00:00:00`).getTime() / 86_400_000);
export const storyOfTheDay = (dateKey: string) => kidsStories[dayIndex(dateKey) % kidsStories.length];
export const shlokaOfTheDay = (dateKey: string) => {
  const ep = episodeFor(storyOfTheDay(dateKey).id);
  return shlokaById(ep?.shlokaId ?? '') ?? kidsShlokas[0];
};

/** Four words for today's matching game (rotates daily). */
export function gameWordsFor(dateKey: string, round = 0) {
  const start = (dayIndex(dateKey) + round) % kidsWords.length;
  return Array.from({ length: 4 }, (_, i) => kidsWords[(start + i) % kidsWords.length]);
}
