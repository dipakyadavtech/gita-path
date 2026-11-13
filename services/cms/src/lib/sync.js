'use strict';
// Sends published content to the Spring Boot API (POST /internal/content/*).
// The API keeps the master Sanskrit checksum and refuses an unapproved Sanskrit change with 409.

const API_URL = () => (process.env.GITAPATH_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
const SECRET = () => process.env.CMS_WEBHOOK_SECRET || 'dev-cms-secret';

const list = (v) => (Array.isArray(v) ? v : []);

function verseBody(d) {
  return {
    verse: {
      id: d.verse_id,
      chapter: d.chapter,
      number: d.number,
      sanskrit: list(d.sanskrit),
      iast: d.iast,
      meaning: d.meaning,
      lifeNote: d.life_note,
      words: list(d.words),
      themes: list(d.themes),
      actions: list(d.actions),
      audioUrl: d.audio_url || null,
      videoUrl: d.video_url || null,
    },
    sanskritChangeApproved: d.sanskrit_change_approved === true,
  };
}

function storyBody(d) {
  return {
    story: {
      id: d.story_id,
      season: d.season,
      episode: d.episode,
      title: d.title,
      minutes: d.minutes,
      verseId: d.verse_id || null,
      kidsSafe: !!d.kids_safe,
      kids: !!d.kids,
      summary: d.summary || null,
      scenes: Array.isArray(d.scenes) ? d.scenes : null,
    },
  };
}

function kidsShlokaBody(d) {
  return {
    id: d.shloka_id,
    verseId: d.verse_id,
    title: d.title,
    data: {
      lines: list(d.lines),
      simpleMeaning: d.simple_meaning,
      pocketWord: d.pocket_word || null,
      character: d.character || 'moru',
      ageBand: d.age_band || null,
    },
  };
}

/** Content types that sync to the API, with how to build the request. */
const TARGETS = {
  'api::verse.verse': { path: '/internal/content/verses', body: verseBody, label: (d) => `Verse ${d.verse_id}` },
  'api::story.story': { path: '/internal/content/stories', body: storyBody, label: (d) => `Story ${d.story_id}` },
  'api::kids-shloka.kids-shloka': { path: '/internal/content/kids-shlokas', body: kidsShlokaBody, label: (d) => `Kids shloka ${d.shloka_id}` },
};

/**
 * Pushes one document to the API. Resolves on success; otherwise rejects with a message
 * an editor can act on (shown in the Strapi admin when publishing).
 */
async function push(uid, doc) {
  const target = TARGETS[uid];
  if (!target) return { skipped: true };
  let res;
  try {
    res = await fetch(`${API_URL()}${target.path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': SECRET() },
      body: JSON.stringify(target.body(doc)),
    });
  } catch (e) {
    throw new Error(`Could not reach the Gita Path API at ${API_URL()} — nothing was published. Start the API or check GITAPATH_API_URL.`);
  }
  if (res.ok) return res.json().catch(() => ({}));
  const body = await res.json().catch(() => ({}));
  if (res.status === 409) {
    if (uid === 'api::kids-shloka.kids-shloka') {
      throw new Error(`${target.label(doc)}: ${body.message || 'each line must match the master verse Sanskrit exactly.'}`);
    }
    throw new Error(`${target.label(doc)}: the Sanskrit differs from the master text. A scholar must tick "sanskrit change approved" before publishing.`);
  }
  if (res.status === 403) throw new Error('The API rejected the CMS webhook secret. CMS_WEBHOOK_SECRET must match on both sides.');
  throw new Error(`The API refused ${target.label(doc)}: ${body.message || res.status}`);
}

module.exports = { push, TARGETS, verseBody, storyBody, kidsShlokaBody };
