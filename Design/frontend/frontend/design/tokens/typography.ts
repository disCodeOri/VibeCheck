/**
 * Vibe Check Design System - Typography & Font Families
 * Pairs high-impact condensed display type with editorial serifs and functional geometric sans.
 */

export const fonts = {
  // Bold Display Headlines
  anton: 'Anton_400Regular',

  // Editorial Accent & Expressive Serifs
  display: 'InstrumentSerif_400Regular',
  italic: 'InstrumentSerif_400Regular_Italic',

  // Body, Buttons & Interface Elements
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
} as const;

export const typography = {
  headline: {
    fontFamily: fonts.anton,
    fontSize: 56,
    lineHeight: 56,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  hero: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 48,
  },
  heroItalic: {
    fontFamily: fonts.italic,
    fontSize: 44,
    lineHeight: 48,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 20,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bold: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  small: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  micro: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 13,
  },
} as const;
