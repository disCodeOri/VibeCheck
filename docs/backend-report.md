# Backend implementation report

Implemented an Express 5 API bound by `server/index.ts` to `127.0.0.1`. It loads `.env.local` on the server, keeps the Google AI Studio key out of browser code and API responses, and defaults to `gemini-2.5-flash` plus `gemini-2.5-flash-image` unless server environment variables override those model IDs.

## API surface

- `GET /api/health` returns `{ configured, model, imageModel }`.
- `POST /api/analyze` accepts `AiRequest` and returns a validated Gemini `Analysis`.
- `POST /api/compare` accepts two images plus optional mood and up to three references and returns `CompareResult`.
- `POST /api/avatar` accepts face/body data URLs, presentation, and optional height. The supplied height wins; obscured proportions use moderate model defaults and the response describes parameters as approximate.
- `POST /api/generate-preview` accepts a person image, hair/outfit prompt, and up to five garment images and returns a generated image data URL and MIME type.

All image inputs must be PNG, JPEG, or WebP base64 data URLs. Each decoded image is limited to 6 MB, decoded with Sharp to reject corrupt content, autorotated, bounded to 1600 px, flattened, and normalized to JPEG before provider transmission. Remote image URLs are rejected.

The service uses strict Zod input/output schemas, localhost browser-origin checks, a 42 MB JSON body ceiling, per-IP request rate limiting, a two-request AI concurrency ceiling, disabled `X-Powered-By`, sanitized provider errors, and no fabricated fallback analysis. Production mode serves `dist` with a non-API SPA fallback when the directory exists.

The provider prompts request visible, actionable composition, pose, hair, and outfit guidance. They prohibit medical or identity claims and demographic deductions. Loox explicitly asks for hairstyle/style compatibility; image callout coordinates and scores are constrained to 0–100.

## Frontend integration notes

The frontend should send image data URLs rather than `File` objects or remote URLs. Error responses always use `{ error: { code, message, retryAfter? } }`. Handle `429` for local throttling/provider quota, `501` for unsupported image generation, and `503` for missing or rejected credentials. `GET /api/health` is safe for provider-status UI and never discloses the key.

## Verification boundary

Credential-free integration tests use a dependency-injected fake provider and native `fetch`; they exercise real HTTP listening, Sharp image decoding, request boundaries, origin protection, comparison/avatar routes, local rate limiting, and sanitized provider/generation failures. TypeScript compilation is also checked.

After the user explicitly approved sending the generated sample male portrait, one live analysis request was made with `public/assets/portrait.png`. Google AI Studio rejected the configured credential with HTTP 403 because the key had been reported as leaked, so no analysis result was produced. The service already maps a provider 403 to the generic `503 AI_UNAVAILABLE` response and does not expose the provider body to frontend clients. No retry or image-generation request was made; a replacement API key is required before live provider behavior can be validated.
