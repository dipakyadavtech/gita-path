# Gita Path content studio (Strapi 5)

Editors write verses, translations, stories, topic tracks and kids shlokas here.
When an entry is published, Strapi sends it to the API, which serves it to the app.

## Run locally

You need Node 22+, PostgreSQL on localhost:5432, and the API running (`services/api`).

```bash
createdb -h localhost -U postgres gitapath_cms
cd services/cms
npm install
npm run setup        # creates .env with random secrets (never commit it)
npm run develop      # http://localhost:1337/admin — create your first admin account
```

- On first start, the seed content from `packages/content` is imported as approved and published.
- `npm run build && npm run start` runs it without hot reload.

## Publishing rules

These are enforced in `src/lib/guard.js`:

1. **Approved review.** You can't publish until *Review status* is **approved** and a *Reviewer* name is filled in. The message in Strapi tells the editor what is missing.
2. **Sync to the API first.** Verses and stories are sent to the API before they are published. If the API refuses, nothing is published.
3. **Sanskrit lock.**
   - If a verse's Sanskrit differs from the master text the API holds, the API refuses it.
   - A scholar must tick **sanskrit change approved** to allow the change.
   - The tick clears itself after a successful publish, so each Sanskrit change needs a fresh approval.

## Content types

| Type | Synced to API | Notes |
|---|---|---|
| Verse | yes | Sanskrit lines, IAST, meaning, life note, word meanings, themes, daily actions |
| Story | yes | Mahabharata episodes; `kids_safe` / `kids` decide where they show |
| Translation | not yet | Per-language meaning; the API endpoint comes with multilingual content |
| Topic track | not yet | Themed verse lists |
| Kids shloka | yes | Kids mode; each Sanskrit line must match the master verse exactly or the API refuses it |

## Settings

These go in `.env`:
- `GITAPATH_API_URL` (default `http://localhost:8080`)
- `CMS_WEBHOOK_SECRET` — must equal the API's `CMS_WEBHOOK_SECRET`
- `DATABASE_*`
