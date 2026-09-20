# vibecheck. — Design source of truth v1
Version 1.0 · 20 September 2026 · Design target, not evidence of completed implementation.

## Start here
Open `index.html` for the visual design atlas. Choose a workflow, select a screen, switch Soft/Sharp and Desktop/Mobile, inspect its controls and follow its transitions. Use the state selector to inspect recovery patterns. The atlas is a documentation viewer: its buttons illustrate navigation; it does not upload, analyse, save account data or render a real 3D model.

The six female desktop PNGs are in `visuals/female/`. The male desktop references and both mobile boards are linked from the atlas. The screen registry contains 63 uniquely identified screens and their action contracts. State variants use the shared definitions in STATES.md rather than duplicating entire screens.

## Authority order
1. Explicit user decisions in this task: both female and male visual styles; identical workflows; concrete build guidance; retain original logo/design kit and named interaction motifs.
2. This version's written contracts: DESIGN-SYSTEM.md, STATES.md and the screen registry. These decide behavior, exact labels, responsive rules and validation.
3. The matching desktop PNG and mobile reference board decide visual character and composition.
4. Older mockups are historical inspiration. Existing implementation behavior is evidence of current capability, not permission to override this source.

If a PNG contains different minor copy, omits a necessary control, invents metadata or shows a working personal model, the written contract wins. Do not copy an image-generation artifact as product behavior. Do not claim these new defaults were separately user-approved.

## Deliverables
- `index.html`: browsable screen atlas and workflow navigator.
- `screens.json`: machine-readable screen contracts.
- `WORKFLOWS.md`: connected journeys and every screen specification.
- `DESIGN-SYSTEM.md`: exact layout, typography, tokens, component and responsive decisions.
- `STATES.md`: reusable loading, error, empty, disabled and success states.
- `BUILD-CHECKLIST.md`: implementation and acceptance checklist, including capability gaps.
- `generation-prompts.md`: exact imagegen prompts, including source references.
- `visuals/female/`: six female desktop visual targets.

## Decisions and defaults
**Confirmed:** two visual styles with the same workflows. Female reference uses soft organic layers and sparse handwritten encouragement. Male reference uses firmer layered plates and typeset encouragement. Brand identity stays shared.

**Selected design default:** call these selectable styles Soft and Sharp in product settings. Do not infer a user's gender from an image or force a style based on identity.

**Account default, pending any user correction:** guests can explore labelled examples, prepare local drafts, manage local clothes and save local items. Current AWS live AI requires sign-in. Cloud backup also requires sign-in. The optional question about sign-in timing has not been answered; this source preserves the verified existing account boundary rather than promising guest live AI. This is not a mandatory sign-in wall for first launch.

**3D target:** personal face/body reconstruction plus compatible garment dressing remains intended. Current repository documentation says the available avatar is adjustable/stylized and imported GLB models are viewing-only. M01–M08 define both the target workflow and honest fallbacks. A provider-specific capture protocol and garment compatibility must pass verification before enabling the personal route.

**Desktop target:** use a genuine multi-column workspace at wide widths. Current `src/reference-ui.css` caps the app at 440px; that behavior is not the new desktop target. This task does not change product code.

## What “complete design coverage” means
Every v1 entry, input, review, consent, processing, result, edit, save and deletion step has a screen contract. Universal recovery cases attach to those screens. Six hero screens per desktop style are high-fidelity raster targets. Remaining screens have annotated construction previews in the atlas, not independently generated pixel-perfect artwork. Implement them with the defined shared components and screen contracts, not unconstrained invention.

Explicitly outside v1: Instagram account scraping or auto-posting, payments/subscriptions, social feed, messaging, shopping marketplace, virtual garment sizing guarantees, automated live cloud sync, generated playable music and account deletion UI. Add such features only through a revised source version.

## Implementation handoff
Read the three rule documents before implementing a screen. Record its screen ID in the implementation checklist. Preserve all routes, action semantics, input revisions and state variants. Compare real browser renders at 390×844 and 1440×1024 against the corresponding targets and construction previews. Do not approve a screenshot alone as proof that saving, retry, cancellation or 3D generation works.

