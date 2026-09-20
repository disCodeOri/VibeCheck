# Verification record

Verified locally on September 19, 2026 after the AWS integration.

| Check | Result |
|---|---|
| `npm test` | 37 tests passed across 6 files; no live AI calls |
| `npm run build` | TypeScript and Vite production build passed; 76 assets included in offline precache |
| `npm run build:lambda` | Passed; Linux x64 sharp and libvips binaries present |
| `npm start` on test port 8788 | Started successfully |
| Production `/`, `/story`, `/chicfit`, `/api/health`, `/api/config`, `/sw.js` | All returned HTTP 200 with expected HTML/JSON/JavaScript content types |
| Browser: desktop home and Story example | Rendered branded image/text composition and labelled example score |
| Browser: save Story example, reload Saved | Persisted example displayed after reload |
| Browser: sample wardrobe and outfit | Loaded clothes and real WebGL avatar; saved a rendered outfit snapshot |
| Browser: mobile 390x844 | Full avatar with angle controls; no overflow after route load; fixed grid child minimum width for resizing |
| API key-shaped strings in browser JS | None found |
| Infrastructure YAML | Parsed; 13 resources and 7 outputs |
| Local signed-upload URL check | Exact content type/length signed; no incorrect empty-body CRC32 checksum |

Non-blocking production build warnings concern third-party Zod comment annotations; bundling completed.

Not verified: AWS SAM lint (SAM CLI not installed), CloudFormation deployment, Linux Lambda cold start, real Cognito email/sign-in, cross-device S3 backup/restore, real Bedrock/Canvas/Rekognition responses and quotas, actual AWS spend, device installation/offline use. The prior Google key was rejected as exposed; no new live Google call was made. Local integration tests use mocked AWS/AI clients, except the real in-process Lambda HTTP adapter and local presigning with fake credentials.

The browser test left clearly labelled example data: one Story Check, sample wardrobe pieces, and an outfit snapshot. It did not upload photos to AWS or change an external account.
