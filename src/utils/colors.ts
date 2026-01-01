// Premium Color Palette for Terra Media Player
// Modern Dark Theme: Black, White, Blue - Ultra Premium Design

export const Colors = {
  // ═══════════════════════════════════════════════════════════════════
  // PRIMARY BRAND COLORS
  // ═══════════════════════════════════════════════════════════════════
  primary: '#3B82F6',           // Vibrant Blue (Main CTA)
  primaryLight: '#60A5FA',      // Light Blue (Hover states)
  primaryDark: '#2563EB',       // Deep Blue (Active states)
  primaryMuted: '#1D4ED8',      // Muted Blue (Subtle accents)
  
  // ═══════════════════════════════════════════════════════════════════
  // SECONDARY ACCENT (Cyan - For Video section)
  // ═══════════════════════════════════════════════════════════════════
  secondary: '#06B6D4',         // Cyan Blue
  secondaryLight: '#22D3EE',    // Light Cyan
  secondaryDark: '#0891B2',     // Deep Cyan
  
  // ═══════════════════════════════════════════════════════════════════
  // BACKGROUNDS - True AMOLED Black Theme
  // ═══════════════════════════════════════════════════════════════════
  background: '#000000',        // Pure Black (AMOLED)
  surface: '#0A0A0A',           // Near Black (Cards base)
  surfaceLight: '#111111',      // Elevated Surface
  surfaceElevated: '#161616',   // Modal/Sheet Background
  surfaceHover: '#1C1C1C',      // Hover state
  
  // ═══════════════════════════════════════════════════════════════════
  // TEXT HIERARCHY - Crisp White
  // ═══════════════════════════════════════════════════════════════════
  textPrimary: '#FFFFFF',       // Pure White (Headlines)
  textSecondary: '#A1A1AA',     // Cool Gray (Body text)
  textTertiary: '#71717A',      // Muted Gray (Captions)
  textDisabled: '#3F3F46',      // Disabled state
  textMuted: '#52525B',         // Very subtle text
  
  // ═══════════════════════════════════════════════════════════════════
  // BORDERS & DIVIDERS
  // ═══════════════════════════════════════════════════════════════════
  border: '#1F1F1F',            // Subtle Border
  borderLight: '#2A2A2A',       // Light Border
  borderFocus: '#3B82F6',       // Focus ring
  divider: '#141414',           // Section Divider
  
  // ═══════════════════════════════════════════════════════════════════
  // SEMANTIC COLORS
  // ═══════════════════════════════════════════════════════════════════
  success: '#10B981',           // Emerald Green
  successLight: '#34D399',
  warning: '#F59E0B',           // Amber
  warningLight: '#FBBF24',
  error: '#EF4444',             // Red
  errorLight: '#F87171',
  info: '#3B82F6',              // Blue
  
  // ═══════════════════════════════════════════════════════════════════
  // INTERACTIVE STATES
  // ═══════════════════════════════════════════════════════════════════
  ripple: 'rgba(59, 130, 246, 0.15)',
  rippleLight: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.6)',
  overlayUltra: 'rgba(0, 0, 0, 0.9)',
  
  // ═══════════════════════════════════════════════════════════════════
  // PLAYER SPECIFIC
  // ═══════════════════════════════════════════════════════════════════
  progressTrack: '#1F1F1F',
  progressFill: '#3B82F6',
  progressBuffer: 'rgba(59, 130, 246, 0.25)',
  progressKnob: '#FFFFFF',
  
  // Mini Player
  miniPlayerBg: '#0A0A0A',
  miniPlayerBorder: '#1A1A1A',
  
  // Now Playing
  nowPlayingBg: '#000000',
  albumArtShadow: 'rgba(59, 130, 246, 0.3)',
  
  // ═══════════════════════════════════════════════════════════════════
  // TAB BAR
  // ═══════════════════════════════════════════════════════════════════
  tabBarBg: '#000000',
  tabBarBorder: '#1A1A1A',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#52525B',
  
  // ═══════════════════════════════════════════════════════════════════
  // FAVORITES / LIKES
  // ═══════════════════════════════════════════════════════════════════
  favorite: '#EF4444',
  favoriteActive: '#F87171',
  
  // ═══════════════════════════════════════════════════════════════════
  // BASE COLORS
  // ═══════════════════════════════════════════════════════════════════
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // White Opacity Variants
  white90: 'rgba(255, 255, 255, 0.9)',
  white70: 'rgba(255, 255, 255, 0.7)',
  white50: 'rgba(255, 255, 255, 0.5)',
  white30: 'rgba(255, 255, 255, 0.3)',
  white10: 'rgba(255, 255, 255, 0.1)',
  white05: 'rgba(255, 255, 255, 0.05)',
  
  // Blue Opacity Variants (for glows)
  blue50: 'rgba(59, 130, 246, 0.5)',
  blue30: 'rgba(59, 130, 246, 0.3)',
  blue20: 'rgba(59, 130, 246, 0.2)',
  blue10: 'rgba(59, 130, 246, 0.1)',
  
  // Playlist Cover Colors (Blue spectrum only)
  playlistColors: [
    '#3B82F6', // Blue
    '#2563EB', // Deep Blue
    '#1D4ED8', // Royal Blue
    '#06B6D4', // Cyan
    '#0891B2', // Teal
    '#0EA5E9', // Sky Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet (slight purple is acceptable)
  ],
};

// ═══════════════════════════════════════════════════════════════════
// PREMIUM GRADIENTS
// ═══════════════════════════════════════════════════════════════════
export const Gradients = {
  primary: ['#3B82F6', '#2563EB'],
  secondary: ['#06B6D4', '#0891B2'],
  premium: ['#3B82F6', '#06B6D4'],
  dark: ['#111111', '#000000'],
  card: ['#0F0F0F', '#0A0A0A'],
  button: ['#3B82F6', '#2563EB'],
  glow: ['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0)'],
};

// ═══════════════════════════════════════════════════════════════════
// ELEVATION SHADOWS (Premium depth)
// ═══════════════════════════════════════════════════════════════════
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  glow: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  glowStrong: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
  },
};

// ═══════════════════════════════════════════════════════════════════
// BLUR EFFECTS (for iOS)
// ═══════════════════════════════════════════════════════════════════
export const Blur = {
  light: 10,
  medium: 20,
  heavy: 40,
  ultra: 80,
};

export default Colors;
