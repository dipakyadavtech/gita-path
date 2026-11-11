'use strict';
// Document Service middleware: rules every publish must pass (SRS FR-CMS-02, NFR-12).
//  1. review_status must be "approved" (and a reviewer named) before anything is published.
//  2. Verses and stories are sent to the API first; if the API refuses, the publish is cancelled.
//  3. After a verse is published, the one-time "sanskrit change approved" tick is cleared again.
const { errors } = require('@strapi/utils');
const { push, TARGETS } = require('./sync');

const REVIEWED_TYPES = new Set([
  'api::verse.verse',
  'api::translation.translation',
  'api::story.story',
  'api::topic-track.topic-track',
  'api::kids-shloka.kids-shloka',
]);

const state = { bypass: false }; // set while seeding

function publishGuard(strapi) {
  return async (context, next) => {
    if (state.bypass || context.action !== 'publish' || !REVIEWED_TYPES.has(context.uid)) return next();

    const documentId = context.params?.documentId;
    const draft = await strapi.documents(context.uid).findOne({ documentId, status: 'draft' });
    if (!draft) return next();

    if (draft.review_status !== 'approved') {
      throw new errors.ApplicationError(
        `Not approved yet (review status: ${draft.review_status || 'draft'}). Set Review status to "approved" and add the reviewer's name, then publish.`,
      );
    }
    if (!draft.reviewer || !String(draft.reviewer).trim()) {
      throw new errors.ApplicationError('Add the reviewer\'s name before publishing.');
    }

    if (TARGETS[context.uid]) {
      try {
        await push(context.uid, draft);
      } catch (e) {
        throw new errors.ApplicationError(e.message);
      }
    }

    const result = await next();

    if (context.uid === 'api::verse.verse' && draft.sanskrit_change_approved) {
      await strapi.db.query(context.uid).updateMany({ where: { documentId }, data: { sanskrit_change_approved: false } });
    }
    return result;
  };
}

module.exports = { publishGuard, state };
