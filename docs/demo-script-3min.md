# VibeCheck — 3-minute submission script

This version shows both the real desktop web interface and the compact phone layout. Record the first 25 seconds on the normal Home screen. Then cut to `https://YOUR_DEPLOYED_DOMAIN/demo?t=28` or `http://127.0.0.1:5173/demo?t=28` and press Play. Starting at 28 seconds skips the walkthrough's spacious intro and Home chapters. The finished video should run about 2:55.

Record the interface first, then add this narration as a separate voice track. Read calmly at roughly 125–135 words per minute. Do not race the final sentences.

## Timed narration and screen direction

### 0:00–0:25 — Problem and desktop web experience

**Screen:** Real desktop Home. Begin with the full page visible. Move across Story, loox and ChicFit once. Briefly scroll enough to show the three large shortcut cards. At 0:25, cut to the walkthrough started at `/demo?t=28`.

**Voiceover:**

“Posting a photo or choosing what to wear should feel expressive. Instead, it often becomes a loop of second-guessing. VibeCheck is a responsive web experience that turns that uncertainty into clear, constructive choices—without judging attractiveness. One coherent workspace connects Story Check, loox and ChicFit, and adapts from this full desktop canvas to a focused phone layout.”

### 0:25–0:53 — Story Check

**Screen:** Story result; let the score animate and metrics fill.

**Voiceover:**

“Start with a Story or post. VibeCheck evaluates visible details such as mood, framing, clarity and lighting, then presents the result as a simple vibe receipt: one clear verdict, the reasons behind it, and one practical improvement. The interface stays encouraging, while sample results are clearly labelled so demonstrations never pretend to be live analysis.”

### 0:53–1:15 — Comparison

**Screen:** Original versus closer crop; recommendation and paired bars.

**Voiceover:**

“When two photos feel almost identical, comparison makes the difference understandable. Here, the closer crop wins because warmer light and stronger framing keep attention on the person. Paired metrics explain the recommendation instead of hiding it behind a mysterious score.”

### 1:15–1:41 — loox

**Screen:** Portrait callouts, style score and hairstyle options.

**Voiceover:**

“Loox moves feedback onto the portrait itself. Anchored callouts connect each suggestion to a visible feature, while hairstyle options remain inspiration—not identity-changing claims. The user can inspect the reasoning, try another direction, and save a look without losing control of the decision.”

### 1:41–1:59 — Wardrobe

**Screen:** Clothing categories and selectable pieces.

**Voiceover:**

“ChicFit begins with what the user already owns. Clothing photos become a searchable wardrobe, organized by category. Select a few pieces, choose an occasion, and build more combinations without buying an entirely new wardrobe.”

### 1:59–2:19 — Working 3D prototype

**Screen:** Outfit and rotating avatar; keep the prototype label visible.

**Voiceover:**

“The current prototype makes those combinations spatial: this is a real, interactive Three.js avatar that rotates and changes outfit categories. We deliberately label it as a prototype. Accurate personal reconstruction and fitted clothing meshes are future work, rather than claims we cannot yet support.”

### 2:19–2:33 — Best UI

**Screen:** Second visual direction.

**Voiceover:**

“The experience supports two visual moods—bold layered plates and softer organic forms—without changing the workflow. Large tap targets, visible selection states, reduced-motion support and consistent next actions keep the design expressive and usable.”

### 2:33–2:47 — AWS and privacy

**Screen:** Cedar policy changes from ALLOW to DENY.

**Voiceover — use this only after EC2 deployment succeeds:**

“The application is hosted on Amazon EC2, with Nginx and HTTPS serving the React and Express stack. AWS open-source Cedar evaluates photo-processing permission, and this live policy check changes from allow to deny without sending a photo.”

**Voiceover — use this if EC2 is not deployed before recording:**

“We integrated AWS open-source Cedar to evaluate photo-processing permission locally. This live check changes from allow to deny without sending a photo. We also prepared an EC2 deployment path, but we will not claim a cloud deployment before it is verified.”

### 2:47–2:55 — Learning and close

**Screen:** Final brand screen.

**Voiceover:**

“Our biggest learning was that trust comes from visible reasoning and honest boundaries. VibeCheck: look good, feel right, be you.”

## One-take recording checklist

1. Deploy first if using the EC2 narration. Confirm the public HTTPS URL and one real Gemini Story Check.
2. Record the real desktop Home for 25 seconds at 1920×1080 or 1536×864. Keep the browser chrome hidden or tightly cropped.
3. Open `/demo?t=28`, refresh once, and wait for every image and the 3D avatar to load.
4. Start the walkthrough recording or screen recorder, enable clean view, and press Play. This second clip lasts 2:30.
5. Join the clips with a simple cut or short dissolve. Do not use a flashy transition that competes with the UI.
6. Do not move the pointer unless demonstrating an interaction.
7. Record narration separately. Align each paragraph with its matching chapter cut.
8. Add quiet music only if speech remains completely clear. Do not cover product labels with captions.
9. End on the logo for at least two seconds. Export at exactly three minutes or less.

## Claims to avoid

- Do not call illustrative scores live AI results.
- Do not call the current avatar a personal body scan.
- Do not claim accurate garment fit, fabric simulation or generated clothing meshes.
- Do not say the app uses Bedrock, Lambda, Cognito, S3 or DynamoDB unless that stack is actually deployed and demonstrated.
- If hosted on EC2 while Gemini provides analysis, say exactly that: **AWS hosts the application; Gemini provides the current AI analysis.**

## Suggested submission description

VibeCheck is a responsive personal-style web experience that turns uncertain choices into clear next steps across desktop and phone layouts. Story Check explains which photo communicates best, loox anchors styling suggestions directly to visible details, and ChicFit helps users recombine clothes they already own through a wardrobe and interactive 3D prototype. The product emphasizes constructive reasoning, privacy controls, and honest labels for illustrative or experimental features. The application can run on Amazon EC2, and AWS open-source Cedar enforces the photo-processing permission demonstrated in the video.
