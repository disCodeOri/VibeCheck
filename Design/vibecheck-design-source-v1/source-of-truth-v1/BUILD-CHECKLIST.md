# Build and acceptance checklist

## Product decisions carried forward
- [x] Two visual styles with identical workflows.
- [x] Original logo kit remains the visual north star.
- [x] Female desktop target added.
- [x] Screen IDs, actions, fields and recovery behavior documented.
- [ ] Product owner reviews the selected account default. Until changed, preserve current signed-in AI / local-save policy.
- [ ] Personal-model provider and exact capture protocol are verified.
- [ ] Garment representation and compatible dressing are verified before claiming realistic 3D try-on.

## Phase 1 — shared foundation
- [ ] Implement source tokens, exact fonts, Soft/Sharp appearance setting and reduced-motion behavior.
- [ ] Build real responsive shell: desktop sidebar and multi-column space; mobile Home/Saved/Me.
- [ ] Remove the current universal 440px cap only as part of implementing this desktop source.
- [ ] Share validation, confirmation, photo intake, job state and persistence components.
- [ ] Store draft IDs/input revisions so edits cannot display stale analysis.
- [ ] Preserve exact source brand assets; do not rebuild logos from generated PNGs.

## Phase 2 — complete core workflows
- [ ] Story Check S01–S13 including crop, manual reference posts, comparison tie, export and save failure.
- [ ] loox L01–L08 including photo anchors, style inspiration distinction, preview consent and reject-likeness path.
- [ ] Wardrobe W01–W06 including add/edit/delete, filters and missing-item references.
- [ ] Model M01–M08 including honest current fallback and intended personal generation path.
- [ ] ChicFit C01–C09 including swap invalidation, keyboard rotation and separate 2D preview.
- [ ] Saved V01–V04; account A01–A05; settings P01–P08.
- [ ] No dead buttons. Every visible action must follow its registry effect or be visibly unavailable with a reason.

## Phase 3 — verification
- [ ] Test at 360×800, 390×844, 768×1024, 1024×768 and 1440×1024.
- [ ] Verify both styles across one complete journey for each feature, not only the Home screen.
- [ ] Test keyboard-only upload, navigation, crop, model rotation, dialogs and export.
- [ ] Verify focus order, text contrast, readable error copy and reduced-motion state.
- [ ] Run a fresh upload, invalid upload, denied camera, cancelled job, offline retry and expired-session recovery.
- [ ] Change crop/mood/garment after a result; prove the old score cannot appear as current.
- [ ] Save, reload browser, reopen, rename and delete each saved type.
- [ ] Delete a garment used by a saved outfit; snapshot remains, missing piece is flagged.
- [ ] Verify local and cloud deletion scopes separately; test backup version conflict.
- [ ] Validate real 3D camera interaction separately from personal reconstruction and garment compatibility.
- [ ] Do not certify personal 3D likeness from a successful generic-avatar rotation test.

## Screenshot acceptance
Use matching content and viewport. Compare source and browser render side by side. Confirm font roles, component bounds, ticket notches, overlap, callout anchors and responsive hierarchy. Generated photo poses or decorative raster irregularities need not be recreated pixel-for-pixel; component geometry, exact controls and action behavior must match the written contract.

Every implemented screen must have its registry ID recorded in the review. Shared-state tests may cover multiple screens only when they use the same implementation. No live AI credentials or generated output is assumed by this design package.

## Known current implementation boundaries
These facts were read from current README.md and design-qa.md on 20 September 2026, not live service verification: current app uses adjustable/stylized avatar; imported GLB is viewing-only; explicit cloud backups do not automatically sync; live AWS AI and full personal reconstruction remain separate validation tasks. This task adds design artifacts only.

