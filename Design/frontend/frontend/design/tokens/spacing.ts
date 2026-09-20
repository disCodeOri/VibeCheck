/**
 * Vibe Check Design System - Spacing & Sizing Tokens
 */

export const space = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const sizes = {
  touch: 48,     // Minimum comfortable tap target size (WCAG AA standard)
  icon: 22,      // Standard interface icon size
  iconSmall: 16, // Secondary badge/chip icon size
  iconLarge: 32, // Hero action icon size
  pagePadding: 20, // Standard screen horizontal margin
} as const;
