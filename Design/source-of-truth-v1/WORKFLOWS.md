# Full user workflows

All screen IDs resolve to screens.json. Both styles use the same contracts. Branches, guards and return destinations below take precedence over the representative linear journey.

## Connected journeys

### Story Check — photo to export

1. **H01** — Good taste. All you.
2. **S01** — What are we posting?
3. **S02** — What's the vibe?
4. **S03** — Your style references
5. **S04** — Ready to check this photo?
6. **S05** — Checking your photo
7. **S06** — Your moment. Checked.
8. **S07** — Try a closer crop
9. **S02** — What's the vibe?
10. **S04** — Ready to check this photo?
11. **S05** — Checking your photo
12. **S06** — Your moment. Checked.
13. **S08** — Finishing touches
14. **S12** — Ready when you are
15. **S13** — Check saved
16. **V03** — Your saved look

### Story Check — compare

1. **H01** — Good taste. All you.
2. **S09** — Compare two photos
3. **S10** — Comparing your photos
4. **S11** — Same you. Clearer choice.
5. **S12** — Ready when you are
6. **S13** — Check saved

### loox — portrait to saved hairstyle

1. **H01** — Good taste. All you.
2. **L01** — Start with a portrait
3. **L02** — What are you going for?
4. **L03** — Finding your style details
5. **L04** — Your look. Your energy.
6. **L05** — Find your next look
7. **L06** — Creating your preview
8. **L07** — See the difference
9. **L08** — Save this look
10. **V03** — Your saved look

### Wardrobe — add, edit, remove

1. **W01** — Start with what you own
2. **W03** — Add a piece
3. **W04** — Check the details
4. **W02** — Your wardrobe. More possibilities.
5. **W05** — Your piece
6. **W04** — Check the details
7. **W02** — Your wardrobe. More possibilities.
8. **W05** — Your piece
9. **W06** — Delete this item?
10. **W02** — Your wardrobe. More possibilities.

### Personal model — intended generation

1. **M01** — Make the preview yours
2. **M02** — Add your face
3. **M03** — Capture your proportions
4. **M04** — Review your model setup
5. **M05** — Create your personal model?
6. **M06** — Building your model
7. **M07** — Review your model
8. **C01** — Dress for today

### Model unavailable — supported fallback

1. **M01** — Make the preview yours
2. **M08** — Choose another way to preview
3. **M04** — Review your model setup
4. **M07** — Review your model
5. **C01** — Dress for today

### ChicFit — owned pieces to saved outfit

1. **C01** — Dress for today
2. **C02** — Build your combination
3. **C03** — Putting your look together
4. **C04** — Same pieces. New energy.
5. **C05** — Swap a piece
6. **C04** — Same pieces. New energy.
7. **C06** — Generate a photo preview?
8. **C07** — Creating your photo preview
9. **C08** — Your style preview
10. **C09** — Save your outfit
11. **V03** — Your saved look

### Saved — reopen and delete

1. **V02** — Saved for you
2. **V03** — Your saved look
3. **V04** — Delete this saved look?
4. **V02** — Saved for you

### Account — create and verify

1. **A01** — Sign in to continue
2. **A02** — Create your account
3. **A03** — Check your email
4. **A01** — Sign in to continue

### Account — password recovery

1. **A01** — Sign in to continue
2. **A04** — Reset your password
3. **A05** — Choose a new password
4. **A01** — Sign in to continue

### Data — backup and restore

1. **P01** — Your space
2. **P04** — Back up your space
3. **P08** — Replace your cloud backup?
4. **P04** — Back up your space
5. **P05** — Restore your backup
6. **P01** — Your space

### Data — scoped deletion

1. **P01** — Your space
2. **P03** — Your photos and model data
3. **P07** — Delete selected data?
4. **P03** — Your photos and model data

### Recovery — preserve draft and retry

1. **S04** — Ready to check this photo?
2. **S05** — Checking your photo
3. **X01** — That didn't finish
4. **S04** — Ready to check this photo?
5. **S05** — Checking your photo
6. **S06** — Your moment. Checked.

## Screen contracts

### H01 — Good taste. All you.

**Workflow:** Start · **Layout:** detail · **Back:** Root

Look good. Feel right. Be you.

**Desktop:** Preview 55%, item information and actions 45%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Feature (select): Story, loox, ChicFit — initial example: Story

**Actions and destinations**

- **Check my story** — S01. Open image intake with the selected format.
- **Explore loox** — L01. Open portrait intake.
- **Build an outfit** — C01. If wardrobe has no items, show W01 first.
- **Compare two photos** — S09. Open two-photo intake.
- **View wardrobe** — W02. Resolve to W01 when empty.
- **View saved** — V02. Resolve to V01 when empty.
- **Your preferences** — P01. Open settings.

**Rules**

- A first visit is useful without a portrait. Show a clearly labelled example image until the user adds one.
- Feature selection changes the primary label and its destination; ChicFit opens C01 or W01, loox opens L01.
- Example mode never uses a user's uploaded image to imply a fabricated AI result.

### A01 — Sign in to continue

**Workflow:** Account · **Layout:** form · **Back:** H01

Your draft stays here while you sign in.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Email (email)
- Password (password)

**Actions and destinations**

- **Sign in** — H01. Validate; then resume stored returnTo and pending intent, not Home when returnTo exists.
- **Create account** — A02. Preserve email and returnTo.
- **Forgot password?** — A04. Preserve email.
- **Continue exploring** — H01. Cancel protected action; keep local draft.

**Rules**

- Use email/password to match the existing account implementation. Do not add unconfigured social login buttons.
- Sign-in errors do not disclose account existence. Retain email; clear password after success.
- Authenticated AI is the current service contract; guest AI is a proposed product change, not an existing capability.

### A02 — Create your account

**Workflow:** Account · **Layout:** form · **Back:** A01

Keep your checks and looks together.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Email (email)
- Password (password)
- Confirm password (password)

**Actions and destinations**

- **Create account** — A03. Validate matching password, submit and preserve returnTo.
- **Sign in instead** — A01. Keep entered email.

**Rules**

- Password: at least 12 characters, uppercase, lowercase and number; server remains authoritative.
- Submit only once while pending. Do not show success until account creation succeeds.

### A03 — Check your email

**Workflow:** Account · **Layout:** form · **Back:** A02

Enter the confirmation code we sent.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Email code (text)

**Actions and destinations**

- **Confirm email** — A01. Confirm account; return to sign-in with original returnTo.
- **Resend code** — A03. Request once, show server retry time or a 60-second resend cooldown.
- **Change email** — A02. Return to account creation without password.

**Rules**

- Expired and invalid code errors appear below the code field.
- Paste is allowed. Do not invent successful verification.

### A04 — Reset your password

**Workflow:** Account · **Layout:** form · **Back:** A01

Enter your email to request a reset code.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Email (email)

**Actions and destinations**

- **Send reset code** — A05. Always show the same neutral acknowledgement.
- **Back to sign in** — A01. Preserve email and returnTo.

**Rules**

- Copy: If that account exists, check your email for a reset code.

### A05 — Choose a new password

**Workflow:** Account · **Layout:** form · **Back:** A04

Use the code from your email.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Email code (text)
- New password (password)
- Confirm new password (password)

**Actions and destinations**

- **Set new password** — A01. Validate, save password and show Password updated.

**Rules**

- Use the A02 password rules. Expired code links back to A04.

### S01 — What are we posting?

**Workflow:** Story Check · **Layout:** upload · **Back:** H01

Add a photo for a fresh perspective.

**Desktop:** Two columns: image intake 60%, guidance 40%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Photo (file)
- Format (select): Story, Post — initial example: Story

**Actions and destinations**

- **Continue** — S02. Require one valid decoded photo.
- **Use camera** — S01. Ask camera permission only after this click; capture returns a preview here.
- **Try an example** — S06. Open a labelled example result and never upload a user photo.

**Rules**

- Accept JPG, PNG or WebP up to 12 MiB. Reject corrupted data and unsupported HEIC with conversion guidance.
- Drag/drop and Choose photo share validation. Show preview, file name, Replace and Remove.
- Camera denial retains Choose photo; do not loop permission prompts.

### S02 — What's the vibe?

**Workflow:** Story Check · **Layout:** form · **Back:** S01

Choose the mood you want to express.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Mood (select): Effortless, Playful, Bold, Romantic, Professional — initial example: Effortless
- Format (select): Story, Post — initial example: Story

**Actions and destinations**

- **Check my photo** — S04. Validate image and mood; request analysis consent.
- **Add style references** — S03. Open optional reference selection.
- **Change photo** — S01. Keep mood and format.

**Rules**

- Show uploaded preview beside controls. Analysis is tied to image, format, mood and reference revisions.
- Audience selection is omitted from v1 because no audience-specific analysis is defined.

### S03 — Your style references

**Workflow:** Story Check · **Layout:** upload · **Back:** S02

Add posts that show the style you want to match.

**Desktop:** Two columns: image intake 60%, guidance 40%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Reference posts (file)

**Actions and destinations**

- **Use references** — S02. Commit valid reference set to the draft.
- **Skip references** — S02. Continue without a style-match score.

**Rules**

- Allow 1–5 manual reference images; each uses standard image validation.
- Show ordered thumbnails with Remove and Replace. Do not promise Instagram account import or scrape feeds.
- Style match is available only when references exist; compare colour, framing, lighting and tone, not social popularity.

### S04 — Ready to check this photo?

**Workflow:** Story Check · **Layout:** confirm · **Back:** S02

Your photo and selected references will be sent for AI analysis.

**Desktop:** 560px modal over the unchanged source screen.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Allow this analysis (checkbox)

**Actions and destinations**

- **Agree and check** — S05. If account is required, go through A01 and return here; start only after explicit agreement.
- **Not now** — S02. Keep image and choices; send nothing.

**Rules**

- Consent is scoped to this input revision and analysis purpose; not bundled with cloud backup or generation.
- Show provider/storage details from deployed configuration; never claim photos are never shared or automatically deleted without evidence.

### S05 — Checking your photo

**Workflow:** Story Check · **Layout:** processing · **Back:** S02

Looking at mood, framing and clarity.

**Desktop:** Keep the submitted preview visible; status and cancel controls beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **View completed result** — S06. Automatic transition only after a valid successful response.
- **Cancel check** — S02. Cancel request if supported; ignore late responses and preserve draft.

**Rules**

- Show indeterminate progress unless backend reports real progress. No invented countdown or percentage.
- A network retry preserves inputs. Suppress duplicate submission and ignore stale request IDs.
- Failure uses X01; no fabricated score.

### S06 — Your moment. Checked.

**Workflow:** Story Check · **Layout:** result · **Back:** S02

Warm light. Effortlessly you.

**Desktop:** Photo 55%, notched score ticket and actions 45%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Try this crop** — S07. Open a non-destructive crop preview.
- **Compare photos** — S09. Prefill A with current image.
- **Finishing touches** — S08. Open captions and export options.
- **Save check** — S13. Save a versioned snapshot locally; if signed-in cloud save is chosen, gate through A01.
- **Change photo** — S01. Start a new draft without overwriting saved results.

**Rules**

- Illustration shows 92/100; live score, verdict and metrics come only from validated response. Label Example data when applicable.
- Photo, layered score shape, large verdict and notched ticket are required. Metrics have both text and bars.
- No style references means omit style-match score and show Add references. Scores are subjective guidance, not guaranteed engagement.

### S07 — Try a closer crop

**Workflow:** Story Check · **Layout:** form · **Back:** S06

Keep the original. Preview the change.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Aspect ratio (select): 9:16, 4:5, 1:1, Original — initial example: 9:16
- Zoom (range) — initial example: 1
- Horizontal position (range) — initial example: 50
- Vertical position (range) — initial example: 50

**Actions and destinations**

- **Apply crop** — S02. Create derived image, keep original, invalidate old analysis, require fresh check.
- **Reset crop** — S07. Restore initial framing.
- **Cancel** — S06. Keep original result intact.

**Rules**

- Allow pointer drag plus keyboard sliders. Do not imply crop changes received a fresh score automatically.
- Export size: 1080px wide, aspect-ratio-derived height; show dimensions before download. Original aspect preserves source ratio.

### S08 — Finishing touches

**Workflow:** Story Check · **Layout:** export · **Back:** S06

Make the post sound like you.

**Desktop:** Preview 55%, export settings and copy actions 45%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Caption (textarea) — initial example: Golden hour, good company.

**Actions and destinations**

- **Prepare export** — S12. Carry edited caption and selected image.
- **Copy caption** — S08. Copy text; show Caption copied. On failure show selectable text.
- **Regenerate captions** — S08. Explicit AI job with consent; preserve current caption on failure.

**Rules**

- Three editable caption suggestions maximum; never auto-publish.
- Music integration is outside v1; do not show fake playable songs or unsupported platform posting.

### S09 — Compare two photos

**Workflow:** Story Check · **Layout:** compare · **Back:** S06

Same you. Two possibilities.

**Desktop:** Two equal image panes 68%, comparison details 32%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Photo A (file)
- Photo B (file)
- Mood (select): Effortless, Playful, Bold, Romantic, Professional — initial example: Effortless

**Actions and destinations**

- **Compare photos** — S10. Require two valid distinct inputs; obtain consent and account if needed.
- **Add references** — S03. Set returnTo=S09 so reference editing returns here.
- **Swap A and B** — S09. Swap inputs and labels; invalidate previous comparison.

**Rules**

- Both panes have Replace and Remove. Keep equal display areas without distorting originals.
- If bytes are identical, show These are the same photo; require a different photo or explicitly compare a changed crop.

### S10 — Comparing your photos

**Workflow:** Story Check · **Layout:** processing · **Back:** S09

Checking both photos against the same mood.

**Desktop:** Keep the submitted preview visible; status and cancel controls beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **View completed comparison** — S11. Automatic only after a valid response.
- **Cancel** — S09. Preserve both inputs.

**Rules**

- Uses the same job, consent and retry rules as S05. A retry never loses either image.

### S11 — Same you. Clearer choice.

**Workflow:** Story Check · **Layout:** compare · **Back:** S09

Warmer light. More focus on you.

**Desktop:** Two equal image panes 68%, comparison details 32%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Use photo B** — S12. Use the selected candidate; label becomes Use photo A when A is selected.
- **Try another pair** — S09. Preserve prior inputs until replaced.
- **Save comparison** — S13. Save both source images and comparison rationale.

**Rules**

- Selected border, check icon and text identify the recommended image. A/B metrics remain aligned.
- For a tie show Both work, for different reasons. Leave choice to user; do not crown a winner.
- A recommendation is not a forced selection. Clicking either image changes export choice without rewriting scores.
- Any change to image, references or mood invalidates the previous result.

### S12 — Ready when you are

**Workflow:** Story Check · **Layout:** export · **Back:** S06

Download your image and copy your caption.

**Desktop:** Preview 55%, export settings and copy actions 45%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Export format (select): JPG, PNG — initial example: JPG
- Include score card (checkbox)
- Caption (textarea)

**Actions and destinations**

- **Download image** — S12. Generate real downloadable image; success only after export is created.
- **Copy caption** — S12. Copy text with accessible confirmation.
- **Save check** — S13. Save image, caption and result snapshot.

**Rules**

- Include score card is off by default. A user photo download has no involuntary watermark or score overlay.
- Do not claim Instagram publication. Browser download failures retain the preview and expose Retry.
- Before-and-after comparisons download the selected candidate, unless an explicitly labelled comparison export is chosen.

### S13 — Check saved

**Workflow:** Story Check · **Layout:** detail · **Back:** S06

Find it in Saved whenever you need it.

**Desktop:** Preview 55%, item information and actions 45%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Title (text) — initial example: Golden hour

**Actions and destinations**

- **View saved check** — V03. Open the newly saved item.
- **Check another photo** — S01. Create a fresh draft.

**Rules**

- Allow rename. Save source image, derived image if any, format, mood, references, analysis, timestamp and provenance.
- Show device/cloud destination explicitly. Saved is shown only after persistence succeeds.

### L01 — Start with a portrait

**Workflow:** loox · **Layout:** upload · **Back:** H01

Good light. Face forward. Keep your hair in frame.

**Desktop:** Two columns: image intake 60%, guidance 40%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Portrait (file)

**Actions and destinations**

- **Continue** — L02. Require one valid portrait.
- **Use camera** — L01. Capture after user permission; preview before use.
- **Try an example** — L04. Use labelled example content.

**Rules**

- Do not guess face shape from an unusable photo. Request a clearer image if face is absent, obscured or too small.
- Multiple faces require a selected crop containing one person; do not silently choose someone.

### L02 — What are you going for?

**Workflow:** loox · **Layout:** form · **Back:** L01

Choose a direction that feels like you.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Goal (select): Everyday, Professional, Night out, Something new — initial example: Everyday
- Hair preferences (text) — initial example: Keep my natural texture

**Actions and destinations**

- **Explore my look** — L03. Get purpose-specific consent; gate live AI on account if required.
- **Change portrait** — L01. Keep goal; invalidate any prior result.

**Rules**

- Avoid demographic inference. User photo controls likeness; style preference controls recommendations.
- Consent says portrait is sent for styling analysis; no identity, health or personality claims.

### L03 — Finding your style details

**Workflow:** loox · **Layout:** processing · **Back:** L02

Looking at shape, texture and face-framing.

**Desktop:** Keep the submitted preview visible; status and cancel controls beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **View completed insights** — L04. Automatic valid completion only.
- **Cancel** — L02. Keep input.

**Rules**

- Uses S05 job rules. Failed detection becomes a request for a clearer photo, not a low attractiveness score.

### L04 — Your look. Your energy.

**Workflow:** loox · **Layout:** portrait · **Back:** L02

Small details. Still you.

**Desktop:** Annotated portrait 56%, styles and rationale 44%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Show highlights (checkbox) — initial example: true

**Actions and destinations**

- **Try a hairstyle** — L05. Open styles with labels and rationale.
- **Save insights** — L08. Save original portrait and descriptive feedback.
- **Change portrait** — L01. Create a new portrait revision.

**Rules**

- Callouts use normalized photo coordinates; retain correct anchors under cropping/resizing.
- For overlapping callouts, move labels into adjacent numbered list and keep anchor dots; never cover eyes or mouth.
- Ratings refer to hairstyle/goal compatibility, never human worth. Unsupported feature inference is omitted.

### L05 — Find your next look

**Workflow:** loox · **Layout:** portrait · **Back:** L04

Same you. New possibilities.

**Desktop:** Annotated portrait 56%, styles and rationale 44%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Style (select): Original, Soft layers, Curtain bangs, Textured crop, Side part — initial example: Soft layers

**Actions and destinations**

- **Generate my preview** — L06. Obtain generation-specific consent for selected style and portrait; start a job.
- **Back to insights** — L04. Keep selection.

**Rules**

- Available styles reflect user selection and hair context, not a forced binary gender list.
- Before generation, thumbnails are labelled Style inspiration. Do not present sample people as personalised output.
- Show selected style name and Preserve face and skin tone constraint beside preview action.

### L06 — Creating your preview

**Workflow:** loox · **Layout:** processing · **Back:** L05

Keeping your face. Trying your selected hairstyle.

**Desktop:** Keep the submitted preview visible; status and cancel controls beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Review completed preview** — L07. Automatic transition on successful generation.
- **Cancel** — L05. Retain original and selection.

**Rules**

- Generated preview has no score until a separate check has run. Do not animate the original as if it were completed.
- Unavailable provider or quota preserves the style choice and offers retry.

### L07 — See the difference

**Workflow:** loox · **Layout:** compare · **Back:** L05

Original and generated preview.

**Desktop:** Two equal image panes 68%, comparison details 32%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- View (select): Side by side, Before / after slider — initial example: Side by side
- Preview looks like me (checkbox)

**Actions and destinations**

- **Save this look** — L08. Save selected style, original and preview with Generated preview label.
- **Try another style** — L05. Keep original portrait.
- **This doesn't look like me** — L05. Discard preview; preserve original and allow a different style or retry.

**Rules**

- Side-by-side remains available to keyboard and assistive tech; slider is optional.
- Generated image never silently replaces original portrait or user identity.
- Display AI style preview. Actual results may differ. Do not promise a haircut result.

### L08 — Save this look

**Workflow:** loox · **Layout:** form · **Back:** L04

Keep the idea for your next haircut.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Title (text) — initial example: My next look

**Actions and destinations**

- **Save look** — V03. Persist original, generated preview if present, style, goal and analysis provenance.
- **Cancel** — L04. Return without saving.

**Rules**

- If generation was never completed, save insights only; no placeholder generated image.
- Show Saved on this device / Saved to account accurately.

### W01 — Start with what you own

**Workflow:** Wardrobe · **Layout:** empty · **Back:** H01

Add a few pieces. Build from there.

**Desktop:** One central message and primary action; retain product navigation.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Add clothes** — W03. Open intake.
- **Explore example wardrobe** — W02. Display a separate labelled example set; do not copy it into owned clothes automatically.

**Rules**

- Do not fabricate owned garments. Example wardrobe can be explored without affecting real inventory.

### W02 — Your wardrobe. More possibilities.

**Workflow:** Wardrobe · **Layout:** grid · **Back:** H01

Build looks from what you own.

**Desktop:** Three-column item grid 72%, model/context panel 28%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Search wardrobe (search)
- Category (select): All, Tops, Bottoms, Layers, Shoes, Accessories — initial example: All

**Actions and destinations**

- **Add clothes** — W03. Create a new item draft.
- **Open garment** — W05. Open selected garment.
- **Build an outfit** — C01. Use owned or explicitly selected example collection.
- **Your model** — M01. Open model setup.

**Rules**

- Search/filter are combined, preserve state on return, and have a Clear filters empty-result action.
- Keep Add clothes visible at all sizes. Desktop three columns; mobile two or three based on 112px minimum card width.
- Examples and owned items are clearly separated.

### W03 — Add a piece

**Workflow:** Wardrobe · **Layout:** upload · **Back:** W02

Photograph one item on a clear background.

**Desktop:** Two columns: image intake 60%, guidance 40%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Clothing photo (file)

**Actions and destinations**

- **Review item** — W04. Require a valid image; do not auto-save.
- **Use camera** — W03. Capture with permission and allow retake.
- **Cancel** — W02. Discard unsaved item draft after confirmation if edited.

**Rules**

- One item per upload in v1. Outfit photo extraction is not implied by Add from photo.
- If background removal is offered later, preserve original and require user approval of cutout.

### W04 — Check the details

**Workflow:** Wardrobe · **Layout:** form · **Back:** W03

Make it easy to find this piece again.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Name (text) — initial example: Cream tank
- Category (select): Tops, Bottoms, Layers, Shoes, Accessories — initial example: Tops
- Colour (text) — initial example: Cream
- Notes (textarea)

**Actions and destinations**

- **Save item** — W02. Persist only after validation, then show Item added or Item updated.
- **Replace photo** — W03. Preserve typed metadata.
- **Cancel** — W02. Confirm discard if draft changed.

**Rules**

- Name 1–60 trimmed characters; category required; notes up to 300 characters.
- Any AI-detected values are editable suggestions. Missing category never silently becomes Tops.
- Edit reuses this screen with existing values and Save changes label.

### W05 — Your piece

**Workflow:** Wardrobe · **Layout:** detail · **Back:** W02

Details and outfits that use this item.

**Desktop:** Preview 55%, item information and actions 45%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Use in outfit** — C02. Preselect this item and retain category rules.
- **Edit item** — W04. Load this record; preserve ID.
- **Delete item** — W06. Confirm deletion and show affected saved looks.

**Rules**

- Show image, name, category, colour and notes. Do not show invented pricing or sizes.
- Saved looks retain their historical image snapshot even if this item changes.

### W06 — Delete this item?

**Workflow:** Wardrobe · **Layout:** confirm · **Back:** W05

This removes the piece from your wardrobe.

**Desktop:** 560px modal over the unchanged source screen.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Delete item** — W02. Delete current garment only after confirmation; show Item deleted.
- **Keep item** — W05. Close without mutation.

**Rules**

- List how many saved outfits reference it. Historical snapshots stay, but reopening flags the missing piece.
- Do not cascade-delete outfits or source photos used elsewhere.

### M01 — Make the preview yours

**Workflow:** Your model · **Layout:** form · **Back:** W02

Choose how you want to start.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Model route (select): Personal model, Adjustable avatar, Import model — initial example: Personal model

**Actions and destinations**

- **Set up personal model** — M02. Open optional face input and guided body capture.
- **Use adjustable avatar** — M04. Skip scans; use explicitly labelled stylized model.
- **Import a model** — M08. Show supported file and dressing limits before import.
- **Skip for now** — C01. Continue with a clearly labelled default avatar.

**Rules**

- Personal reconstruction is the target feature, not a verified existing service. If unavailable, show M08 immediately.
- Face input is optional and does not establish body proportions. Allow generic face with body capture.
- 3D model setup never gates wardrobe editing.

### M02 — Add your face

**Workflow:** Your model · **Layout:** upload · **Back:** M01

Use a clear front-facing photo, if you want face personalisation.

**Desktop:** Two columns: image intake 60%, guidance 40%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Face photo (file)

**Actions and destinations**

- **Continue** — M03. Keep reviewed face image locally until generation consent.
- **Skip face** — M03. Use generic face; do not infer one from identity.

**Rules**

- Display why photo is used and Remove photo. Reject multiple faces until cropped.
- Camera must have a non-camera upload alternative.

### M03 — Capture your proportions

**Workflow:** Your model · **Layout:** upload · **Back:** M02

Follow the capture guide for your personal model.

**Desktop:** Two columns: image intake 60%, guidance 40%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Front body photo (file)
- Side body photo (file)
- Height (cm) (number) — initial example: 170

**Actions and destinations**

- **Review inputs** — M04. Require provider-defined capture set and validate height.
- **Use manual controls instead** — M04. Switch to adjustable avatar; photos are not submitted.

**Rules**

- Target capture protocol: full-body front and side photos in normal close-fitting clothing; no nudity requested.
- Protocol is a proposed provider contract. If a chosen provider needs different inputs, revise this spec before implementation.
- Use centimetres as canonical units; inches toggle converts displayed values without changing stored height.
- Height range proposed 100–230cm; explain out-of-range and allow support route, not silent clamping.

### M04 — Review your model setup

**Workflow:** Your model · **Layout:** form · **Back:** M03

Your proportions. Your choice.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Height (cm) (number) — initial example: 170
- Shoulder width (range) — initial example: 50
- Build (range) — initial example: 50
- Skin tone (text)
- Hair (select): Short, Medium, Long — initial example: Medium

**Actions and destinations**

- **Continue** — M05. Personal model route reviews explicit generation consent.
- **Save adjustable avatar** — M07. Manual route saves a stylized avatar without claiming reconstruction.
- **Retake photos** — M03. Keep previous data until replacements accepted.

**Rules**

- Render selected avatar presentation; do not infer sensitive attributes from photos.
- Sliders are relative styling controls unless calibrated measurements exist; never label them accurate body measurements.
- Allow user correction. Do not reshape an uploaded photo.

### M05 — Create your personal model?

**Workflow:** Your model · **Layout:** confirm · **Back:** M04

These selected photos will be sent to the model service.

**Desktop:** 560px modal over the unchanged source screen.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Allow model generation (checkbox)

**Actions and destinations**

- **Create model** — M06. Only enabled when provider, consent and inputs are valid; account may be required.
- **Not now** — M04. Preserve local draft; upload nothing.

**Rules**

- List face/body inputs separately and provider retention information from configuration.
- Show cost/credit confirmation only if actual product charging exists; do not invent credits.
- When service is unavailable, route to M08, not a fake progress screen.

### M06 — Building your model

**Workflow:** Your model · **Layout:** processing · **Back:** M04

You can leave this page. We'll keep the job status here.

**Desktop:** Keep the submitted preview visible; status and cancel controls beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Review completed model** — M07. Automatic only when a valid renderable model is ready.
- **Cancel generation** — M04. Attempt job cancellation and explain if server job cannot be stopped.

**Rules**

- Persist job ID and status. Resume polling after return; never submit another chargeable job automatically.
- Separate upload, processing and model-loading status; only real progress is shown.
- Failure retains inputs and last usable model.

### M07 — Review your model

**Workflow:** Your model · **Layout:** avatar · **Back:** M01

Check your likeness before using it.

**Desktop:** 3D stage 60%, editing controls and score 40%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Model presentation (select): Front, Side, Back — initial example: Front

**Actions and destinations**

- **Use this model** — C01. Commit version only after explicit acceptance.
- **Adjust model** — M04. Edit manual parameters where supported.
- **Try again** — M02. Keep previous accepted version until replacement succeeds.
- **Remove model** — P03. Open scoped deletion controls.

**Rules**

- Label model type: Personal reconstruction, Adjustable avatar or Imported model.
- Provide drag rotation plus keyboard buttons and Front/Side/Back/Reset. Full body remains visible.
- A personal model must pass likeness and compatible garment checks before appearing as fully supported.

### M08 — Choose another way to preview

**Workflow:** Your model · **Layout:** form · **Back:** M01

Personal reconstruction is not available in this build.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- GLB file (file)

**Actions and destinations**

- **Use adjustable avatar** — M04. Continue with honest capability label.
- **Import for viewing** — M07. Validate GLB before loading; mark Imported model — viewing only.
- **Back to wardrobe** — W02. Keep garments untouched.

**Rules**

- Do not suggest that a generic GLB can automatically wear arbitrary uploaded clothes.
- Import target: self-contained GLB under 30 MiB with no external resource fetches; reject unsupported or corrupted files.
- Provider-dependent reconstruction and garment fitting are release gates, not cosmetic tasks.

### C01 — Dress for today

**Workflow:** ChicFit · **Layout:** form · **Back:** H01

A few details. More possibilities.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Occasion (select): Everyday, Work, Casual dinner, Night out, Travel — initial example: Casual dinner
- Weather (select): Cold, Mild, Warm, Hot — initial example: Mild
- Mood (select): Relaxed, Minimal, Classic, Bold — initial example: Relaxed
- Comfort preference (select): No preference, Comfortable shoes, Layer-friendly, Hands-free bag — initial example: No preference

**Actions and destinations**

- **Choose pieces** — C02. Require wardrobe pieces or explicit example mode.
- **Your model** — M01. Preserve occasion choices.

**Rules**

- Weather is manually chosen; no silent location permission or live weather claim.
- No suitable clothes shows a concrete Add item route, not invented owned pieces.

### C02 — Build your combination

**Workflow:** ChicFit · **Layout:** grid · **Back:** C01

Choose pieces from your wardrobe.

**Desktop:** Three-column item grid 72%, model/context panel 28%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Category (select): All, Tops, Bottoms, Layers, Shoes, Accessories — initial example: All

**Actions and destinations**

- **Preview outfit** — C03. Require one top, one bottom and shoes; validate model compatibility.
- **Add a piece** — W03. Return to this outfit draft after saving.
- **Let me start over** — C02. Clear selection only, not wardrobe.

**Rules**

- V1 category model supports one top, one bottom, one layer, one shoe pair and up to two accessories; one-piece support requires explicit category extension.
- Keep incompatible pieces selectable for collage/2D styling, but do not silently dress them on unsupported 3D models.
- User overrides recommendations; preferences influence sorting only.

### C03 — Putting your look together

**Workflow:** ChicFit · **Layout:** processing · **Back:** C02

Checking colour, occasion and your preferences.

**Desktop:** Keep the submitted preview visible; status and cancel controls beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **View completed outfit** — C04. Automatic when valid styling result exists.
- **Cancel** — C02. Keep selected pieces.

**Rules**

- AI analysis requires explicit consent for uploaded wardrobe photos and any body input used.
- Manual preview can proceed without AI, with score omitted and labelled Not checked.

### C04 — Same pieces. New energy.

**Workflow:** ChicFit · **Layout:** avatar · **Back:** C02

See your wardrobe work together.

**Desktop:** 3D stage 60%, editing controls and score 40%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- View (select): Front, Side, Back — initial example: Front
- Occasion (select): Everyday, Work, Casual dinner — initial example: Casual dinner

**Actions and destinations**

- **Save outfit** — C09. Open title and snapshot review.
- **Swap a piece** — C05. Open a category-filtered drawer.
- **Try another** — C02. Build a new candidate without discarding previous saved looks.
- **Generate photo preview** — C06. Open 2D AI try-on consent.

**Rules**

- Display real model type and garment fidelity. Physical fit and size are never guaranteed.
- Required cue Drag to rotate; also keyboard rotation/reset. Keep head and feet visible.
- Changing pieces or occasion invalidates the current score. Show Check this combination before another AI score.
- Score ticket appears only when matching input revision has a successful check.

### C05 — Swap a piece

**Workflow:** ChicFit · **Layout:** grid · **Back:** C04

Pick another item from this category.

**Desktop:** Three-column item grid 72%, model/context panel 28%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Category (select): Tops, Bottoms, Layers, Shoes, Accessories — initial example: Tops

**Actions and destinations**

- **Apply swap** — C04. Apply selected item, keep other pieces; invalidate score.
- **Cancel** — C04. Restore original candidate.

**Rules**

- Desktop 400px right drawer over stage; mobile full-height sheet.
- Preview temporary swap locally; Apply is the only commit point. Missing category offers Add item and retains returnTo.

### C06 — Generate a photo preview?

**Workflow:** ChicFit · **Layout:** confirm · **Back:** C04

See an AI styling illustration using your selected clothes.

**Desktop:** 560px modal over the unchanged source screen.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Allow photo preview (checkbox)

**Actions and destinations**

- **Generate preview** — C07. Submit selected supported clothes and approved person image after consent.
- **Not now** — C04. Stay on 3D view; send nothing.

**Rules**

- 2D photo preview and 3D dressed model are different outputs. Name both clearly.
- List excluded pieces, such as unsupported accessories, before submission; no silent omissions.
- Never promise accurate garment fit or identical commercial product reproduction.

### C07 — Creating your photo preview

**Workflow:** ChicFit · **Layout:** processing · **Back:** C04

Your outfit is on its way.

**Desktop:** Keep the submitted preview visible; status and cancel controls beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Review completed preview** — C08. Automatic valid result only.
- **Cancel** — C04. Keep stage and selection.

**Rules**

- Generation failure keeps the usable 3D/manual stage. No sample image substituted as personalised result.

### C08 — Your style preview

**Workflow:** ChicFit · **Layout:** compare · **Back:** C04

Original and generated outfit.

**Desktop:** Two equal image panes 68%, comparison details 32%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Save this preview** — C09. Save generated image alongside outfit snapshot.
- **Back to 3D** — C04. Keep generation result available.
- **Report a mismatch** — C04. Discard rejected output and retain original person image.

**Rules**

- Show Generated styling preview. Actual fit may vary.
- Preserve person identity and skin tone; let user reject altered likeness.
- Unsupported accessories are identified; do not label absent pieces as worn.

### C09 — Save your outfit

**Workflow:** ChicFit · **Layout:** form · **Back:** C04

Give this combination a name.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Title (text) — initial example: Casual dinner

**Actions and destinations**

- **Save outfit** — V03. Persist snapshot, garment IDs/revisions, model version, occasion and any analysis/preview.
- **Cancel** — C04. Keep current candidate.

**Rules**

- Allow save without an AI score; store Not checked provenance.
- Never store a sample model as the user's accepted personal reconstruction.

### V01 — Your next favourites live here

**Workflow:** Saved · **Layout:** empty · **Back:** H01

Save a check or a look to come back to it.

**Desktop:** One central message and primary action; retain product navigation.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Start a check** — S01. Open new photo draft.
- **Explore outfits** — C01. Open wardrobe-led styling.

**Rules**

- Show when saved count is zero. Do not seed false saved items.

### V02 — Saved for you

**Workflow:** Saved · **Layout:** grid · **Back:** H01

Your checks, hair ideas and outfits.

**Desktop:** Three-column item grid 72%, model/context panel 28%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Search saved (search)
- Type (select): All, Story Check, loox, ChicFit — initial example: All

**Actions and destinations**

- **Open saved item** — V03. Load a versioned snapshot.
- **Start a new check** — S01. Do not change saved list.

**Rules**

- Sort newest first; retain filter when returning. Empty filters show Clear filters.
- Badges identify Example, AI-generated and Not checked; never hide provenance.

### V03 — Your saved look

**Workflow:** Saved · **Layout:** detail · **Back:** V02

A snapshot you can return to.

**Desktop:** Preview 55%, item information and actions 45%.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Title (text) — initial example: My saved look

**Actions and destinations**

- **Use this again** — H01. Resolve by type: Story to S02, loox to L05, outfit to C04; clone as a new draft.
- **Rename** — V03. Save title without re-running AI.
- **Download** — S12. Use type-appropriate export; do not convert outfit into Story Check.
- **Delete saved item** — V04. Open confirmation.

**Rules**

- Reopen preserves historical image/score and data version. It does not silently recompute.
- Missing wardrobe items show unavailable badges and Swap item action; do not erase historical snapshot.
- Dynamic return destinations are part of this contract even though the atlas uses a sample route.

### V04 — Delete this saved look?

**Workflow:** Saved · **Layout:** confirm · **Back:** V03

Your wardrobe pieces will stay.

**Desktop:** 560px modal over the unchanged source screen.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Delete saved look** — V02. Remove this snapshot only.
- **Keep saved look** — V03. Cancel.

**Rules**

- Remove unused derived assets only after checking references. No wardrobe cascade.

### P01 — Your space

**Workflow:** Your space · **Layout:** form · **Back:** H01

Make vibecheck feel like you.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Display name (text)
- Default mood (select): Effortless, Playful, Bold, Professional — initial example: Effortless

**Actions and destinations**

- **Save preferences** — P01. Validate and persist locally; do not imply automatic cloud sync.
- **Appearance** — P02. Open visual style controls.
- **Photos and model data** — P03. Open scoped data management.
- **Backup and restore** — P04. Open data tools.
- **Account** — A01. Show signed-in account panel if session exists.

**Rules**

- Display name optional, max 40 characters. Use neutral greeting when blank.
- Signing out clears session tokens but does not erase device records; explain this adjacent to Sign out.

### P02 — Choose your visual style

**Workflow:** Your space · **Layout:** form · **Back:** P01

Same tools. Your preferred feel.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Visual style (select): Soft, Sharp — initial example: Soft
- Reduced motion (select): System, On — initial example: System
- Encouraging notes (checkbox) — initial example: true

**Actions and destinations**

- **Apply appearance** — H01. Persist style; all routes keep identical functionality.
- **Cancel** — P01. Restore previous setting.

**Rules**

- Soft is the female reference style; Sharp is the male reference style. User can select either regardless of gender or portrait.
- Never infer style from face/body scan. Changing style never changes scores, owned clothes or available features.
- Notes off hides decorative encouragement only, not substantive feedback.

### P03 — Your photos and model data

**Workflow:** Your space · **Layout:** form · **Back:** P01

Choose exactly what to remove.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Data to remove (select): Face photo, Body photos, Generated model, Generated previews — initial example: Face photo

**Actions and destinations**

- **Review deletion** — P07. List selected assets and affected features.
- **Back to settings** — P01. No changes.

**Rules**

- Explain device and cloud scope separately; do not imply clearing local data deletes cloud copies.
- Deleting a generated model does not delete wardrobe. New model generation requires new consent.

### P04 — Back up your space

**Workflow:** Your space · **Layout:** form · **Back:** P01

Choose a local file or your account backup.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Export local backup** — P04. Create a validated JSON backup including photos; report completion after file creation.
- **Restore backup** — P05. Open file/cloud source chooser and preview counts.
- **Back up to cloud** — P08. Require sign-in; show replacement confirmation.
- **Clear this device** — P06. Open destructive confirmation.

**Rules**

- Existing cloud model is explicit snapshot backup, not automatic live sync.
- Show last successful cloud backup time. No silent account-wide overwrite.
- Local backup contains personal images; say Store this file somewhere private.

### P05 — Restore your backup

**Workflow:** Your space · **Layout:** form · **Back:** P04

Review what will replace this device's data.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Backup file (file)
- Source (select): Local file, Cloud backup — initial example: Local file

**Actions and destinations**

- **Restore reviewed backup** — P01. Only after schema validation, counts preview and replacement confirmation.
- **Cancel** — P04. Keep current device data.

**Rules**

- Parse before mutation. Show garment/saved/model counts and backup timestamp.
- Offer Export current data first. Keep old data until successful atomic replacement.
- Version conflict or invalid backup never partially restores.

### P06 — Clear this device?

**Workflow:** Your space · **Layout:** confirm · **Back:** P04

This removes local photos, wardrobe, models and saved looks.

**Desktop:** 560px modal over the unchanged source screen.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Fields and choices**

- Type CLEAR (text)

**Actions and destinations**

- **Clear device data** — H01. Require exact CLEAR; remove local content and reset navigation.
- **Keep my data** — P04. Cancel.

**Rules**

- Explicit text: Your cloud backup will not be deleted. No vague Delete everything label.
- Offer backup before clearing. No automatic rehydration from cloud after clear.

### P07 — Delete selected data?

**Workflow:** Your space · **Layout:** confirm · **Back:** P03

Review the scope before continuing.

**Desktop:** 560px modal over the unchanged source screen.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Delete selected data** — P03. Delete only selected assets and report local/cloud outcomes separately.
- **Cancel** — P03. No mutation.

**Rules**

- Show asset type, count and storage location. If cloud deletion fails, report partial outcome and retry cloud only.
- Account deletion is a separate scoped feature and is not implied by deleting photos.

### P08 — Replace your cloud backup?

**Workflow:** Your space · **Layout:** confirm · **Back:** P04

This saves this device as your account's latest backup.

**Desktop:** 560px modal over the unchanged source screen.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Save cloud backup** — P04. Use current version precondition; commit once.
- **Cancel** — P04. Do not upload.

**Rules**

- Explain that previous backup is replaced, not merged.
- A version conflict displays Another device updated your backup. Refresh before saving. Never overwrite silently.

### X01 — That didn't finish

**Workflow:** Recovery · **Layout:** form · **Back:** H01

Your inputs are still here.

**Desktop:** Form column max 640px with contextual image/help beside it.

**Mobile:** Single-column order follows this screen's section order; primary action follows content. Use a full-height sheet for desktop modals. Preserve all controls and labels.

**Actions and destinations**

- **Try again** — H01. Return to originating operation using stored origin and exact draft; require a deliberate retry.
- **Edit inputs** — H01. Return to originating setup screen, not always Home.
- **Back home** — H01. Preserve recoverable draft.

**Rules**

- Use specific errors: unsupported image, offline, no clear face, rate limit, provider unavailable, expired session or failed save.
- No score/preview is fabricated on failure. Cancelled job responses are ignored.
- For 401 route A01 with returnTo; for 429 show server reset time; for offline show Reconnect and retry.

