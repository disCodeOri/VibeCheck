# Vibe Check Frontend & Design System

A modern, high-fashion React Native frontend package and design system for **Vibe Check**.  
Engineered for Expo, React Native (iOS & Android), and React Native Web.

---

## Folder Structure

```
frontend/
├── package.json               # Package definition & export map
├── README.md                  # Frontend setup and integration guide
└── design/                    # Complete Design System & Component Library
    ├── index.ts               # Root export (tokens, components, icons, screens)
    ├── DESIGN_SYSTEM.md       # Comprehensive design language documentation
    │
    ├── tokens/                # Core Design Tokens
    │   ├── colors.ts          # Cobalt, midnight ink, soft pastel palettes
    │   ├── typography.ts      # Anton, Instrument Serif, DM Sans configurations
    │   ├── spacing.ts         # 4px/8px layout grid and touch target standards
    │   ├── radii.ts           # Corner radii & animation timing tokens
    │   └── index.ts           # Unified token bundle
    │
    ├── fonts/                 # Typography & Font Loading
    │   ├── font-loader.ts     # useVibeCheckFonts() hook for Expo
    │   └── README.md          # Font setup instructions
    │
    ├── icons/                 # Custom Vector Glyphs
    │   ├── NavigationIcons.tsx# 9:16 story frame navigation icons (Check, Loox, Chicfit, History, You)
    │   └── index.ts           # Icon exports
    │
    ├── components/            # Reusable UI Primitives & Advanced Panels
    │   ├── ui.tsx             # Button, Card, Chip, Screen, Row, Stack, T, SegmentedControl, Field
    │   ├── ActionSheet.tsx    # iOS-style bottom sheet modal selection system
    │   ├── AnimatedVibeShowcase.tsx # SVG vector artwork, dynamic soundwave equalizers, live vibe pulse
    │   ├── InkPanel.tsx       # Midnight navy vector gradient brush hero card
    │   ├── MediaPreview.tsx   # Responsive image and video frame with color swatch fallback
    │   └── index.ts           # Component bundle
    │
    ├── assets/                # Visual Branding Assets
    │   ├── icon.svg           # Scalable vector app mark
    │   ├── adaptive-icon.png  # 1024x1024 app icon raster
    │   ├── golden-hour.svg    # Golden hour vector illustration
    │   └── README.md          # Asset specifications
    │
    └── screens/               # Ready-to-Use React Native Screens
        ├── tabs/              # Bottom Tab Dashboards
        │   ├── CheckScreen.tsx    # Main home dashboard with Anton headline & animated showcase
        │   ├── LooxScreen.tsx     # Aesthetic benchmarks, style DNA presets, traits, versions
        │   ├── ChicfitScreen.tsx  # Outfit checks, occasion chips, smart swaps, closet drawer
        │   ├── HistoryScreen.tsx  # Chronological log with verdict scorecards & decision badges
        │   └── YouScreen.tsx      # Decluttered profile & settings hub with interactive modal sheets
        │
        ├── check/             # Check Flow Screens
        │   ├── NewCheckScreen.tsx # Photo intake, 4x3 mood selector, 2x2 audience grid
        │   ├── ResultScreen.tsx   # Scorecard, verdict, top fix tweak, working elements
        │   └── CaptionsScreen.tsx # Safe/Signature/Bold selector, quote card, rewrite toolkit
        │
        ├── styles/            # Reference Styles Screens
        │   ├── StylesIndexScreen.tsx # Style blueprint catalog and filters
        │   └── StyleDetailScreen.tsx # Deep DNA breakdown, lighting, and palette rules
        │
        ├── taste/             # Taste Fingerprint Screen
        │   └── TasteScreen.tsx    # Aesthetic pattern learning progress & privacy toggles
        │
        └── index.ts           # Screen bundle exports
```

---

## Quick Start

### 1. Installation

Install peer dependencies into your Expo or React Native project:

```bash
npx expo install react-native-svg @expo-google-fonts/anton @expo-google-fonts/instrument-serif @expo-google-fonts/dm-sans expo-font
```

### 2. Load Fonts

Wrap your root layout with `useVibeCheckFonts`:

```tsx
import { useVibeCheckFonts } from './frontend/design';

export default function RootLayout() {
  const [fontsLoaded] = useVibeCheckFonts();

  if (!fontsLoaded) {
    return null;
  }

  return <Slot />;
}
```

### 3. Using Design Tokens

```tsx
import { colors, fonts, spacing } from './frontend/design';

const styles = StyleSheet.create({
  header: {
    fontFamily: fonts.anton,
    fontSize: 48,
    color: colors.ink,
  },
  card: {
    backgroundColor: colors.skySoft,
    borderRadius: 16,
    padding: spacing.lg,
  },
});
```

### 4. Using UI Components

```tsx
import { Button, Card, Chip, Row, T, InkPanel } from './frontend/design';

export function Example() {
  return (
    <Card style={{ padding: 18, gap: 12 }}>
      <T variant="title">Pick Your Direction</T>
      <Row style={{ gap: 8 }}>
        <Chip label="Effortless" selected />
        <Chip label="Aesthetic" />
      </Row>
      <Button label="Check my story" icon="arrow-right" onPress={() => {}} />
    </Card>
  );
}
```

### 5. Using Ready-to-Use Screens

All screens can be dropped directly into your Expo Router or React Navigation stack:

```tsx
// app/(tabs)/loox.tsx
import { LooxScreen } from '../../frontend/design';

export default function LooxTab() {
  return <LooxScreen />;
}
```

---

## Design System Documentation

Read [`frontend/design/DESIGN_SYSTEM.md`](file:///c:/Users/admin/OneDrive/Desktop/AWS%20Hackathon/frontend/design/DESIGN_SYSTEM.md) for full token tables, typography rules, layout spacing, accessibility standards, and component API references.
