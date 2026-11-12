# Gita Path API (Spring Boot modular monolith)

Modules (Spring Modulith): `identity`, `content`, `learning`, `circle`, `billing`, `guide`, `kids`, `admin`, `shared`.

## Run locally
Needs Java 21+ and PostgreSQL 16 on localhost:5432.

```bash
createdb -h localhost -U postgres gitapath
cd services/api
./gradlew bootRun          # seeds verses/stories from packages/content on first start
```
- Health: http://localhost:8080/actuator/health
- API docs: http://localhost:8080/swagger-ui.html

Environment variables (see `.env.example`; keep real values in your own `.env`, never commit):
`DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`, `CLERK_ISSUER`, `CMS_WEBHOOK_SECRET`,
`REVENUECAT_WEBHOOK_SECRET`, `GUIDE_LLM_URL`, `GUIDE_LLM_KEY`, `GUIDE_LLM_MODEL`.

## Sign in without Clerk (dev)
```bash
TOKEN=$(curl -s -X POST localhost:8080/v1/auth/dev-token -H 'Content-Type: application/json' \
  -d '{"phone":"9876543210","otp":"123456","name":"Dipak"}' | jq -r .token)
curl -s localhost:8080/v1/today -H "Authorization: Bearer $TOKEN"
```
Add `"admin": true` to get an admin token for `/admin/v1/*`. Dev tokens are disabled once `CLERK_ISSUER` is set.

## Tests
```bash
./scripts/test-api.sh      # recreates gitapath_test DB, runs 20 tests incl. module boundary check
```
