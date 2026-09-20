# vibecheck.

Mobile-first personal style app: Story Check, loox, and ChicFit. Uses the supplied navy/cobalt brand, bold score tickets, overlapping blue encouragement plates, and an interactive 3D wardrobe preview.

## Run locally

Requires Node.js 22.12+ and npm.

```powershell
npm install
npm run dev
```

Open http://127.0.0.1:5173. The API listens on port 8787. Examples, local wardrobe editing, avatar controls, saved looks, and backups work without an AI account. Example scores are visibly labelled; failed AI requests never become fabricated results.

For a production build:

```powershell
npm test
npm run build
npm start
```

Open http://127.0.0.1:8787. Install through the browser's install/add-to-home-screen option. The production service worker caches the app, including the wardrobe screen; AI needs an internet connection.

## AWS hackathon

Start with [the beginner AWS guide](docs/aws-setup.md). Deployment source is in `infra/template.yaml`. `npm run build:lambda` builds the Linux Lambda package; it does not deploy anything. The AWS deployment uses Bedrock, Nova Canvas, Rekognition, Cognito, private S3, DynamoDB, Lambda, API Gateway, CloudFront, CloudWatch, and Budgets.

AWS credentials stay outside this repository. Lambda receives permissions through its IAM role. The browser receives only public configuration and its signed-in user's session token.

For local AWS development, copy `.env.example` to `.env.local` only if you do not already have local settings; choose `AI_PROVIDER=bedrock`, `AWS_REGION=us-east-1`, and authenticate the AWS CLI through your own profile. For the optional local Google provider choose `AI_PROVIDER=gemini` and set a fresh `GEMINI_API_KEY` in `.env.local`. Never put keys in `VITE_` variables or commit them. The previously shared Google key was rejected as exposed and needs replacement if that provider is used.

## Features and limits

- **Story Check:** photo upload/camera, mood, reference posts, side-by-side comparison, score ticket, captions, crop/export, saved checks.
- **loox:** photo-based styling feedback, location callouts, hairstyle suggestions, generated hair previews.
- **ChicFit:** wardrobe CRUD/filtering, sample pieces, adjustable 3D avatar, drag rotation, clothing colors and combinations, GLB viewing, outfit checks, generated try-on, saved snapshots.
- **Your space:** preferences, IndexedDB persistence, validated JSON backup/restore and device reset; deployed AWS accounts add email sign-in and explicit cloud backup/restore.

The 3D model is an adjustable stylized avatar with AI-assisted parameters, **not a reconstructed photorealistic body scan**. Uploaded GLB models can be viewed. Generated clothing previews are styling illustrations, not a physical fit or size guarantee. AWS try-on combines selected clothing photos into one reference board; accessories are excluded from that generated preview.

Cloud saves are explicit backups, not automatic live synchronization. Restoring replaces device data after confirmation. Clearing a device does not delete its cloud backup. Private cloud objects persist until removed by the account owner; temporary generated job results expire after seven days. Cloud AI requests are limited to 30 per user per UTC day.

## Validation

`npm test` covers request/image validation, provider errors, AWS request shapes, user-prefix isolation, signed upload limits, cloud version conflicts, the daily job limit, state persistence/backup validation, image serialization, and the real Lambda health adapter. No automated test calls a paid AI service.

AWS deployment and live Bedrock/Cognito/S3 workflows still require an account and model access. See [AWS backend details](docs/aws-backend.md) and [Bedrock details](docs/bedrock-integration.md).
