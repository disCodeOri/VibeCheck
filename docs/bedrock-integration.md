# AWS Bedrock integration

`BedrockService` implements the existing `AiService` interface as an AWS-first provider for the deployed hackathon build. It is intentionally independent of the Google provider; provider selection belongs in the server/Lambda composition layer and there is no automatic cross-provider fallback.

## Construction

```ts
const ai = new BedrockService({
  region: process.env.AWS_REGION!,
  model: process.env.BEDROCK_MODEL!,
  imageModel: process.env.BEDROCK_IMAGE_MODEL!,
  useRekognition: true,
});
```

The constructor also accepts `{ bedrock, rekognition }` clients as its second argument for tests. Production clients use a 10-second connection timeout and 120-second request timeout; every service call also receives a 120-second abort signal.

## Service behavior

- `analyze`, `compare`, and `avatar` use the Bedrock Converse API with image bytes, intended for Amazon Nova Lite or Pro model IDs. Story analysis treats later images as visual references for composition, palette, lighting, pose, styling, and mood, and requests matched captions without claiming identity or likeness. Comparison requests the complete nested analysis schema for both candidates and can judge both against those reference patterns. Every model JSON response is runtime validated. Malformed or out-of-range output is rejected rather than repaired or replaced with a fabricated result.
- Optional Rekognition enrichment runs only for Loox analysis and avatar creation. It calls stateless `DetectFaces` with `Attributes: ["DEFAULT"]`, then passes only face confidence, bounding box, pose, image quality, and landmark coordinates to Nova. It does not request or pass age, gender, emotions, identity indexing, or face matching.
- Hair previews invoke Nova Canvas `INPAINTING` with `maskPrompt: "hair"` and the user prompt.
- Outfit previews invoke Nova Canvas `VIRTUAL_TRY_ON` with the uploaded person as `sourceImage`, exactly one selected garment as `referenceImage`, a garment-aware mask, and face/hands/pose preservation. The endpoint rejects zero or multiple garment images instead of implying several separate uploads were applied. A single reference image may itself depict a coordinated outfit, but VibeCheck does not combine multiple garment files in one call.
- Canvas responses are bounded and returned as `data:image/png;base64,...`. Missing or malformed output raises `INVALID_PROVIDER_RESPONSE`.

Avatar parameters remain an approximate visual model. When height or proportions are not observable, the prompt requests moderate defaults; the feature does not claim scan-grade reconstruction, measurements, garment fit, or body accuracy.

## Error contract

The adapter discards AWS response text and maps provider failures to small metadata-bearing errors:

- authorization/signature errors: `AWS_ACCESS_DENIED`, status 403;
- throttling/quota errors: `AWS_THROTTLED`, status 429;
- abort/timeouts: `AWS_TIMEOUT`, status 504;
- other provider failures: `AWS_ERROR`, with a safe status.

The HTTP layer should translate these to the app’s standard `{ error: { code, message, retryAfter? } }` response without exposing AWS request bodies, credentials, or provider messages.

## AWS setup boundary

No AWS deployment or live SDK request was performed. Deployment still requires an AWS account/credits, Bedrock model access in the selected region, IAM permission for `bedrock:Converse`, `bedrock:InvokeModel`, and optionally `rekognition:DetectFaces`, plus environment model IDs. Google remains available as an explicitly selected alternative provider.

Request structures follow the AWS documentation for [Nova Canvas virtual try-on](https://docs.aws.amazon.com/nova/latest/userguide/image-gen-vto.html), [Nova Canvas image generation request/response structures](https://docs.aws.amazon.com/nova/latest/userguide/image-gen-req-resp-structure.html), and [Rekognition DetectFaces](https://docs.aws.amazon.com/rekognition/latest/APIReference/API_DetectFaces.html).
