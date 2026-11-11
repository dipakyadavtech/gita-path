# Gita Path — build plan (tracked by Claude)

Status legend: [ ] todo · [~] in progress · [x] done

## M1 Foundation
- [~] Monorepo, README, PLAN
- [ ] Expo app scaffold (expo-router, TypeScript), Sacred Clarity theme from Stitch DESIGN.md
- [ ] Spring Boot API skeleton (BLOCKED: Maven Central not reachable — waiting for user to allow repo.maven.apache.org)
- [ ] docker-compose: postgres, redis, strapi, api

## M2 Adult app — start-up + daily loop (S1–S7, D1–D8)
## M3 Explore + AI (E1–E8)
## M4 Family + account + states (F1–F3, A1–A4, X1–X3)
## M5 Strapi CMS + React admin (W1–W3)
## M6 Kids mode (K1–K10)

## Notes
- Auth: Clerk (dev login fallback when no keys).
- External keys are added by the user via .env files; never committed.
