// "Ask the Gita" client. In demo mode it answers locally from the verse seed;
// with EXPO_PUBLIC_API_URL set it calls the Spring Boot /v1/ask endpoint instead.
import { verses, verseById } from './content';
import type { AskResult } from './types';

const CRISIS = [
  'suicide', 'kill myself', 'end my life', "don't want to live", 'dont want to live', 'want to die',
  'hopeless', "can't go on", 'cant go on', 'self harm', 'hurt myself', 'मरना चाहता', 'मरना चाहती', 'जीना नहीं',
];

const KEYWORDS: Record<string, string[]> = {
  stress: ['stress', 'anxious', 'anxiety', 'worried', 'worry', 'scared', 'afraid', 'fear', 'nervous', 'pressure', 'interview', 'presentation'],
  exams: ['exam', 'test', 'study', 'marks', 'result'],
  anger: ['angry', 'anger', 'rage', 'irritated', 'fight', 'argument'],
  motivation: ['lazy', 'motivation', 'stuck', 'procrastinat', 'tired', 'give up', 'no energy'],
  grief: ['loss', 'lost', 'grief', 'died', 'death', 'miss'],
  career: ['job', 'career', 'boss', 'work', 'promotion', 'office', 'quit'],
  balance: ['balance', 'success', 'failure', 'fail'],
};

export const FREE_DAILY_QUESTIONS = 5;

export function isCrisis(text: string) {
  const t = text.toLowerCase();
  return CRISIS.some((w) => t.includes(w));
}

export function answerLocally(question: string): AskResult {
  if (isCrisis(question)) return { kind: 'safety' };
  const q = question.toLowerCase();
  const scores = new Map<string, number>();
  for (const [theme, words] of Object.entries(KEYWORDS)) {
    const hits = words.filter((w) => q.includes(w)).length;
    if (!hits) continue;
    for (const v of verses) if (v.themes.includes(theme)) scores.set(v.id, (scores.get(v.id) ?? 0) + hits);
  }
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  const picks = (ranked.length ? ranked : ['2.47', '2.48']).slice(0, 2);
  const main = verseById(picks[0])!;
  const text =
    `What you are feeling is very human, and Krishna speaks to it directly. ${main.meaning} ` +
    `In everyday terms: ${main.lifeNote}`;
  return { kind: 'answer', text, verses: picks, action: main.actions[0] };
}
