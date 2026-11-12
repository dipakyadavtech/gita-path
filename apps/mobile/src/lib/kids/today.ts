// Today's three magic steps for the current child.
import { todayKey } from '../dates';
import { shlokaOfTheDay, storyOfTheDay } from './content';
import type { KidProgress } from './store';

export type StepId = 'watch' | 'sing' | 'play';
export type Step = { id: StepId; title: string; detail: string; done: boolean; open: boolean };

export function todaysSteps(progress: KidProgress, chantGate: boolean, date = todayKey()) {
  const story = storyOfTheDay(date);
  const shloka = shlokaOfTheDay(date);
  const day = progress.days[date] ?? {};
  const watch = { id: 'watch' as const, title: 'Watch the story', detail: story.title, done: !!day.story };
  const sing = { id: 'sing' as const, title: 'Sing the shloka', detail: `Gita ${shloka.verseId}: ${shloka.title}`, done: !!day.shloka };
  const play = { id: 'play' as const, title: 'Play the word game', detail: 'Match Sanskrit words to their meanings', done: !!day.game };
  // With the chant gate on, singing comes first and unlocks the story (parent setting).
  const ordered = chantGate ? [sing, watch, play] : [watch, sing, play];
  const steps: Step[] = ordered.map((s, i) => ({ ...s, open: ordered.slice(0, i).every((p) => p.done) }));
  return { story, shloka, steps, doneCount: steps.filter((s) => s.done).length };
}
