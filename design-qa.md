# Design QA — integrated male UI revision

Date: 20 September 2026

## Findings

- **P1, unresolved product capability: personal 3D likeness and fitted garments.** The reference's ChicFit stage shows a realistic person wearing the selected clothes. The current live viewer remains a procedural avatar; importing a GLB does not dress it. The UI explicitly labels these limits. Rotation was verified, but this is not acceptance of the requested personal reconstruction. Complete the provider benchmark and body/garment compatibility work described in [3D feasibility](docs/3d-feasibility.md). No provider credentials or live reconstruction test are available.
- **P3, visual refinement:** generated portraits, the exact score-plate silhouette and typeface shapes are close to the direction but are not pixel-identical to the raster mockups. Actual controls use Manrope and Barlow Condensed. No original font specification was available in the boards.
- **Expected product differences:** photo replacement, example-result labels, AI consent copy, editable wardrobes, empty states and model limitations require controls absent from the mockups. Longer screens scroll. The wardrobe has six retained sample pieces rather than the board's five; a redundant add tile is hidden when there are already six visible cards. Existing pieces were not deleted to force the screenshot layout.

## Visual truth and evidence

Source boards:

- `Design/integrated-male-v1/01-story-and-expression.png` — Home, Story ticket, Compare.
- `Design/integrated-male-v1/02-loox-and-chicfit.png` — loox, wardrobe, outfit stage.
- `Design/logos main.png` and the supplied logo kit establish navy, cobalt and layered blue brand forms. Existing supplied SVG brand assets are retained.

Browser-rendered captures:

- `artifacts/ui-v2/home.png`
- `artifacts/ui-v2/story.png`
- `artifacts/ui-v2/compare.png`
- `artifacts/ui-v2/loox.png`
- `artifacts/ui-v2/wardrobe.png`

Full-view comparisons place source left and implementation right in the same image:

- `artifacts/ui-v2/home-comparison.png`
- `artifacts/ui-v2/story-comparison.png`
- `artifacts/ui-v2/loox-comparison.png`
- `artifacts/ui-v2/wardrobe-comparison.png`

Focused score, typography, overlap and receipt comparison: `artifacts/ui-v2/ticket-detail-comparison.png`.

### Viewport and normalization

Both source boards are 1536 × 1024 pixels. Device frames, status bars and presentation captions were excluded from the selected source regions. Home uses a 347 × 819 crop, Story and wardrobe 350 × 819, and loox 346 × 819. Each crop is scaled proportionally to 390 pixels wide, giving heights of 920, 913, 913 and 923 respectively. Do not interpret the remaining rounded lower screen edge as application UI.

The mobile browser was set to 390 × 844 CSS pixels; reported device pixel ratio was approximately 1. The in-app browser exported 375 × 812 raster screenshots. These were proportionally normalized to 390 × 844 for comparisons. Source crops represent a taller screen, so the difference in total screen height is recorded rather than stretching either image or judging its bottom edge as an overflow bug. Additional responsive checks used 360 × 800 and 1440 × 1000 CSS viewports. Temporary viewport overrides were reset.

States: Home with Story selected; Story with labeled example analysis; Compare with local original/crop example and labeled illustrative scores; loox with labeled example suggestions; wardrobe with six existing sample pieces. These are not live AI results.

## Required fidelity surfaces

| Surface | Review |
|---|---|
| Fonts and typography | Heavy two-line home heading, condensed score/verdict, sans-serif encouragement, smaller functional labels. No handwritten type. Display score enlarged after comparison. Raster font shapes are approximate. |
| Spacing and layout | Removed dashboard sidebar; app and persistent navigation capped at 440 px on desktop. Mode selector sits above the home portrait. Portrait-led Story receipt overlaps the image. Wardrobe uses three columns. Loox has a compact hairstyle image row. |
| Colors and tokens | Navy text, blue actions, ice-blue surfaces. Action computed color verified as `rgb(23, 100, 255)`. Screenshots can be affected by browser color conversion; no exact sampled-color equality is claimed. |
| Images and assets | Reused actual brand SVGs; generated new close portraits, layered plate and hairstyle strip from the reference direction. No CSS cutout of the old full-body portrait remains on Home. Loox banner uses the raster plate asset. Sample hair images are explicitly inspiration, not previews generated from a user's upload. |
| Copy and content | Preserved the requested core headings and feature names. Scores remain labeled examples when illustrative. AI preview, privacy and 3D limitation copy reflects actual behavior. |

## Comparison history

1. **P1: spacious dashboard and mismatched full-body Home image.** Replaced sidebar/dashboard composition with a compact app shell and close portrait with background lettering. Post-fix: `home-comparison.png`.
2. **P2: small score inside the card and excess Story header height.** Moved the layered plate across the photo/receipt boundary, enlarged digits, and placed format selection alongside the route header. Post-fix: `story-comparison.png` and `ticket-detail-comparison.png`.
3. **P2: text-only hairstyle choices and weak overlap.** Added sample hairstyle imagery, kept live suggestions distinct from generated previews, and used the layered raster plate for the summary banner. Post-fix: `loox-comparison.png`. Earlier versions are retained in `loox-comparison-before-polish.png`.
4. **P2: sparse wardrobe and off-screen model banner.** Changed to three columns, reduced card spacing, and removed the duplicate add tile when six visible pieces already fill the grid. Post-fix: `wardrobe-comparison.png`.
5. **P2: comparison result repeated two large tickets.** Replaced with an emphasized winning photo and paired metric bars. Added a labeled local sample flow so the result can be inspected without API credentials. Post-fix: `compare.png`.
6. Earlier Home/Story polish comparisons are retained in `home-comparison-before-polish.png` and `story-comparison-before-polish.png`.

## Functional checks

- Production build completed; offline asset manifest generated.
- Existing regression suite: 37 tests across six files passed.
- Browser error log checked: no errors returned in the verification session.
- Home feature selection, navigation, example opening, crop dialog and applying crop verified. Applying a crop clears the previous analysis and returns to a fresh-check state.
- Compare requires both inputs; local sample comparison shows both photos, the selected winner, paired bars, and an example disclosure.
- Wardrobe, Outfit and Your model navigation verified. View changes to Side visibly rotate the actual 3D canvas; front/side/back/reset controls remain available.
- At desktop width, app and bottom navigation both measured 440 px. At narrow phone width, no horizontal document overflow was observed. Longer content remains scrollable above persistent navigation.
- Live AI analysis, AWS deployment, real photo-to-3D, garment reconstruction and dressing imported models were not tested or completed. These require account/credential setup and, for 3D, additional implementation.

## Implementation checklist

- [x] Restore the compact reference-led layout and core visual elements.
- [x] Verify major local interactions and responsive presentation.
- [x] Document real capabilities, model candidates and prices.
- [ ] Benchmark personal face/body likeness with Tripo and record cost per accepted model.
- [ ] Build and validate separate body and garment meshes, fitting and rig compatibility.
- [ ] Deploy and test AWS services after account setup.

Final result: **blocked**

The visual revision is implemented and locally verified. Full acceptance of the requested integrated experience is blocked by the missing personal 3D reconstruction and garment-fitting capability; this report does not represent the whole app as production complete.
