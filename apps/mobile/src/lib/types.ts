export type Verse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  iast: string;
  meaning: string;
  lifeNote: string;
  words: [string, string, string][];
  themes: string[];
  actions: string[];
  /** Recitation recording. Absent until a studio recording is published in the CMS. */
  audioUrl?: string | null;
};
export type Chapter = { number: number; name: string; english: string; verseCount: number };
export type Story = {
  id: string;
  season: number;
  episode: number;
  title: string;
  minutes: number;
  verseId: string | null;
  kidsSafe: boolean;
  kids?: boolean;
  summary?: string;
  scenes?: [string, string][];
};
export type Topic = { id: string; title: string; verses: string[]; moods: string[] };

export type StepState = { listened: boolean; understood: boolean; action: boolean; chantCount: number; completedAt?: string; actionCheckIn?: 'yes' | 'no' };
export type Streak = { current: number; longest: number; lastDate: string | null; freezes: number };
export type WhoFor = 'me' | 'me-and-child' | 'family';
export type Plan = 'free' | 'plus';

export type AskResult =
  | { kind: 'answer'; text: string; verses: string[]; action: string; id?: string }
  | { kind: 'safety' }
  | { kind: 'limit' };
