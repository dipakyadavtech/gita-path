# Gita Path

Learn one Bhagavad Gita verse a day: listen, understand, chant, act. The app is for adults, families and kids.

| Part | Folder | Tech |
|---|---|---|
| Mobile app | `apps/mobile` | React Native, Expo SDK 58, expo-router |
| API | `services/api` | Spring Boot 4.1 modular monolith, PostgreSQL |
| Shared content | `packages/content` | JSON seed (verses, stories, topics) |
| Content studio | `services/cms` | Strapi 5 (editors; publishing needs approved review) |
| Admin portal | `apps/admin` | React + Vite (content library, verse review, AI answer review) |
| Design | `docs/design/stitch` | Google Stitch export |

Build progress is tracked in [PLAN.md](PLAN.md) and GitHub issues. The workflow:
1. Open an issue.
2. Work on `dev`.
3. Test.
4. Merge `dev` → `main`.

---

## 1. Run the app on its own (no server, no keys)

```bash
cd apps/mobile
npm install
npx expo start          # press i (iOS simulator), a (Android) or w (web)
```

In this mode everything works on the phone with demo data. It signs in with any 10-digit number and OTP **123456**.

## 2. Run the full stack (app + API + database)

**With Docker:**
```bash
cp .env.example .env    # optional; leave values blank for dev
docker compose up --build
curl localhost:8080/actuator/health   # → {"status":"UP"}
```

**Without Docker:**
- You need Java 21 and PostgreSQL 16.
- Steps are in [services/api/README.md](services/api/README.md).

**Point the app at the API:**
```bash
cd apps/mobile
cp .env.example .env
# set EXPO_PUBLIC_API_URL=http://<your computer's LAN IP>:8080   (a phone can't reach "localhost")
npx expo start
```

Once the URL is set:
- Sign-in gets a token from the API.
- Verse progress and streaks are saved on the server.
- The Ask tab uses the server's Guide (daily limit, safety checks, quote verification, "Report this answer").

## 3. Real sign-in with Clerk (optional)

**1. Create an app at https://dashboard.clerk.com and configure it:**
- **User & authentication → Phone number:** turn it on with SMS verification code.
- **SSO connections:** turn on Google and Apple.
- **Native applications:** allow the redirect URL `gitapath://`.

**2. Add the keys to local `.env` files:**
- `apps/mobile/.env` → `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...`
- Root `.env` (Docker) or your shell → `CLERK_ISSUER=https://<your-app>.clerk.accounts.dev`

**3. Rebuild the app.**
- Clerk uses native modules, so Expo Go won't work.
- Use a development build: `npx expo run:ios` / `npx expo run:android`, or `npx eas-cli@latest build --profile development`.

When `CLERK_ISSUER` is set, the API accepts Clerk tokens and turns dev tokens off. In production, also set `DEV_AUTH_ENABLED=false`.

## Kids mode

To open it: Profile → **Kids mode**.

- **Parent PIN:** the first visit asks a grown-up to set a 4-digit PIN. The PIN stays on the phone.
- **Children:** add up to 4 profiles, aged 3–12.
- **What children do:**
  - watch short Krishna stories with Hindi/English captions,
  - sing shlokas word by word with Moru,
  - play a word-matching game,
  - collect stickers and a certificate.
- **Parent zone** (behind the PIN):
  - daily screen time and extra minutes,
  - bedtime lock,
  - "sing before stories",
  - story language,
  - what each child learned this week,
  - leaving Kids mode.
- **Syncing:** with `EXPO_PUBLIC_API_URL` set, profiles, stars and settings sync to `/v1/kids/*`. After signing in again on a new phone, they come back.
- **Forgot PIN?** Sign out and back in; this clears the PIN.

## 4. Content studio and admin portal

```bash
# Strapi — needs the API running
createdb -h localhost -U postgres gitapath_cms
cd services/cms && npm install && npm run setup && npm run develop     # http://localhost:1337/admin

# Admin portal
cd apps/admin && npm install && npm run dev                            # http://localhost:5174
```

With Docker, `docker compose up --build` also starts Strapi on port 1337.
- Publishing rules: [services/cms/README.md](services/cms/README.md)
- Admin portal: [apps/admin/README.md](apps/admin/README.md)

## Keys and secrets

- Real values go only in local `.env` files. These are git-ignored.
- Each folder has a `.env.example` listing what it reads.
- Never commit keys or paste them into issues.

## Tests

```bash
cd services/api && ./scripts/test-api.sh                      # 20 API tests + module boundary check
cd apps/mobile && npx tsc --noEmit && npx expo lint            # typecheck + lint
cd apps/admin && npm run build                                 # typecheck + build
```
