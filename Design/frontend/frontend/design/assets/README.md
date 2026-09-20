# Design Assets

This directory contains key visual assets for the Vibe Check application and design system:

| File | Type | Dimensions / Format | Purpose |
| :--- | :--- | :--- | :--- |
| `icon.svg` | SVG Vector | Scalable vector | Primary app mark, vector branding, and SVG favicon / web touch icon. |
| `adaptive-icon.png` | PNG Raster | 1024×1024 | Android adaptive icon foreground layer, iOS app icon base. |
| `golden-hour.svg` | SVG Vector | Scalable vector | Golden hour mood illustration and atmospheric vector banner. |

### Usage in React Native
```tsx
import { Image } from 'react-native';

// For raster assets:
<Image source={require('../assets/adaptive-icon.png')} style={{ width: 64, height: 64 }} />

// For vector components:
// See `frontend/design/components/AnimatedVibeShowcase.tsx` and `frontend/design/icons/`
```
