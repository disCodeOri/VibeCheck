# Backend recon — findings and contract map

Full read of `server/`, `shared/`, `src/lib/`, `infra/template.yaml` and `scripts/`,
plus local runtime probing. No live AWS or Gemini calls were made; provider
behaviour was exercised with stubs.

Scope note: `src/App.tsx`, `src/features/*`, `src/components/ui.tsx` and the
stylesheets were being edited concurrently by the UI port and were left alone.

---

## 1. What was checked and found clean

These were the things most likely to leak, and they hold up:

- **No secret reaches the browser.** No `VITE_`-prefixed secret, no
  `import.meta.env` beyond `PROD`, no `process.env` in `src/`. Neither
  `build-offline.mjs` nor `build-lambda.mjs` inlines env into `dist/`.
- **No secrets in git.** `.env*` is ignored with an `!.env.example` exception;
  `.env.local` is untracked.
- **Object ownership is enforced per user.** Every S3 key path runs through
  `ownsKey()` (`server/cloud.ts:37`), which pins the `users/<sub>/` prefix and
  rejects `..` and backslashes. Presigned URLs are 300s and scoped per object.
  A job body cannot smuggle a raw data URL past `hydrateCloudBody` —
  `objectDataUrl` requires an owned `users/<sub>/images/` key.
- **Auth fails closed.** `trustedSubject()` reads only the API Gateway JWT
  authorizer claim, never a client-supplied header. Every `/api/cloud/*` and
  `/api/jobs*` route carries `Auth: {Authorizer: CognitoJwt}`.
- **Buckets are private.** Both buckets set all four public-access blocks;
  the frontend bucket is reachable only via CloudFront OAC.
- **Input validation is strict.** All four AI schemas use `.strict()`, images
  are re-decoded and re-encoded through sharp with a pixel limit, and provider
  output is re-validated against `server/schemas.ts` before it is returned.
- **Spend is bounded.** Per-user 30 jobs/day (conditional update), per-IP rate
  limit, gateway throttling, a $10 budget alarm, and TTLs on jobs and usage rows.

---

## 2. Fixed

### 2.1 Upstream error text was returned verbatim to the browser — CRITICAL
`server/app.ts` — the `provider.status === 429` branch forwarded
`provider.message` straight to the client, and `server/gemini.ts:162`
(`throw lastError`) hands up the raw Google SDK error. Google's quota errors
embed the GCP project number, quota metric names, and the request URL.

Reproduced against a stub before the fix:

```
429 {"error":{"code":"AI_QUOTA","message":"got status: 429. {\"error\":{\"message\":
\"Quota exceeded ... consumer project_number:998877665544, key AIzaSy…, limit: 0\"}}"}}
```

Provider messages are now never forwarded. An error may opt a message in with
`clientSafe: true`, which only our own curated messages set. After the fix the
same input returns a fixed string, and `generatePreview`'s own billing-guidance
message still reaches the user.

### 2.2 Provider faults were reported as the user's fault — HIGH
`server/app.ts` mapped **any** `SyntaxError` to `400 INVALID_REQUEST`. That was
meant for malformed request bodies, but it also caught `JSON.parse` failures on
the *provider's* reply (`server/gemini.ts:9`). A Gemini response that wasn't
valid JSON told the user "The request payload is invalid."

The check is now narrowed to body-parser errors (which carry a `body` property);
a provider parse failure returns `502 AI_ERROR`. Verified both directions: a
genuinely malformed request body still returns 400.

### 2.3 A timed-out worker stranded the job forever — HIGH
`claimJob` flipped `pending → running` and nothing ever moved it on. A worker
killed by a Lambda timeout or OOM never reaches its catch block, so the row
stayed `running`; the stream's one retry hit the same condition and gave up.
The client polled for 240s and then failed. Claims now record `claimedAt` and a
claim older than `STALE_CLAIM_MS` (360s, past the 300s function timeout) can be
taken over. Worker failures are also now logged server-side — previously every
error was swallowed by a bare `catch {}`, leaving nothing in CloudWatch.

### 2.4 The privacy switch shared the AI rate-limit budget — MEDIUM
`POST /api/privacy` ran through the same per-IP bucket as the AI routes, so a
user who spent their 20 requests could no longer **turn photo processing off**.
The safety switch is now exempt. Verified: with the AI budget exhausted and
`/api/analyze` returning 429, both privacy toggles return 200.

### 2.5 Data bucket accepted CORS from any origin — MEDIUM
`infra/template.yaml` had `AllowedOrigins: ['*']` on `DataBucket` for GET/HEAD/PUT.
Presigning still gates access, but `*` lets any page drive an upload or download
if it ever obtains a URL. Now scoped to the distribution's own domain. Checked
that this introduces no CloudFormation dependency cycle.

### 2.6 Undeclared dependency — MEDIUM
`server/bedrock.ts:3` imports `@smithy/node-http-handler`, which was not in
`package.json` and resolved only through npm hoisting of an AWS SDK transitive.
A clean install with different hoisting would break the Lambda build. Declared
at the installed version (`^4.12.1`).

### 2.7 The demo's Cedar proof had no route in the cloud — MEDIUM
`src/demo/Demo.tsx:40` fetches `/api/privacy/proof`, but no such route existed
in `template.yaml`. On the deployed site the privacy chapter — the "AWS open
source / live policy" moment — renders **"Local API unavailable"**. Added the
route. It is read-only and stateless (a Cedar dry run, no image, no provider
call), so it is safe to expose unauthenticated, same as `/api/health`.

`POST /api/privacy` was deliberately **not** routed: `processingEnabled` is a
closure variable in `createApp`, so in a shared Lambda container one user's
toggle would apply to every user in that container. See 3.1.

### 2.8 Unvalidated job path on read — LOW
`loadJob` cast the stored `path` straight to `JobPath`. An unrecognized value
falls through `executeJob`'s switch and returns `undefined`, which `finishJob`
stores as a completed job with no result — indistinguishable to the client from
a job still running, so it polls until timeout. Now re-validated on read.

### 2.9 Latent origin rejection in the cloud — LOW
`server/app.ts`'s origin allowlist is loopback-only. It is not currently hit
(the only routes that reach Express in Lambda are two same-origin GETs, which
send no `Origin` header), but any future POST falling through to Express would
403. An `ALLOWED_ORIGIN` env var / `allowedOrigins` option now covers that.

---

## 3. Found, not fixed — these are design decisions, not bugs

### 3.1 The privacy promise is local-only
The UI says photo processing is "enforced locally with Cedar", and that is
literally true — but it means the pause switch has **no effect on the cloud
path**. Two independent reasons:

1. Cloud jobs run via the DynamoDB stream (`runWorker` → `executeJob`) and never
   pass through the Express middleware where the Cedar gate lives.
2. The policy itself is written `principal == User::"local"`
   (`server/privacy.ts:6`). A Cognito sub would be denied by it, so the gate
   cannot simply be pointed at cloud users — it would deny everything.

The local copy already scopes the claim ("this local server"), and
`PhotoPrivacy` hides itself when the route 404s, so nothing currently lies to
the user. But for a product handling face and body scans, per-user consent that
actually gates the cloud worker is worth building: store a
`photoProcessingEnabled` flag on the existing `USER#<sub> / STATE` row, expose
`GET|POST /api/cloud/privacy`, and have `executeJob` check it before
`hydrateCloudBody`. That is a feature, so I left it for you to decide.

### 3.2 Request-size ceilings disagree
`express.json({limit:'42mb'})` sizes for the worst legitimate *compare*
(5 images x 6MB x 4/3 base64 ≈ 40MB), but `previewSchema` permits 6 images
(≈48MB), so the largest legal preview would be rejected by the body parser.
Unreachable in practice — the client downscales to ≤1600px JPEG q0.88 — and API
Gateway caps payloads at 10MB in the cloud regardless. Left alone rather than
churn a limit that currently protects more than it blocks.

### 3.3 Non-quota errors burn every key in the pool
`executeWithFailover` retries all keys on **any** error, so one malformed
request sets a 30s cooldown on all three keys. Degraded, not broken (cooldowns
only deprioritize, they never exclude). Worth narrowing the retry to
quota/5xx/timeout classes if you see thundering-herd behaviour on demo day.

### 3.4 `ApiLogGroup` name collision on redeploy
`template.yaml` declares `/aws/lambda/${ApiFunction}` explicitly while Lambda
also creates it lazily. If the stack is deleted and redeployed while the log
group survives, `CREATE_FAILED`. Standard gotcha, cheap to work around if hit.

### 3.5 Unauthenticated `/api/health` and `/api/config`
Intentional and needed before sign-in. They expose model IDs, provider name,
region, user pool ID and client ID — all non-secret and required by the client
SDK. Noted for completeness.

---

## 4. Endpoint contract map

For the UI port. **Local** = Express on `127.0.0.1:8787` (vite proxies `/api`).
**Cloud** = API Gateway + Lambda. `src/lib/api.ts` switches on
`config.cloudEnabled`, so the same four AI calls take different transports.

### AI endpoints — transport differs by mode

| Call | Local | Cloud |
|---|---|---|
| `api.analyze(body)` | `POST /api/analyze` → result | `POST /api/jobs {path:'/analyze'}` → poll `GET /api/jobs/{id}` |
| `api.compare(body)` | `POST /api/compare` | same job flow |
| `api.avatar(body)` | `POST /api/avatar` | same job flow |
| `api.preview(body)` | `POST /api/generate-preview` | same job flow |

In cloud mode, images are uploaded to S3 first and the job body carries **S3
keys**, not data URLs (`prepareCloudImages`). Calling `/api/analyze` directly in
the cloud returns `409 USE_JOBS`. Polling is every 1.8s up to 240s.

Request/response shapes are identical in both modes and defined in
`shared/types.ts` + validated by `server/schemas.ts`.

| Endpoint | Body | Returns |
|---|---|---|
| `/api/analyze` | `{kind:'story'\|'loox'\|'outfit', image, mood?, format?, referenceImages?≤3, occasion?, garments?≤30}` | `Analysis` |
| `/api/compare` | `{imageA, imageB, mood?, referenceImages?≤3}` | `CompareResult` |
| `/api/avatar` | `{image?, bodyImage?, presentation, height?145-205}` (≥1 image) | `{params:AvatarParams, summary}` |
| `/api/generate-preview` | `{image, kind:'hair'\|'outfit', prompt≤800, garmentImages?≤5}` | `{image:dataURL, mimeType}` |

All four are `.strict()` — **an unknown key is a 400**, which matters if the UI
port adds fields. Images must be `data:image/(png|jpeg|webp);base64,…`, ≤6MB each.

### Non-AI endpoints

| Endpoint | Local | Cloud | Auth | Returns |
|---|---|---|---|---|
| `GET /api/health` | yes | yes | none | `{configured, model, imageModel, provider}` |
| `GET /api/config` | yes | yes | none | local `{cloudEnabled:false, provider}` · cloud `{region, userPoolId, clientId, provider, cloudEnabled:true}` |
| `GET /api/privacy` | yes | **no (404)** | none | `{processingEnabled, generationEnabled, allowed, engine, version}` |
| `POST /api/privacy` | yes | **no (404)** | none | same |
| `GET /api/privacy/proof` | yes | yes *(added)* | none | `{enabled, paused, generation}` Cedar dry run |
| `GET /api/cloud/state` | no | yes | JWT | `{version, key?, updatedAt?, downloadUrl?}` |
| `POST /api/cloud/upload` | no | yes | JWT | `{key, uploadUrl}` |
| `POST /api/cloud/commit` | no | yes | JWT | `{version, key, updatedAt}` · 409 on version conflict |
| `POST /api/cloud/download` | no | yes | JWT | `{urls:{key:url}}`, ≤100 keys |
| `POST /api/jobs` | no | yes | JWT | `202 {id}` · 429 `DAILY_LIMIT` at 30/day |
| `GET /api/jobs/{id}` | no | yes | JWT | `{status, result?, error?}` |

`PhotoPrivacy` already tolerates the 404 by rendering nothing — keep that
behaviour in the port, or the cloud build will show a dead toggle.

### Error codes the UI should handle

| Code | Status | Meaning |
|---|---|---|
| `INVALID_REQUEST` | 400 | Payload/schema/image rejected |
| `PHOTO_PROCESSING_PAUSED` | 403 | Cedar denied — user paused processing, or generation is off |
| `ORIGIN_DENIED` | 403 | Origin not allowlisted |
| `NOT_FOUND` | 404 | Unknown route or job |
| `USE_JOBS` | 409 | Direct AI call in cloud mode |
| `VERSION_CONFLICT` | 409 | Backup changed underneath — refresh first |
| `REQUEST_TOO_LARGE` | 413 | Job metadata >350KB |
| `RATE_LIMITED` / `BUSY` | 429 | Per-IP limit / concurrency limit, carries `retryAfter` |
| `DAILY_LIMIT` | 429 | 30 cloud jobs/day used |
| `AI_QUOTA` | 429 | Provider quota, carries `retryAfter` |
| `UNAUTHORIZED` | 401 | Missing/invalid JWT |
| `AI_UNAVAILABLE` | 503 | Provider unconfigured or unauthorized |
| `UNSUPPORTED_GENERATION` | 501 | Model cannot generate images |
| `AI_ERROR` | 502 | Provider failed or returned malformed output |

Error body is always `{error:{code, message, retryAfter?}}`. `message` is always
safe to display — it is never upstream text (see 2.1).

---

## 5. Verification performed

- `npx vitest run` — 47/47 pass.
- `npx tsc -b --force` — clean.
- Local server probed on an isolated port: read endpoints, origin allow/deny,
  404s, malformed JSON, schema violations on every POST, `.strict()` rejection,
  rate-limit cutover at exactly 20 with `Retry-After`, Cedar allow/deny/pause,
  and the generation-disabled branch.
- Provider failure modes exercised with stubs (no live calls): malformed
  provider JSON, raw upstream 429 with embedded account internals, curated
  `clientSafe` message, and malformed request body.
- `infra/template.yaml` parses; no dependency cycle introduced by the CORS
  change. **Not** validated with `sam validate` — the SAM CLI is not installed
  here, so the template change is verified by inspection only and should get a
  `sam validate --lint` before the next deploy.

Two failures present at the start of the audit — a `tsc` error at
`src/App.tsx:195` (`defaultTab` prop missing on `ChicFit`) and a
`tests/storage.test.ts` failure from a seeded default profile name — were fixed
by the concurrent UI work while this audit ran, not by these changes.
