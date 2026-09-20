/**
 * Vibe Check Design System - Color Palette
 * Derived from the brand aesthetic: Royal Cobalt Blue, Clean Surfaces, and Soft Mood Pastels.
 */

export const colors = {
  // Brand Core
  blue: '#005BFF',        // Primary energetic cobalt blue
  blueDark: '#003FAF',    // Deep cobalt for pressed states, active indicators, and high-contrast accents
  blueSoft: '#E8F0FF',    // Ultra-soft sky tint for highlights, pills, and backgrounds

  // Canvas & Surfaces
  canvas: '#F5F9FF',      // Cool tinted background canvas (readable breathing room)
  surface: '#FFFFFF',     // Pure crisp white card surface
  cardBorder: '#DCE6F5',  // Subtle hairline border for elevated cards
  line: '#D3E1F5',        // Structural dividers and pill borders

  // Typography & Monochromes
  ink: '#080D23',         // Deep midnight navy for primary headlines and high-emphasis text
  navy: '#101C31',        // Structured dark tone
  muted: '#48628D',       // Slate blue for secondary labels, hints, and timestamps

  // Creative Mood Pastels & Accents
  sky: '#0284C7',
  skySoft: '#E8F4FE',     // Light cerulean for quick actions and media

  lavender: '#6941C6',
  lavenderSoft: '#F3EFFF',// Royal violet for comparison and layer tools

  peach: '#D95D39',
  peachSoft: '#FFF2EB',   // Warm rose/coral for taste profiles and recommendations

  sage: '#2E7D47',
  sageSoft: '#EBF7EE',    // Botanical green for reference styles and positive verdicts

  amber: '#8B5910',
  amberSoft: '#FFF8E6',   // Golden warmth for cautions and badges

  danger: '#B33440',
  dangerSoft: '#FFF0F0',  // Crimson for destructive actions and delete prompts

  green: '#087F65',
  greenSoft: '#E3F6EE',   // Verified emerald for confirmed closet garments
} as const;

export type ColorToken = keyof typeof colors;
