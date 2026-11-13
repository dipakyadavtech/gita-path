import chaptersJson from '@/content/chapters.json';
import storiesJson from '@/content/stories.json';
import topicsJson from '@/content/topics.json';
import versesJson from '@/content/verses.json';
import type { Chapter, Story, Topic, Verse } from './types';

export const verses = versesJson as Verse[];
export const chapters = chaptersJson as Chapter[];
export const stories = storiesJson as Story[];
export const topics = topicsJson as Topic[];

export const verseById = (id: string) => verses.find((v) => v.id === id);
export const chapterByNumber = (n: number) => chapters.find((c) => c.number === n);
export const storyById = (id: string) => stories.find((s) => s.id === id);

/** The verses of one chapter that we have content for, in order. */
export const pathVerses = (chapter = 2) => verses.filter((v) => v.chapter === chapter).sort((a, b) => a.number - b.number);

/**
 * Learning order. The path starts with Chapter 2, where Krishna's teaching begins, continues with 3,
 * and offers Chapter 1 (the setting on the battlefield) afterwards. Only chapters with content are used.
 */
export const PATH_ORDER = [2, 3, 1].filter((n) => pathVerses(n).length > 0);

/** Chapters with content, in book order (for the chapter switcher). */
export const contentChapters = () => chapters.filter((c) => pathVerses(c.number).length > 0);

export const MOODS = ['Anxious', 'Exam stress', 'Lost motivation', 'Anger', 'Feeling stuck'] as const;
