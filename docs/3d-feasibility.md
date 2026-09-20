# Personal avatars and clothing: implementation decision

Research checked 20 September 2026. No paid generation or personal-photo upload was performed in this investigation.

## Current zero-budget decision (20 September 2026)

The team has confirmed a strict zero-service-spend budget. This supersedes the paid benchmark recommendation below. Do not call Tripo, Meshy, Nova Canvas or any paid image/3D endpoint for this hackathon. Use the existing local procedural avatar for real rotation and garment-category swaps; describe personal reconstruction and fitted 3D garments as future work. The demo uses generated sample imagery, not a claimed personal scan. Local image generation is disabled unless explicitly enabled through ENABLE_IMAGE_GENERATION=true. No reviewed option establishes accurate personal likeness plus fitted garments at guaranteed zero cost on the available machine.

## Earlier research (not authorized for this submission)

Keep the requested personal, dressable 3D avatar as the target. First benchmark Tripo's multi-view reconstruction for likeness using one consenting adult's consistent body views; use Meshy as a comparison if Tripo's face detail is insufficient. Tripo has a directly verifiable low entry cost per generation. Do not build the full clothing-generation pipeline around either until that benchmark passes. For the hackathon's working try-on flow, retain Amazon Nova Canvas photo try-on while showing the 3D preview as a separate, clearly labeled prototype.

No reviewed source establishes a single extremely cheap service that reliably reconstructs a particular face and body AND generates interchangeable, correctly fitted garments. A plausible scan is not sufficient evidence of a reusable dressable avatar.

## Candidates and verified limitations

| Candidate | Relevant capability | Cost evidence | Decision |
|---|---|---|---|
| Tripo multi-view | Separate front/left/back/right image inputs; textured model output. | Official H-series pricing: 30 credits ($0.30) with standard texture; HD texture adds 10 ($0.10); auto-rig adds 25 ($0.25). The hosted v2.5 endpoint on fal independently lists $0.30 standard / $0.40 HD. | First low-cost benchmark. A standard textured and rigged attempt is $0.55 before retries, repairs, garments and storage. Accurate personal likeness and dressability are not verified. |
| Meshy multi-image API | 1–4 views of the same object; Meshy 7.1 uses the first as front. Additional texture references are supported. GLB output can be displayed in our existing viewer. | Standard textured multi-image generation: 30 API credits. Auto-rigging: 5 additional credits. Extra geometry detail and retries add cost. Dollar price per API credit still needs confirmation in the account. | Comparison candidate; likeness and clothing separation are unverified. Rigging alone does not make arbitrary clothing fit. |
| Avaturn | Dedicated frontal plus two side-face photos; customizable avatars and custom garment support. | Published Pro API plan: $800/month, including 1,000 avatars; $0.15 per additional avatar. Full-body scans are an Enterprise enquiry. | Reject for current hackathon budget. The low marginal price does not remove the monthly minimum. |
| PSHuman, self-hosted | Research implementation reconstructing a clothed person from one image. Authors report detailed geometry and appearance. | Current official README says over 40 GB GPU memory at 768 resolution. No verified end-to-end AWS cost per successful avatar. | Research candidate, not an inexpensive plug-in replacement. Review code, weights and body-model dependency licenses before deployment. |
| Amazon Nova Canvas | Image-based garment try-on, including multiple distinct garments in one reference image; face/pose preservation controls. | Uses existing Bedrock integration; regional availability, access and current price must be checked during account setup. | Useful AWS hackathon path for photorealistic outfit previews. Produces 2D images, not a dressable 3D mesh. |

Sources: [Tripo API pricing](https://developers.tripo3d.ai/en/pricing), [Tripo H2 multiview input](https://docs.tripo3d.ai/model-generation/multiview-to-model-v2-0-v2-5.html), [fal hosted Tripo v2.5 price](https://fal.ai/models/tripo3d/tripo/v2.5/multiview-to-3d), [Meshy multi-image API](https://docs.meshy.ai/en/api/multi-image-to-3d), [Meshy API task prices](https://docs.meshy.ai/en/api/pricing), [Avaturn photo input](https://docs.avaturn.me/docs/integration/api/create-avatar-with-api/), [Avaturn pricing](https://avaturn.dev/pricing/), [PSHuman official implementation](https://github.com/pengHTYX/PSHuman), [AWS virtual try-on](https://docs.aws.amazon.com/nova/latest/userguide/image-gen-vto.html).

## Why the clothing step needs its own pipeline

A reconstruction of a person wearing a shirt may contain that shirt as part of the surface. It does not automatically reveal a separate body underneath. A separately generated shirt may have the wrong scale, closed neck/sleeve openings, no inside surface, or no relationship to the body's skeleton. Draping also depends on measurements, cut and fabric properties that a photograph cannot fully establish.

The practical design is a reusable body and head with a common skeleton, plus separate garment meshes fitted to that body. Start with a small library of prepared garment shapes and transfer visible colour, texture and details from wardrobe photos. Expand to generated geometry only after proving separation, fit and rig compatibility. This is a proposed engineering compromise, not an implemented capability or a measurement guarantee.

## Capture and benchmark before integration

1. Capture front, back and both side full-body views in the same close-fitting everyday clothes, pose and lighting. Keep hands away from the torso and the entire body in frame. Supply actual height; do not treat AI-estimated scale as measured height.
2. Capture frontal and left/right facial profiles separately for a head-specific pass. Do not assume a general object's multi-view endpoint can combine tightly cropped faces with full-body views correctly.
3. Use private, user-scoped storage. Explain the actual provider before sending photos, set a deletion policy, and keep raw images out of public URLs and logs.
4. Generate one standard textured model, inspect it from front/side/back, then test a detail upgrade only if it fixes an observed issue. Record every attempt and credit charge.
5. Require recognizable face in all three views; a body silhouette checked against the source views; usable hands and neck; no major texture seams; a loadable, mobile-sized GLB; and a clear way to separate the base body from clothing.
6. Fit one prepared shirt and one pair of trousers. Require outfit replacement to remove the previous outfit cleanly and avoid visible body penetration during rotation. Test the same garments on two different body proportions before generalizing.

Generation pricing alone is not cost per usable avatar. Track `(generation + rigging + repair + retries + hosting) / accepted avatars`. Reuse the accepted avatar and each garment; changing an outfit should not trigger a full reconstruction. Track cold starts and idle GPU time if self-hosting.

## AWS deployment shape, after a successful benchmark

Use the existing Cognito, private S3, API Gateway/Lambda and DynamoDB infrastructure for sign-in, capture metadata, assets and job status. For an external model provider, Lambda can submit a job and a scheduled/status workflow can collect the result without holding a request open. If self-hosting wins the benchmark, use a queued GPU worker (for example AWS Batch on EC2), with explicit concurrency limits and scale-down; do not attempt GPU inference in Lambda. This worker infrastructure is proposed and is not part of the current deployed app.

Keep Bedrock responsible for the existing style checks and Canvas photo try-on. The AWS account and credits are not ready, so no cloud deployment or credit eligibility is claimed. External provider charges are separate from AWS credits unless the actual offer explicitly states otherwise.

## Current app boundary

- Working local UI: wardrobe photos, outfit selection, adjustable procedural 3D preview, front/side/back rotation, session-only GLB preview, saved looks.
- Photo-assisted avatar endpoint estimates procedural settings; it does not reconstruct a face or body mesh.
- Imported GLBs are displayed as provided. Selecting wardrobe items does not dress them.
- Detailed personal reconstruction, garment generation, garment fitting, rig transfer and persistent personal GLB storage remain unimplemented.
- Live AI and AWS operation remain dependent on valid credentials and account setup. Do not present example scores or rendered sample people as generated user results.
