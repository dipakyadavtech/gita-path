# Gita Path — build plan (tracked by Claude)

Status legend: [ ] todo · [~] in progress · [x] done
Workflow: GitHub issue → work on `dev` → push `origin dev` → close issue. Dipak merges dev → main after testing.

- [x] M1 Foundation: monorepo, Expo scaffold, Sacred Clarity theme (#1)
- [x] M2 Mobile start-up flow + daily loop S1–S7, D1–D8 (#2)
- [x] M3 Mobile Explore + AI Guide E1–E8 (#3)
- [x] M4 Mobile Family Circle, account, states F1–F3, A1–A4, X1–X3 (#4)
- [x] M5 Backend: Spring Boot modular monolith + PostgreSQL, 18 tests (#5)
- [x] M5b Integration: docker-compose, mobile ↔ API sync, Clerk sign-in (#8)
- [x] M6 Strapi CMS + React admin portal W1–W3 (#6)
- [ ] M7 Kids mode K1–K10, app + API (#7)

## Notes
- Auth: Clerk when keys are set; dev login (OTP 123456) otherwise.
- External keys go in local .env files only (see each .env.example); never committed.
- Mobile works fully offline in demo mode when EXPO_PUBLIC_API_URL is not set.
