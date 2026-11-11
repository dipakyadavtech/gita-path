import { pathVerses, topics, verseById } from './content';
import type { StepState, Verse } from './types';

const goalTheme: Record<string, string> = {
  'Stress and anxiety': 'stress',
  'Career and purpose': 'career',
  Relationships: 'anger',
  'Discipline and habits': 'motivation',
};

/** The verse of the day: the first verse on the path the user has not completed. */
export function verseOfTheDay(steps: Record<string, StepState>): Verse {
  const path = pathVerses(2);
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

export function pathProgress(steps: Record<string, StepState>) {
  const done = Object.values(steps).filter((s) => s.completedAt).length;
  return { done, total: 72 };
}

export function relatedVerses(theme: string) {
  return topics.find((t) => t.id === theme)?.verses.map((id) => verseById(id)!).filter(Boolean) ?? [];
}
