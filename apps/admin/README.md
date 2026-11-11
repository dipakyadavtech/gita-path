# Gita Path Studio (admin portal)

A React (Vite) portal for reviewers, built from the Stitch admin screens. It has three pages:

- **Content Library (W1)** — every live verse, with search, chapter and theme filters, and the Sanskrit checksum.
- **Verse review (W2)** — the locked Sanskrit text, word-by-word meanings, meaning, life note, actions and a mobile preview. There's a link to edit the verse in Strapi.
- **AI Guardrails (W3)** — answers learners reported from the Ask tab. A reviewer confirms or dismisses each report, with a note. The page also lists the guardrails that are always on.

Content is edited in Strapi (`services/cms`). This portal reads from the API's `/admin/v1/*` endpoints.

```bash
cd apps/admin
npm install
cp .env.example .env   # optional
npm run dev            # http://localhost:5174
```

**Dev sign-in:** any 10-digit number and code **123456**. This gives an admin token. It only works while the API is in dev mode, which means `CLERK_ISSUER` is not set.

**Clerk sign-in:**
1. Set `VITE_CLERK_PUBLISHABLE_KEY`.
2. Add each staff member's Clerk user id to the API's `ADMIN_USERS`, comma-separated.
