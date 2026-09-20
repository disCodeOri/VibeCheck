/**
 * Vibe Check Design System - Corner Radii & Shadows
 */

export const radius = {
  xs: 4,
  sm: 8,       // Tags, chips, badges
  md: 12,      // Buttons, action sheet choices
  lg: 16,      // Secondary cards, quick action tiles
  xl: 20,      // Primary elevated panels, hero cards
  modal: 28,   // Bottom sheet tops & dialog frames
  pill: 999,   // Fully rounded pill buttons and status indicators
} as const;

export const motion = {
  quick: 150,  // Tap feedback, micro-interactions
  normal: 240, // Sheet transitions, accordion expands
  gentle: 400, // Pulse waves, equalizer flows
} as const;
