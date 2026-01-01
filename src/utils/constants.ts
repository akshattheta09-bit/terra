// Constants for Terra Media Player

// App info
export const APP_NAME = 'Terra';
export const APP_VERSION = '1.0.0';

// Database
export const DATABASE_NAME = 'terra.db';
export const DATABASE_VERSION = 1;

// Storage keys (AsyncStorage)
export const STORAGE_KEYS = {
  SETTINGS: '@terra_settings',
  QUEUE: '@terra_queue',
  CURRENT_TRACK: '@terra_current_track',
  PLAY_POSITION: '@terra_play_position',
  THEME: '@terra_theme',
  FIRST_LAUNCH: '@terra_first_launch',
  SEARCH_HISTORY: '@terra_search_history',
};

// Scan paths for Android
export const SCAN_PATHS = [
  '/storage/emulated/0/',
  '/storage/emulated/0/Music/',
  '/storage/emulated/0/Movies/',
  '/storage/emulated/0/DCIM/',
  '/storage/emulated/0/Download/',
  '/storage/emulated/0/Documents/',
  '/sdcard/',
  '/sdcard/Music/',
  '/sdcard/Movies/',
  '/sdcard/Download/',
];

// ═══════════════════════════════════════════════════════════════════════════════
// UI DIMENSIONS - Apple-Inspired Premium Spacing
// Great breathing space, luxury feel
// ═══════════════════════════════════════════════════════════════════════════════
export const DIMENSIONS = {
  // Spacing - More generous for premium feel
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Border radius - Softer, more refined
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  
  // Touch targets (minimum 44dp for iOS, 48dp for Android)
  touchTarget: {
    min: 44,
    default: 48,
    large: 56,
    xl: 64,
  },
  
  // Icon sizes
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 48,
  },
  
  // Font sizes - Apple Dynamic Type inspired
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 22,
    xxxl: 28,
    display: 34,
  },
  
  // Component heights - More breathing room
  header: 60,
  headerLarge: 96,
  tabBar: 83,       // iOS standard with home indicator
  miniPlayer: 72,   // Larger for better touch
  listItem: 64,     // More breathing room
  listItemCompact: 56,
  listItemDetailed: 80,
  button: 50,
  buttonLarge: 56,
  searchBar: 52,
  
  // Album art sizes - Larger for premium feel
  albumArt: {
    thumbnail: 56,
    small: 72,
    medium: 140,
    large: 220,
    fullscreen: 320,
  },
  
  // Video thumbnail sizes
  videoThumbnail: {
    small: { width: 120, height: 68 },
    medium: { width: 180, height: 101 },
    large: { width: 240, height: 135 },
  },
};

// Animation durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

// Playback
export const PLAYBACK = {
  seekInterval: 10, // seconds
  volumeStep: 0.1,
  brightnessStep: 0.1,
  controlsAutoHideDelay: 3000, // milliseconds
  seekPreviewDelay: 300, // milliseconds
  doubleTapDelay: 300, // milliseconds
};

// Library
export const LIBRARY = {
  recentlyPlayedLimit: 100,
  mostPlayedLimit: 50,
  searchHistoryLimit: 10,
  pageSize: 50,
};

// File size limits
export const FILE_SIZE = {
  minAudioBytes: 50 * 1024, // 50KB minimum
  minVideoBytes: 100 * 1024, // 100KB minimum
  maxThumbnailBytes: 5 * 1024 * 1024, // 5MB max thumbnail
};

// Subtitle settings
export const SUBTITLE = {
  fontSizes: {
    small: 14,
    medium: 18,
    large: 24,
  },
  colors: {
    white: '#FFFFFF',
    yellow: '#FFFF00',
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    cyan: '#00FFFF',
  },
  maxDelay: 10000, // +/- 10 seconds
  delayStep: 100, // 100ms increments
};

// Equalizer presets (frequency gains in dB)
export const EQUALIZER_PRESETS = {
  normal: [0, 0, 0, 0, 0],
  bass_boost: [5, 4, 2, 0, 0],
  treble_boost: [0, 0, 2, 4, 5],
  pop: [1, 2, 3, 2, 1],
  rock: [4, 2, 0, 2, 4],
  jazz: [3, 2, 1, 2, 3],
  classical: [4, 3, 0, 2, 3],
  metal: [5, 3, 0, 3, 5],
};
