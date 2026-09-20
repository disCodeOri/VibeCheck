# Vibe Check Design System Specification

**Version**: 2.0  
**Target Platform**: React Native (iOS, Android, Web)  
**Design Philosophy**: *One Vibe. All You.* — Intentional, decluttered, editorial, and obsessively refined.

---

## 1. Brand & Aesthetic Vision

Vibe Check combines high-fashion editorial aesthetics with instant mobile clarity. Rather than overwhelming users with dense buttons or clinical forms, the interface uses:
- **Bold condensed typography** for punchy headlines and scores.
- **Editorial italics** for poetic nuance and brand warmth.
- **Airy pastel mood surfaces** (`skySoft`, `lavenderSoft`, `peachSoft`, `sageSoft`) for low-cognitive-load categorisation.
- **Tactile iOS-style action sheets** to replace crowded multi-button rows.
- **Dynamic motion & soundwave equalizers** for instant creative delight.

---

## 2. Color Palette & Design Tokens

All tokens are defined in [`tokens/colors.ts`](file:///c:/Users/admin/OneDrive/Desktop/AWS%20Hackathon/frontend/design/tokens/colors.ts).

### 2.1 Core Palette
| Token | Hex Value | Semantic Role |
| :--- | :--- | :--- |
| `cobalt` / `blue` | `#005BFF` | Primary brand accent, primary CTA buttons, active focus |
| `blueDark` | `#0040B8` | Subtitles, pressed primary states, high-contrast labels |
| `midnight` / `ink` | `#080D23` | Headline typography, high-impact hero backgrounds |
| `surface` | `#FFFFFF` | Card backgrounds, sheet modals, button labels |
| `canvas` / `background` | `#F9F9FA` | App screen canvas background |
| `muted` | `#6B7280` | Supporting metadata, timestamp labels, subtle icons |

### 2.2 Soft Pastel Mood Tints
Used for intent chips, mood cards, and aesthetic categories:
| Token | Base Tint | Soft Background | Mood Semantic |
| :--- | :--- | :--- | :--- |
| `sky` / `skySoft` | `#005BFF` | `#E8F4FE` | Effortless, attractive, photo intakes |
| `lavender` / `lavenderSoft` | `#7C3AED` | `#F3EFFF` | Aesthetic, mysterious, romantic |
| `peach` / `peachSoft` | `#EA580C` | `#FFF2EB` | Funny, chaotic, night out |
| `sage` / `sageSoft` | `#16A34A` | `#EBF7EE` | Professional, personal update, travel |
| `blueSoft` | `#005BFF` | `#E8F0FF` | Active cards, quota badges, neutral accents |

### 2.3 Borders & Separation
- `line`: `#ECEEF2` — Subtle divider lines and chip borders
- `cardBorder`: `#E2E5EB` — Card containment borders (1px)
- `danger`: `#DC2626` — Destructive actions and error notices
- `green`: `#16A34A` — Positive validation highlights and working elements

---

## 3. Typography Hierarchy

Defined in [`tokens/typography.ts`](file:///c:/Users/admin/OneDrive/Desktop/AWS%20Hackathon/frontend/design/tokens/typography.ts).

| Role | Font Family | Size / LineHeight | Transform / Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Headline** | `Anton_400Regular` | 44–56px / 46–56px | Uppercase | Screen titles, hero punchlines ("ONE VIBE. ALL YOU.") |
| **Hero** | `InstrumentSerif_400Regular` | 38–44px / 42–48px | Normal / Italic | Emotional banners ("Your Story. Your Way.") |
| **Title** | `DMSans_700Bold` | 24–26px / 30–32px | Normal | Section cards, modal sheet headings |
| **Subhead** | `DMSans_500Medium` | 15–16px / 22–24px | Normal | Editorial guidance, card subtitles |
| **Body** | `DMSans_400Regular` | 14–15px / 20–22px | Normal | Standard readable prose and explanations |
| **Label** | `DMSans_700Bold` | 11–12px / 16px | Uppercase, +0.6 kerning | Category pills, metadata tags, badge labels |
| **Button** | `DMSans_700Bold` | 14–15px / 18px | Normal | Interactive touch buttons |

---

## 4. Spacing & Elevation

Defined in [`tokens/spacing.ts`](file:///c:/Users/admin/OneDrive/Desktop/AWS%20Hackathon/frontend/design/tokens/spacing.ts) and [`tokens/radii.ts`](file:///c:/Users/admin/OneDrive/Desktop/AWS%20Hackathon/frontend/design/tokens/radii.ts).

- **Grid**: 4px base increment (`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `xxl: 24`, `hero: 32`).
- **Touch Target**: Minimum `44×44px` touchable footprint for all buttons and interactive chips.
- **Corner Radii**:
  - `sm: 8` — Micro pills and small badges
  - `md: 12` — Buttons and input fields
  - `lg: 16` — Standard cards and media previews
  - `xl: 20` — Hero panels and modal sheets
  - `pill: 9999` — Full capsule buttons and segmented controls
- **Elevation**: Minimal shadows. Contrast is achieved via crisp 1px borders (`#E2E5EB`), high-contrast ink typography, and light pastel fills.

---

## 5. Components Architecture

All components reside in [`components/`](file:///c:/Users/admin/OneDrive/Desktop/AWS%20Hackathon/frontend/design/components).

### 5.1 Primitives (`ui.tsx`)
- `<Screen>`: Safe-area layout container with header, optional back arrow, and pinned bottom footer actions.
- `<T>`: Themed typographic primitive respecting font tokens and color scales.
- `<Button>`: Variants: `primary`, `secondary`, `soft`, and `destructive`. Supports loading spinners and Feather vector icons.
- `<Card>`: Rounded, bordered containment box with customizable background.
- `<Chip>`: Interactive pill button for mood selection, filter toggles, and status badges.
- `<SegmentedControl>`: Fluid iOS-style multi-option tab switcher.
- `<Field>`: Labelled input container with validation error states.
- `<Notice>` / `<ErrorNotice>`: Editorial info callouts and graceful error handling.

### 5.2 Advanced Hero Panels
- `<InkPanel>`: Midnight navy gradient hero card with organic vector brush texture.
- `<AnimatedVibeShowcase>`: Interactive SVG vector artwork with 4 dynamic equalizer frequencies, pulsing score badge, and quick mood switcher.
- `<ActionSheet>`: Clean iOS-style slide-up modal used to declutter dense screens.
- `<MediaPreview>`: Media card with automatic aspect ratio handling, letterbox safety, and color swatch fallback.

---

## 6. Vector Navigation Glyphs

Located in [`icons/NavigationIcons.tsx`](file:///c:/Users/admin/OneDrive/Desktop/AWS%20Hackathon/frontend/design/icons/NavigationIcons.tsx).

Custom SVG glyphs built with the signature 9:16 story frame:
1. `NavCheckIcon`: 9:16 story frame enclosing a centered checkmark with subtle story notch.
2. `NavLooxIcon`: 9:16 story frame enclosing a 4-point aesthetic sparkle star.
3. `NavChicfitIcon`: 9:16 story frame enclosing an outfit hanger / silhouette profile.
4. `NavHistoryIcon`: 9:16 story frame enclosing a reverse counter-clockwise clock face.
5. `NavYouIcon`: 9:16 story frame enclosing a clean minimalist user profile avatar.

---

## 7. Screen Blueprints

All screen designs in [`screens/`](file:///c:/Users/admin/OneDrive/Desktop/AWS%20Hackathon/frontend/design/screens) follow these rules:
1. **Never overcrowded**: Use spacious vertical rhythm (12–16px gaps) with max 1 primary CTA per viewport.
2. **Clear grouping**: Related controls are wrapped in `<Card>` containers with pastel labels.
3. **No secondary line breaks on primary actions**: Button labels are concise and punchy (e.g. "Pick between" instead of multi-line strings).
4. **Resilient Web & Native Execution**: No Node-specific globals (`global.cancelAnimationFrame`). All animations are guarded and cross-platform safe.
