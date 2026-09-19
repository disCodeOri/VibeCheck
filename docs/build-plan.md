# vibecheck. implementation plan

Goal: a complete locally runnable, installable mobile-first app implementing the approved male visual direction and all three product areas.

Authority: Design/integrated-male-v1 boards and the user's original feature requirements. User explicitly approved mobile-first web and Google AI Studio, and asked to proceed.

Architecture: React + Vite + TypeScript. Express server keeps Gemini credentials private, validates image requests, and calls Google for photo/style insights and generated previews. IndexedDB holds images, wardrobe, saved checks and profile on the current device. Three.js renders an adjustable, AI-assisted parametric 3D avatar with real rotation and clothing changes. No claim of precise scan reconstruction or physical garment fit. Full exported GLB models can also be imported for viewing.

Visual system: original SVG logo, white/ice surfaces, navy headings, cobalt buttons, geometric sans, condensed large numerals, overlapping blue plates, notched tickets, no handwriting. Responsive desktop workspace and mobile bottom navigation. Real DOM text and controls.

1. Foundation and persistence: shared types, durable local stores, checked file uploads, seeded examples explicitly marked demo, reusable controls. Test persistence and validation before integration.
2. Google service: health, story, comparison, loox, outfit, avatar parameter and image preview endpoints. Bound request sizes, validate schemas, rate-limit, reject unsafe origins and remote image URLs, sanitize provider failures. Tests cover invalid inputs and mocked provider behavior; live smoke test uses generated sample only.
3. Story workflow: upload/camera, story/post and mood selection, real analysis ticket, comparison to second image and style references, crop preview/download, captions, saved results.
4. loox workflow: uploaded portrait analysis, concrete photo callouts, hairstyle recommendations, generated same-person preview on request, save and compare.
5. ChicFit: add/edit/remove/filter clothes, wardrobe persistence, face/body input with AI-assisted model parameters, adjustable avatar, real drag rotation, garment selection, occasion, outfit feedback, generated try-on, saved looks.
6. Saved and Me: reopen and delete saved looks, profile/preferences, local export/import/reset, provider status, install support.
7. Verify: typecheck/build, focused automated tests, browser desktop/mobile workflow checks including upload/persistence/errors, visual comparison to source boards, no API key in browser artifacts, clear README and runnable app.

Boundary: authentication and cloud sync are not required for this device-local first release. Images are sent to Google only when a user requests AI analysis or generation. Locally stored photos remain on the device unless explicitly exported or sent for analysis. API quota may restrict generation; never substitute fabricated live results. Example analyses are labeled.
