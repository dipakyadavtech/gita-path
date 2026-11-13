import { chapterByNumber, PATH_ORDER, pathVerses, topics, verseById } from './content';
import type { StepState, Verse } from './types';

const goalTheme: Record<string, string> = {
  'Stress and anxiety': 'stress',
  'Career and purpose': 'career',
  Relationships: 'anger',
  'Discipline and habits': 'motivation',
};

/** The chapter the user is learning now: the first chapter in learning order with an unfinished verse. */
export function currentChapter(steps: Record<string, StepState>): number {
  return PATH_ORDER.find((n) => pathVerses(n).some((v) => !steps[v.id]?.completedAt)) ?? PATH_ORDER[PATH_ORDER.length - 1];
}

/** The verse of the day: the first verse in the current chapter the user has not completed. */
export function verseOfTheDay(steps: Record<string, StepState>): Verse {
  const path = pathVerses(currentChapter(steps));
  return path.find((v) => !steps[v.id]?.completedAt) ?? path[path.length - 1];
}

/** Picks the action of the day; the index rotates by date so it changes daily. */
export function actionOfTheDay(v: Verse, date = new Date()) {
  return v.actions[date.getDate() % v.actions.length];
}

export function topicForMood(mood: string) {
  return topics.find((t) => t.moods.includes(mood));
}

export function goalThemes(goals: string[]) {
  return goals.map((g) => goalTheme[g]).filter(Boolean);
}

/** Progress through the current chapter. */
export function pathProgress(steps: Record<string, StepState>) {
  const n = currentChapter(steps);
  const verses = pathVerses(n);
  const done = verses.filter((v) => steps[v.id]?.completedAt).length;
  return { chapter: chapterByNumber(n)!, done, total: verses.length };
}

export function relatedVerses(theme: string) {
  return topics.find((t) => t.id === theme)?.verses.map((id) => verseById(id)!).filter(Boolean) ?? [];
}
