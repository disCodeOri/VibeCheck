# AWS backend

This is the primary cloud architecture for VibeCheck. It is intentionally not deployed by the repository build: an AWS account, billing approval, and Bedrock model access are required first.

## Architecture

- CloudFront serves the private S3 frontend and forwards `/api/*` to API Gateway without caching or replacing the `Authorization` header.
- Cognito provides email sign-up and a public browser client. API Gateway validates JWTs. The Lambda trusts only `requestContext.authorizer.jwt.claims.sub`; request headers never establish identity.
- A private encrypted S3 bucket stores images, snapshots, and oversized job results. Every key has an immutable UUID under `users/<encoded-sub>/`.
- DynamoDB stores the current snapshot pointer/version and short-lived job metadata. Conditional updates implement optimistic concurrency. No image bytes are stored in DynamoDB.
- Lambda runs the existing Express API with Bedrock Nova and Rekognition. The four AI operations use asynchronous jobs so API Gateway's integration timeout is not a constraint.

## Browser flow

Fetch `GET /api/config`, authenticate with Cognito, and send the ID token as `Authorization: Bearer <token>`. The configuration response includes `cloudEnabled: true` and contains identifiers only, never credentials.

For each image, call `POST /api/cloud/upload` with its exact content type and byte length, then `PUT` the bytes directly to the returned URL using that content type. Submit the returned S3 keys in the normal top-level image fields. Only `image`, `imageA`, `imageB`, `bodyImage`, `referenceImages`, and `garmentImages` are hydrated.

Create AI work with (each user is limited to 30 accepted AI jobs per UTC day):

```json
{"path":"/analyze","body":{"kind":"loox","image":"users/.../images/...jpg"}}
```

`POST /api/jobs` returns `{"id":"..."}`. Poll `GET /api/jobs/<id>` until `status` is `complete` or `failed`. DynamoDB Streams invokes the worker only for newly inserted job records; there is no public worker route or client-controlled subject.

The synchronous AI POST routes return `409 USE_JOBS` in AWS so they cannot bypass the daily allowance or API Gateway's integration timeout.

For sync, upload an `application/json` snapshot, then call `POST /api/cloud/commit` with its key and last observed `expectedVersion`. A `409 VERSION_CONFLICT` means the client must refresh `GET /api/cloud/state` before retrying. `POST /api/cloud/download` signs up to 100 owned keys at once.

## Build and deploy later

Run `node scripts/build-lambda.mjs` on a machine with npm network access. It bundles the Node 22 Lambda and installs the Linux x64 `sharp` binary into `build/lambda`; no credentials or secrets are embedded. Then validate and deploy `infra/template.yaml` with AWS SAM. Build the frontend separately and upload `dist/` to the `FrontendBucketName` stack output, followed by a CloudFront invalidation.

Before deployment, confirm Bedrock access for the configured Nova models in the target region and review costs, retention, alarms, quotas, and the S3 CORS origin. The template's wildcard CORS values support the first CloudFront deployment before its generated hostname is known; replace them with the emitted distribution origin for production hardening.

The Lambda role is scoped to the stack's data bucket and DynamoDB table, Nova foundation/inference-profile ARNs, and `rekognition:DetectFaces`. The backend does not create resources from user input and does not log images, object bodies, tokens, or AI request payloads.
