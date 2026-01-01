// ═══════════════════════════════════════════════════════════════════════════════
// TERRA MEDIA PLAYER - PREMIUM COLOR SYSTEM
// Inspired by Apple Design Language
// Ultra-Premium Dark Theme: Deep Black, Pure White, Elegant Blue
// ═══════════════════════════════════════════════════════════════════════════════

export const Colors = {
  // ─────────────────────────────────────────────────────────────────────────────
  // PRIMARY BRAND - Apple-Inspired Blue
  // ─────────────────────────────────────────────────────────────────────────────
  primary: '#007AFF',           // iOS Blue - Main accent
  primaryLight: '#5AC8FA',      // Light Blue - Tint
  primaryDark: '#0051D5',       // Deep Blue - Pressed state
  primaryMuted: '#0A84FF',      // Accessibility Blue
  
  // ─────────────────────────────────────────────────────────────────────────────
  // SECONDARY ACCENT - Subtle Cyan for Video
  // ─────────────────────────────────────────────────────────────────────────────
  secondary: '#32ADE6',         // Sky Blue
  secondaryLight: '#64D2FF',    // Light Cyan
  secondaryDark: '#0891B2',     // Deep Cyan
  
  // ─────────────────────────────────────────────────────────────────────────────
  // BACKGROUNDS - Ultra Premium AMOLED
  // ─────────────────────────────────────────────────────────────────────────────
  background: '#000000',        // Pure Black (AMOLED optimized)
  surface: '#0D0D0D',           // Elevated surface
  surfaceLight: '#141414',      // Card background
  surfaceElevated: '#1A1A1A',   // Modal/Sheet
  surfaceHover: '#1F1F1F',      // Hover state
  surfacePressed: '#242424',    // Pressed state
  
  // Glass effect backgrounds (for blur overlays)
  glass: 'rgba(28, 28, 30, 0.72)',
  glassLight: 'rgba(44, 44, 46, 0.72)',
  
  // ─────────────────────────────────────────────────────────────────────────────
  // TEXT HIERARCHY - Premium Typography
  // ─────────────────────────────────────────────────────────────────────────────
  textPrimary: '#FFFFFF',       // Pure White - Headlines
  textSecondary: '#8E8E93',     // System Gray - Body
  textTertiary: '#636366',      // System Gray 2 - Captions
  textDisabled: '#3A3A3C',      // System Gray 4 - Disabled
  textMuted: '#48484A',         // System Gray 3
  textPlaceholder: '#636366',   // Placeholder text
  
  // ─────────────────────────────────────────────────────────────────────────────
  // BORDERS & SEPARATORS - Subtle Definition
  // ─────────────────────────────────────────────────────────────────────────────
  border: '#1C1C1E',            // Separator
  borderLight: '#2C2C2E',       // Light separator
  borderFocus: '#007AFF',       // Focus ring
  divider: '#1C1C1E',           // Section divider
  separator: '#38383A',         // Opaque separator
  
  // ─────────────────────────────────────────────────────────────────────────────
  // SEMANTIC - System Feedback Colors
  // ─────────────────────────────────────────────────────────────────────────────
  success: '#32D74B',           // System Green
  successLight: '#30D158',
  warning: '#FF9F0A',           // System Orange
  warningLight: '#FFD60A',      // System Yellow
  error: '#FF453A',             // System Red
  errorLight: '#FF6961',
  info: '#007AFF',              // System Blue
  
  // ─────────────────────────────────────────────────────────────────────────────
  // INTERACTIVE STATES
  // ─────────────────────────────────────────────────────────────────────────────
  ripple: 'rgba(0, 122, 255, 0.12)',
  rippleLight: 'rgba(255, 255, 255, 0.06)',
  highlight: 'rgba(0, 122, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.85)',
  overlayLight: 'rgba(0, 0, 0, 0.65)',
  overlayUltra: 'rgba(0, 0, 0, 0.95)',
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PLAYER SPECIFIC - Premium Audio Experience
  // ─────────────────────────────────────────────────────────────────────────────
  progressTrack: '#3A3A3C',
  progressFill: '#007AFF',
  progressBuffer: 'rgba(0, 122, 255, 0.3)',
  progressKnob: '#FFFFFF',
  
  // Mini Player
  miniPlayerBg: '#0D0D0D',
  miniPlayerBorder: '#1C1C1E',
  
  // Now Playing
  nowPlayingBg: '#000000',
  albumArtShadow: 'rgba(0, 122, 255, 0.25)',
  albumArtGlow: 'rgba(0, 122, 255, 0.15)',
  
  // ─────────────────────────────────────────────────────────────────────────────
  // TAB BAR - Premium Navigation
  // ─────────────────────────────────────────────────────────────────────────────
  tabBarBg: '#000000',
  tabBarBorder: '#1C1C1E',
  tabBarActive: '#007AFF',
  tabBarInactive: '#636366',
  
  // ─────────────────────────────────────────────────────────────────────────────
  // FAVORITES / LIKES
  // ─────────────────────────────────────────────────────────────────────────────
  favorite: '#FF2D55',          // System Pink
  favoriteActive: '#FF375F',
  
  // ─────────────────────────────────────────────────────────────────────────────
  // BASE COLORS
  // ─────────────────────────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // White Opacity Variants
  white95: 'rgba(255, 255, 255, 0.95)',
  white90: 'rgba(255, 255, 255, 0.90)',
  white70: 'rgba(255, 255, 255, 0.70)',
  white50: 'rgba(255, 255, 255, 0.50)',
  white30: 'rgba(255, 255, 255, 0.30)',
  white15: 'rgba(255, 255, 255, 0.15)',
  white10: 'rgba(255, 255, 255, 0.10)',
  white05: 'rgba(255, 255, 255, 0.05)',
  
  // Blue Opacity Variants
  blue50: 'rgba(0, 122, 255, 0.50)',
  blue30: 'rgba(0, 122, 255, 0.30)',
  blue20: 'rgba(0, 122, 255, 0.20)',
  blue15: 'rgba(0, 122, 255, 0.15)',
  blue10: 'rgba(0, 122, 255, 0.10)',
  
  // Playlist Cover Colors (Premium blue spectrum)
  playlistColors: [
    '#007AFF', // iOS Blue
    '#5856D6', // Purple
    '#AF52DE', // System Purple
    '#32ADE6', // Sky Blue
    '#64D2FF', // Cyan
    '#0A84FF', // Accessibility Blue
    '#5AC8FA', // Light Blue
    '#30B0C7', // Teal
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PREMIUM GRADIENTS
// ═══════════════════════════════════════════════════════════════════════════════
export const Gradients = {
  primary: ['#007AFF', '#5856D6'],
  secondary: ['#32ADE6', '#0891B2'],
  premium: ['#007AFF', '#AF52DE'],
  dark: ['#1C1C1E', '#000000'],
  card: ['#141414', '#0D0D0D'],
  button: ['#0A84FF', '#007AFF'],
  glow: ['rgba(0, 122, 255, 0.35)', 'rgba(0, 122, 255, 0)'],
  shimmer: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0)'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ELEVATION SHADOWS - Apple-Style Depth
// ═══════════════════════════════════════════════════════════════════════════════
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  glowStrong: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 12,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY PRESETS - Apple SF-Style
// ═══════════════════════════════════════════════════════════════════════════════
export const Typography = {
  // Large Titles
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
    lineHeight: 25,
  },
  
  // Headlines
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  
  // Body
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  
  // Callout
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  
  // Subhead
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  subheadBold: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  
  // Footnote
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
    lineHeight: 18,
  },
  footnoteBold: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: -0.08,
    lineHeight: 18,
  },
  
  // Caption
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
    lineHeight: 13,
  },
};

export default Colors;
