'use strict';
// First start only: imports packages/content (the same seed the API and app use) as approved, published entries.
const fs = require('fs');
const path = require('path');
const { state } = require('./guard');

const DATA = path.join(__dirname, '..', '..', '..', '..', 'packages', 'content', 'data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const approved = { review_status: 'approved', reviewer: 'Seed import' };

async function seed(strapi) {
  if (!fs.existsSync(DATA)) return;
  const verses = strapi.documents('api::verse.verse');
  if ((await verses.count({})) > 0) return;

  state.bypass = true;
  try {
    for (const v of read('verses.json')) {
      await verses.create({
        status: 'published',
        data: {
          verse_id: v.id, chapter: v.chapter, number: v.number, sanskrit: v.sanskrit, iast: v.iast,
          meaning: v.meaning, life_note: v.lifeNote, words: v.words, themes: v.themes, actions: v.actions, audio_url: v.audioUrl || null, video_url: v.videoUrl || null, ...approved,
        },
      });
    }
    for (const s of read('stories.json')) {
      await strapi.documents('api::story.story').create({
        status: 'published',
        data: {
          story_id: s.id, season: s.season, episode: s.episode, title: s.title, minutes: s.minutes,
          verse_id: s.verseId || null, kids_safe: !!s.kidsSafe, kids: !!s.kids, summary: s.summary || null,
          scenes: s.scenes || null, ...approved,
        },
      });
    }
    for (const t of read('topics.json')) {
      await strapi.documents('api::topic-track.topic-track').create({
        status: 'published',
        data: { topic_id: t.id, title: t.title, verses: t.verses, moods: t.moods, ...approved },
      });
    }
    const kids = read('kids.json');
    for (const k of kids.shlokas) {
      await strapi.documents('api::kids-shloka.kids-shloka').create({
        status: 'published',
        data: {
          shloka_id: k.id, verse_id: k.verseId, title: k.title, lines: k.lines, simple_meaning: k.simpleMeaning,
          pocket_word: k.pocketWord, character: k.character, ...approved,
        },
      });
    }
    strapi.log.info('[gita-path] Imported seed content from packages/content.');
  } finally {
    state.bypass = false;
  }
}

module.exports = { seed };
