# Working agreement for Gita Path

## Git workflow (set by Dipak, 12 Nov 2026)
1. Before starting a feature, create a GitHub issue for it in dipakyadavtech/gita-path (title, what it covers, screen IDs from the SRS, acceptance criteria).
2. Do the work on the `dev` branch only. Reference the issue in commits, e.g. `feat(mobile): daily loop screens (#3)`.
3. Push to `origin dev` after every feature. Never push to `main` — Dipak merges dev → main after testing.
4. Close the issue with a comment summarising what was built and how to test it.

## Project
- Design reference: docs/design/stitch (Stitch export) + docs SRS link in README.
- Build plan and progress: PLAN.md.
- Secrets go in local .env files only; never commit keys.
