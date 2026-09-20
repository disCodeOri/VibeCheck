# Design system and component contract

## Shared identity
Use the original navy/cobalt vibecheck. logo supplied in Design/logos main.png and Design/logo design kit.png. Existing public/brand assets are implementation candidates; keep their source and approval status visible. Do not trace a generated screenshot logo or silently redesign the icon.

Use two selectable styles, Soft and Sharp. These are appearance settings; both offer exactly the same features, navigation, validation and recommendation choices. Portrait and clothing examples illustrate the requested female/male versions; they do not constrain real users.

## Tokens
| Token | Value | Use |
|---|---|---|
| Canvas | #F7FAFF | Application background |
| Surface | #FFFFFF | Forms, drawers and tickets |
| Ink | #061538 | Primary text |
| Action | #2463FF | Primary controls and selected state |
| Action hover | #174BD6 | Pointer hover |
| Secondary text | #53647F | Body explanations and metadata |
| Line | #D8E3F2 | Dividers and inactive borders |
| Cloud | #BBDFFF | Decoration and secondary fills |
| Selected fill | #E9F1FF | Selected rows |
| Error text | #9C2331 | Error explanation; pair with icon and text |
| Error fill | #FFF0F2 | Error region |
| Success text | #176B47 | Confirmed success; pair with text |
| Warning fill | #FFF5DE | Nonblocking correction hint |

Cobalt is not body text on tinted backgrounds without a contrast check. Required contrast: 4.5:1 normal text, 3:1 large text and meaningful UI boundaries. Decorative gradients contain no essential labels by themselves. Focus outline: 3px #061538, 3px offset.

## Type and spacing
Use Manrope for headings, interface and body; existing project packages include it. Use Barlow Condensed 800 for score numerals and short emphatic verdicts. These are now explicit target choices; earlier raster font shapes are not a font specification.

| Role | Desktop | Mobile |
|---|---|---|
| Page heading | 40/48px, 800 | 30/36px, 800 |
| Section heading | 24/32px, 800 | 22/28px, 800 |
| Body and inputs | 16/24px, 500 | 16/24px, 500 |
| Labels | 14/20px, 700 | 14/20px, 700 |
| Supporting metadata | 12/18px, 500 | 12/18px, 500 |
| Primary score | 96/96px, condensed 800 | 80/80px, condensed 800 |
| Verdict | 40/44px, condensed 800 | 36/40px, condensed 800 |

Soft encouragement may use a supplied handwritten artwork overlay with the exact same text available accessibly. It is nonfunctional decoration. Do not use handwriting for field labels, errors, buttons, scores or rotation instructions. Dynamic encouragement uses Manrope until an explicit reusable handwriting font/asset is supplied. Sharp uses Barlow Condensed or Manrope, never handwriting.

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px. Default page gap 24px desktop, 16px mobile. Fields: label gap 8px, group gap 20px. Radius: photo 24px, surface 20px, field/button 12px, tag 999px. Border 1px. Shadow only for overlays: 0 16px 48px rgba(6,21,56,.14).

## Responsive layout
- At 1200px and above: 240px fixed sidebar, 72px header, main content max 1440px, 32px page padding; use documented two/three-column screen grids.
- At 768–1199px: 80px icon rail with accessible names/tooltips, 24px page padding. Collapse three-column comparison into two image columns with summary below. Large forms/stages use a single main column if their minimum width cannot fit.
- Below 768px: no desktop sidebar; 56px top bar and bottom navigation Home / Saved / Me, 16px page padding. Main content fills width, capped at 600px only for reading comfort. Include safe-area inset.
- At 390×844 reference viewport: every essential action is reachable with vertical scrolling. Do not crop content to imitate a taller phone mockup.
- At 360px: no horizontal document overflow. Inputs remain 16px. Garment grid uses two columns when three would fall below 112px per card.
- Sticky bottom actions use at least 16px padding plus safe area. Reserve matching content padding so controls never cover final fields.
- Desktop form modal: max 560px width, max calc(100dvh - 64px) height, internal scroll. Mobile: full-height sheet, close/back visible.
- Desktop swap drawer: 400px. Mobile: full-width sheet.
- Photo comparison: desktop equal panes; mobile equal side-by-side thumbnails followed by optional full-width single preview, not horizontally clipped canvases.

## Components
**Navigation:** icon plus text; selected state has fill, colour and aria-current. Desktop sidebar links Home, Story Check, loox, ChicFit, Wardrobe, Saved; profile/Settings at bottom. Mobile Home provides feature entry. No notification bell unless an actual notification inbox is specified; generated bells are decorative artifacts, not a requirement.

**Primary button:** minimum 48px height, label 14px/700, 20px horizontal padding. Secondary is white with line border. Disabled state is both visual and programmatic. A visible explanation states what is missing. Pending button retains width, shows a spinner and blocks duplicates.

**Photo intake:** one labelled drop zone, Choose photo, camera alternative, supported formats and 12 MiB limit, preview, Replace, Remove. Keyboard activation equals drag/drop. Wrong files do not erase a previously valid photo. Camera permission is requested only on Use camera.

**Score ticket:** notched white surface, 12px semicircular edge notches, dotted separator, large score, /100 or % unit, short verdict, textual explanation, 2–3 metrics, one next action. Score never substitutes for explanation. Notches and decorative shape do not cover text. Mobile score overlaps photo/ticket boundary by 24–40px; desktop overlaps ticket top or inner photo boundary by 16–24px.

**Soft layered shape:** three offset curved membranes, navy text on light inner layer, at most two 12–20% transparent secondary layers. Suggested local bounds 200×160px desktop and 164×140px mobile; shape size adapts to content. Keep text in a stable inset area of at least 16px.

**Sharp layered shape:** two offset asymmetrical rounded plates, small 6–10 degree offset, 12–24px corner radii, distinct cobalt rear layer. Same text inset and score hierarchy as Soft. Never use jagged edges that clip labels.

**Encouragement:** max 32 characters, never covers face, important garment detail or action. One main overlay per photo. Sharp uses typeset text; Soft may use approved handwritten artwork. Users can hide decorative notes.

**Photo callout:** 12–14px label, max two short lines, 8px anchor dot, 1.5px connector. Store anchors in normalized image coordinates. Maximum four simultaneously. In dense mobile photos, use numbered dots with an accessible list. Provide Show highlights toggle. Label placement adjusts without moving target anchor.

**Garment card:** image area 1:1 with contain fit, name max two lines, category text, selected check and outline, three-dot action menu. Selection is never represented by colour alone. One item per upload in v1.

**3D stage:** minimum 560px high desktop or 400px mobile; complete body within viewport, orbit constrained to useful view, pinch/zoom optional, Front/Side/Back/Reset always present. Provide keyboard rotate controls, textual model-type label and loading/error fallback. “Drag to rotate” is visible and sans-serif in both styles. A static image is never labelled interactive 3D.

**Compare pane:** equal image bounds, A/B label, original/preview provenance, selected check, same metric order. A recommendation does not prevent user selection. For ties, neither image receives a winner badge.

**Toast:** 4–6 seconds for noncritical confirmations, aria-live polite, no required action hidden inside a disappearing toast. Errors persist until dismissed or resolved. Save failure stays beside the Save action.

**Confirmation dialog:** descriptive title, affected object/scope, Cancel and precise destructive verb. Initial focus goes to safe action. Escape cancels, focus returns to invoker. For irreversible device clear require typed CLEAR. Avoid vague OK labels.

## Motion
Soft can have subtle 2px decorative breathing over 5–7 seconds. Labels and interaction areas remain stationary. Sharp uses 160ms opacity/translation transitions only. Respect prefers-reduced-motion and explicit user setting. No infinite decorative motion around essential reading or errors.

## Interaction invariants
- Preserve user drafts on back, network failure, expired session and cancelled dialogs.
- A crop, garment swap, mood change or reference edit creates a new input revision. Previous score becomes stale and is hidden from the new candidate until checked.
- Save success requires confirmed storage success. Cloud and device destinations are explicit.
- All real actions have keyboard support; pointer dragging always has button/slider equivalents.
- Generated preview, example, personal reconstruction, imported model and adjustable avatar are distinct labels.
- No UI promises unsupported privacy, storage duration, body accuracy, or auto-posting.

